const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');
class LikePostNotificationHandler extends NotificationHandlerAbstract {
  notificationMessage({
    personFirstName,
    personLastName,
    userType,
    venueName,
    brandName,
  }) {
    if (userType === 'VENUE') {
      return `${venueName} liked your post`;
    }
    if (userType === 'BRAND') {
      return `${brandName} liked your post`;
    }
    return `${personFirstName} ${personLastName} liked your post`;
  }
  shouldRun() {
    return (
      this.event.eventName === 'INSERT' &&
      this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_USERLIKESTABLE_NAME
      )
    );
  }

  async doHandle() {
    const {
      userId: { S: userId },
      postId: { S: postId },
    } = this.event.dynamodb.NewImage;
    const authorData = await this.userRepository.findUsersData([userId]);
    if (authorData.length === 0) {
      throw new Error('Author not found');
    }
    const author = authorData[0];

    const posts = await this.postRepository.findPosts([postId]);

    if (posts.length === 0) {
      throw new Error('Post not found');
    }

    const post = posts[0];
    const postAuthorData = await this.userRepository.findUsersData([
      post.authorId,
    ]);

    if (post.authorId === userId) {
      throw new Error('The post owner liked his own post');
    }

    if (postAuthorData.length === 0) {
      throw new Error('Post not found');
    }
    const postAuthor = postAuthorData[0];

    await this.notificationRepository.saveNotification({
      userId: postAuthor.id,
      message: this.notificationMessage(author),
      link: `whiskeysocial://post/${post.id}`,
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
      `whiskeysocial://post/${post.id}`,
      undefined,
      notificationCount + dmUnreadCount
    );

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = LikePostNotificationHandler;
