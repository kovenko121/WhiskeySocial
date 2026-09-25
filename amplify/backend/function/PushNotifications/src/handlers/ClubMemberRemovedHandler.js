const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a club member is removed/kicked.
 * Triggered on ClubMember DELETE event where OldImage.status was ACTIVE.
 *
 * Note: Since this is a DELETE event, we can't track who performed the action.
 * V1 uses club owner as relatedUserId. V2 soft delete would enable tracking the actual admin.
 *
 * IMPORTANT: Block action (status BLOCKED) should NOT trigger notification - blocking is silent.
 * This handler only runs for ACTIVE members being removed, not BLOCKED transitions.
 */
class ClubMemberRemovedHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'REMOVE') {
      return false;
    }

    if (
      !this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
      )
    ) {
      return false;
    }

    const oldStatus = this.event.dynamodb.OldImage?.status?.S;
    const deletionType = this.event.dynamodb.OldImage?.deletionType?.S;

    // Skip if user left voluntarily (not an admin removal)
    if (deletionType === 'USER_LEFT') {
      return false;
    }

    return oldStatus === 'ACTIVE';
  }

  async doHandle() {
    const { OldImage } = this.event.dynamodb;
    const userId = OldImage.userId?.S;
    const clubId = OldImage.clubId?.S;

    if (!userId || !clubId) {
      console.log('Missing userId or clubId in ClubMemberRemovedHandler');
      return;
    }

    const [userData, club] = await Promise.all([
      this.userRepository.findUsersData([userId]),
      this.clubRepository.findClubById(clubId),
    ]);

    if (userData.length === 0) {
      console.log('User not found in ClubMemberRemovedHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubMemberRemovedHandler');
      return;
    }

    const user = userData[0];

    const inAppMessage = `You were removed from ${club.clubName}`;
    const pushMessage = `You've been removed from ${club.clubName}`;

    const clubPicture = club.profilePicture
      ? {
          bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
          key: club.profilePicture,
          region: process.env.REGION,
        }
      : null;

    await this.notificationRepository.saveNotification({
      userId: user.id,
      message: inAppMessage,
      link: `whiskeysocial://club/${clubId}`,
      relatedUserId: club.createdBy,
      type: 'CLUB_MEMBER_REMOVED',
      secondaryPicture: clubPicture,
    });

    if (user.expoTokens && user.expoTokens.length > 0) {
      this.sendNotification.queueNotification(
        user.expoTokens,
        pushMessage,
        `whiskeysocial://club/${clubId}`,
        'Removed from Club'
      );

      await this.sendNotification.sendNotification();
      await this.sendNotification.checkReceipts();
    }
  }
}

module.exports = ClubMemberRemovedHandler;
