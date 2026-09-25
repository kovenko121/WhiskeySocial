const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles push notifications when a user is tagged in a regular (non-club) post.
 * Triggered on Post INSERT event where clubId is NOT set.
 *
 * Note: In-app notifications for tagged users are already created by PostInsertHandle Lambda.
 * This handler only sends push notifications to avoid duplicates.
 *
 * Tagged users are identified from:
 * - inlineTags: @mentions within post text (where type: 'USER')
 * - references: Structured user tags (where type: 'USER')
 */
class RegularPostTagHandler extends NotificationHandlerAbstract {
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

    // Only run for regular posts (no clubId)
    const clubId = this.event.dynamodb.NewImage?.clubId?.S;
    if (clubId) {
      return false;
    }

    // Check if there are any potential tags (defer extraction to doHandle)
    const hasInlineTags = this.event.dynamodb.NewImage?.inlineTags?.L?.length > 0;
    const hasReferences = this.event.dynamodb.NewImage?.references?.L?.length > 0;
    return hasInlineTags || hasReferences;
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const postId = NewImage.id?.S;
    const authorId = NewImage.authorId?.S;
    const content = NewImage.description?.S || '';

    if (!postId || !authorId) {
      console.log('Missing postId or authorId in RegularPostTagHandler');
      return;
    }

    const taggedUserIds = this._extractTaggedUserIds(NewImage);

    if (taggedUserIds.length === 0) {
      console.log('No tagged users found in RegularPostTagHandler');
      return;
    }

    // Deduplicate and filter out self-tags
    const uniqueTaggedUserIds = [...new Set(taggedUserIds)].filter(
      (id) => id !== authorId
    );

    if (uniqueTaggedUserIds.length === 0) {
      console.log('No users to notify after filtering in RegularPostTagHandler');
      return;
    }

    const authorData = await this.userRepository.findUsersData([authorId]);

    if (authorData.length === 0) {
      console.log('Author not found in RegularPostTagHandler');
      return;
    }

    const author = authorData[0];
    const authorName = this._getAuthorDisplayName(author);
    const truncatedContent =
      content.length > 50 ? `${content.substring(0, 50)}...` : content;
    const pushMessage = truncatedContent
      ? `${authorName} tagged you: ${truncatedContent}`
      : `${authorName} tagged you in a post`;

    const taggedUsers = await this.userRepository.findUsersData(uniqueTaggedUserIds);

    for (const taggedUser of taggedUsers) {
      if (!taggedUser.canReceiveNotification('activities')) {
        console.log(`User ${taggedUser.id} has activities notifications disabled`);
        continue;
      }

      if (taggedUser.expoTokens && taggedUser.expoTokens.length > 0) {
        this.sendNotification.queueNotification(
          taggedUser.expoTokens,
          pushMessage,
          `whiskeysocial://post/${postId}`
        );
      }
    }

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }

  _extractTaggedUserIds(newImage) {
    const userIds = [];

    // Extract from inline tags (@mentions)
    if (newImage.inlineTags?.L) {
      for (const tag of newImage.inlineTags.L) {
        const type = tag.M?.type?.S;
        const entityId = tag.M?.entityId?.S;
        if (type === 'USER' && entityId) {
          userIds.push(entityId);
        }
      }
    }

    // Extract from references (Tag People button)
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

  _getAuthorDisplayName(author) {
    if (author.userType === 'VENUE') {
      return author.venueName || 'A venue';
    }
    if (author.userType === 'BRAND') {
      return author.brandName || 'A brand';
    }
    if (author.personFirstName && author.personLastName) {
      return `${author.personFirstName} ${author.personLastName}`;
    }
    return author.username || 'Someone';
  }
}

module.exports = RegularPostTagHandler;
