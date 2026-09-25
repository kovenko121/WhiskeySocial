const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a post is pinned in a club.
 * Triggered on Club MODIFY event when pinnedPostId changes.
 * Sends notification to all active members of the club.
 */
class ClubPostPinnedHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'MODIFY') {
      return false;
    }

    if (
      !this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME
      )
    ) {
      return false;
    }

    const oldPinnedPostId = this.event.dynamodb.OldImage?.pinnedPostId?.S;
    const newPinnedPostId = this.event.dynamodb.NewImage?.pinnedPostId?.S;

    return newPinnedPostId && newPinnedPostId !== oldPinnedPostId;
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const clubId = NewImage.id?.S;
    const clubName = NewImage.clubName?.S;
    const pinnedPostId = NewImage.pinnedPostId?.S;
    const adminId = NewImage.pinnedBy?.S;
    const clubProfilePicture = NewImage.profilePicture?.S
      ? {
          bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
          key: NewImage.profilePicture.S,
          region: process.env.REGION,
        }
      : null;

    if (!clubId || !pinnedPostId) {
      console.log('Missing clubId or pinnedPostId in ClubPostPinnedHandler');
      return;
    }

    const [post, members] = await Promise.all([
      this.postRepository.findPostById(pinnedPostId),
      this.clubRepository.findActiveMembers(clubId),
    ]);

    if (!post) {
      console.log('Pinned post not found in ClubPostPinnedHandler');
      return;
    }

    const inAppMessage = `A post was pinned in ${clubName}`;

    // Build push message based on post content type
    let pushMessage;
    const trimmedContent = post.content?.trim();
    if (trimmedContent) {
      const truncated =
        trimmedContent.length > 30
          ? `${trimmedContent.substring(0, 30)}...`
          : trimmedContent;
      pushMessage = `New pinned post in ${clubName}: ${truncated}`;
    } else if (post.images && post.images.length > 0) {
      pushMessage = `New pinned photo in ${clubName}`;
    } else {
      pushMessage = `New pinned post in ${clubName}`;
    }

    if (members.length === 0) {
      console.log('No active members found for club in ClubPostPinnedHandler');
      return;
    }

    const memberUserIds = members.map((member) => member.userId);
    const memberUsers = await this.userRepository.findUsersData(memberUserIds);

    for (const memberUser of memberUsers) {
      // Skip the admin who pinned the post
      if (memberUser.id === adminId) {
        continue;
      }

      // Always save in-app notification
      await this.notificationRepository.saveNotification({
        userId: memberUser.id,
        message: inAppMessage,
        link: `whiskeysocial://post/${pinnedPostId}`,
        relatedUserId: adminId || NewImage.createdBy?.S,
        type: 'CLUB_POST_PINNED',
        secondaryPicture: clubProfilePicture,
      });

      // Only send push if user can receive notifications
      if (!memberUser.canReceiveNotification('clubs')) {
        continue;
      }

      this.sendNotification.queueNotification(
        memberUser.expoTokens,
        pushMessage,
        `whiskeysocial://post/${pinnedPostId}`,
        clubName
      );
    }

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = ClubPostPinnedHandler;
