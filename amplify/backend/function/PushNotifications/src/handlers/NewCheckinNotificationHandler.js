const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');
class NewCheckinNotificationHandler extends NotificationHandlerAbstract {
  notificationMessage({
    personFirstName,
    personLastName,
    userType,
    venueName,
    brandName,
  }) {
    if (userType === 'VENUE') {
      return `${venueName} checked in at your venue`;
    }
    if (userType === 'BRAND') {
      return `${brandName} checked in at your venue`;
    }
    return `${personFirstName} ${personLastName} checked in at your venue`;
  }
  shouldRun() {
    return (
      this.event.eventName === 'INSERT' &&
      this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME
      ) &&
      this.event.dynamodb.NewImage?.locationId != null
    );
  }

  async doHandle() {
    const {
      authorId: { S: authorId },
      id: { S: postId },
      locationId: { S: locationId },
    } = this.event.dynamodb.NewImage;
    const authorData = await this.userRepository.findUsersData([authorId]);
    if (authorData.length === 0) {
      throw new Error('Author not found');
    }

    const author = authorData[0];

    const locations = await this.userRepository.findUsersData([locationId]);

    await Promise.all(
      locations.map(async (location) => {
        await this.notificationRepository.saveNotification({
          userId: location.id,
          message: this.notificationMessage(author),
          link: `whiskeysocial://post/${postId}`,
          relatedUserId: author.id,
          type: 'ACTIVITY',
        });

        if (!location.canReceiveNotification('activities')) {
          return;
        }
        this.sendNotification.queueNotification(
          location.expoTokens,
          this.notificationMessage(author),
          `whiskeysocial://post/${postId}`
        );
      })
    );

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = NewCheckinNotificationHandler;
