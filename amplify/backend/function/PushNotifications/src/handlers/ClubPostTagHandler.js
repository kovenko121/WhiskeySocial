const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles push notifications when a user is tagged in a club post.
 * Triggered on Post INSERT event where clubId is set.
 *
 * Note: In-app notifications for tagged users are already created by PostInsertHandle Lambda.
 * This handler only sends push notifications to avoid duplicates.
 *
 * Tagged users are identified from:
 * - inlineTags: @mentions within post text (where type: 'USER')
 * - references: Structured user tags (where type: 'USER')
 */
class ClubPostTagHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'INSERT') {
      return false;
    }

    if (
      !this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME
      )
    ) {
      return false;
    }

    const clubId = this.event.dynamodb.NewImage?.clubId?.S;

    return !!clubId;
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const postId = NewImage.id?.S;
    const authorId = NewImage.authorId?.S;
    const clubId = NewImage.clubId?.S;
    const content = NewImage.description?.S || '';

    if (!postId || !authorId || !clubId) {
      console.log('Missing postId, authorId, or clubId in ClubPostTagHandler');
      return;
    }

    const taggedUserIds = this._extractTaggedUserIds(NewImage);

    if (taggedUserIds.length === 0) {
      console.log('No tagged users found in ClubPostTagHandler');
      return;
    }

    const uniqueTaggedUserIds = [...new Set(taggedUserIds)].filter(
      (id) => id !== authorId
    );

    if (uniqueTaggedUserIds.length === 0) {
      console.log('No users to notify after filtering in ClubPostTagHandler');
      return;
    }

    const [authorData, club] = await Promise.all([
      this.userRepository.findUsersData([authorId]),
      this.clubRepository.findClubById(clubId),
    ]);

    if (authorData.length === 0) {
      console.log('Author not found in ClubPostTagHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubPostTagHandler');
      return;
    }

    const author = authorData[0];
    const authorUsername = author.username || 'Someone';
    const truncatedContent =
      content.length > 50 ? `${content.substring(0, 50)}...` : content;
    const pushMessage = `@${authorUsername} mentioned you: ${truncatedContent}`;

    const taggedUsers = await this.userRepository.findUsersData(uniqueTaggedUserIds);

    for (const taggedUser of taggedUsers) {
      const isActiveMember = await this.clubRepository.isActiveMember(
        clubId,
        taggedUser.id
      );
      if (!isActiveMember) {
        console.log(
          `User ${taggedUser.id} is not an active member of club ${clubId}, skipping`
        );
        continue;
      }

      if (!taggedUser.canReceiveNotification('clubs')) {
        console.log(`User ${taggedUser.id} has clubs notifications disabled`);
        continue;
      }

      if (taggedUser.expoTokens && taggedUser.expoTokens.length > 0) {
        this.sendNotification.queueNotification(
          taggedUser.expoTokens,
          pushMessage,
          `whiskeysocial://post/${postId}`,
          club.clubName
        );
      }
    }

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }

  _extractTaggedUserIds(newImage) {
    const userIds = [];

    if (newImage.inlineTags?.L) {
      for (const tag of newImage.inlineTags.L) {
        const type = tag.M?.type?.S;
        const entityId = tag.M?.entityId?.S;
        if (type === 'USER' && entityId) {
          userIds.push(entityId);
        }
      }
    }

    if (newImage.references?.L) {
      for (const ref of newImage.references.L) {
        const type = ref.M?.type?.S;
        const id = ref.M?.id?.S;
        if (type === 'USER' && id) {
          userIds.push(id);
        }
      }
    }

    return userIds;
  }
}

module.exports = ClubPostTagHandler;
