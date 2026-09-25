const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');
class NewPostNotificationHandler extends NotificationHandlerAbstract {
  notificationMessage({
    personFirstName,
    personLastName,
    userType,
    venueName,
    brandName,
  }) {
    if (userType === 'VENUE') {
      return `${venueName} posted a new post`;
    }
    if (userType === 'BRAND') {
      return `${brandName} posted a new post`;
    }
    return `${personFirstName} ${personLastName} posted a new post`;
  }
  shouldRun() {
    return (
      this.event.eventName === 'INSERT' &&
      this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME
      )
    );
  }

  async doHandle() {
    const {
      authorId: { S: authorId },
      id: { S: postId },
    } = this.event.dynamodb.NewImage;
    const authorData = await this.userRepository.findUsersData([authorId]);
    if (authorData.length === 0) {
      throw new Error('Author not found');
    }

    const author = authorData[0];
    const {
      followers: { values: followersIds },
    } = author;

    const followers = await this.userRepository.findUsersData(followersIds);

    await Promise.all(
      followers.map(async (follower) => {
        const checkedInAtFollower =
          this.event.dynamodb.NewImage.locationId &&
          follower.id === this.event.dynamodb.NewImage.locationId.S;

        if (checkedInAtFollower) {
          return;
        }

        await this.notificationRepository.saveNotification({
          userId: follower.id,
          message: this.notificationMessage(author),
          link: `whiskeysocial://post/${postId}`,
          relatedUserId: author.id,
          type: 'ACTIVITY',
        });

        if (!follower.canReceiveNotification('activities')) {
          return;
        }
        this.sendNotification.queueNotification(
          follower.expoTokens,
          this.notificationMessage(author),
          `whiskeysocial://post/${postId}`
        );
      })
    );

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = NewPostNotificationHandler;
