const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');
class NewCommentNotificationHandler extends NotificationHandlerAbstract {
  notificationMessage({
    personFirstName,
    personLastName,
    userType,
    venueName,
    brandName,
  }) {
    if (userType === 'VENUE') {
      return `${venueName} posted a comment on your post`;
    }
    if (userType === 'BRAND') {
      return `${brandName} posted a comment on your post`;
    }
    return `${personFirstName} ${personLastName} posted a comment on your post`;
  }
  shouldRun() {
    return (
      this.event.eventName === 'INSERT' &&
      this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_COMMENTTABLE_NAME
      )
    );
  }

  async doHandle() {
    const {
      postId: { S: postId },
      authorId: { S: authorId },
    } = this.event.dynamodb.NewImage;
    const authorData = await this.userRepository.findUsersData([authorId]);
    if (authorData.length === 0) {
      throw new Error('Author not found');
    }

    const author = authorData[0];

    const posts = await this.postRepository.findPosts([postId]);

    if (posts.length === 0) {
      throw new Error('Post not found');
    }

    const post = posts[0];
    if (post.authorId === authorId) {
      throw new Error('The post owner liked his own post');
    }

    const postAuthorData = await this.userRepository.findUsersData([
      post.authorId,
    ]);

    if (postAuthorData.length === 0) {
      throw new Error('Post not found');
    }
    const postAuthor = postAuthorData[0];

    await this.notificationRepository.saveNotification({
      userId: postAuthor.id,
      message: this.notificationMessage(author),
      link: `whiskeysocial://post/${postId}`,
      relatedUserId: author.id,
      type: 'ACTIVITY',
    });

    if (!postAuthor.canReceiveNotification('activities')) {
      return;
    }

    const [notificationCount, dmUnreadCount] = await Promise.all([
      this.notificationRepository.countActivityNotificationsForUser(postAuthor.id),
      this.conversationParticipantRepository.getTotalUnreadCountForUser(postAuthor.id),
    ]);

    this.sendNotification.queueNotification(
      postAuthor.expoTokens,
      this.notificationMessage(author),
      `whiskeysocial://post/${postId}`,
      undefined,
      notificationCount + dmUnreadCount
    );

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = NewCommentNotificationHandler;
