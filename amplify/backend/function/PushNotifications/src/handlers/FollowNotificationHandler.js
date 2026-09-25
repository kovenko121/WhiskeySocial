const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');
class FollowNotificationHandler extends NotificationHandlerAbstract {
  notificationMessage({
    personFirstName,
    personLastName,
    userType,
    venueName,
    brandName,
  }) {
    if (userType === 'VENUE') {
      return `${venueName} started to follow you`;
    }
    if (userType === 'BRAND') {
      return `${brandName} started to follow you`;
    }
    return `${personFirstName} ${personLastName} started to follow you`;
  }
  shouldRun() {
    return (
      (this.event.eventName === 'MODIFY' &&
        this.event.eventSourceARN.includes(
          process.env.API_WHISKEYSOCIAL_USERTABLE_NAME
        ) &&
        this.event.dynamodb.NewImage?.followers?.SS.length === 1 &&
        !this.event.dynamodb.OldImage?.followers) ||
      this.event.dynamodb.NewImage?.followers?.SS.length >
        this.event.dynamodb.OldImage?.followers?.SS.length
    );
  }

  async doHandle() {
    const {
      id: { S: userId },
      followers: { SS: newFollowers },
    } = this.event.dynamodb.NewImage;
    const userData = await this.userRepository.findUsersData([userId]);
    if (userData.length === 0) {
      throw new Error('User not found');
    }

    const user = userData[0];
    const followerData = await this.userRepository.findUsersData(
      this.event.dynamodb.OldImage?.followers?.SS
        ? newFollowers.filter(
            (item) => !this.event.dynamodb.OldImage.followers.SS.includes(item)
          )
        : newFollowers
    );

    if (followerData.length === 0) {
      throw new Error('Follower not found');
    }

    const follower = followerData[0];

    await this.notificationRepository.saveNotification({
      userId: user.id,
      message: this.notificationMessage(follower),
      link: `whiskeysocial://user/${follower.id}`,
      relatedUserId: follower.id,
      type: 'DISCOVERY',
    });

    if (!user.canReceiveNotification('friends')) {
      return;
    }

    this.sendNotification.queueNotification(
      user.expoTokens,
      this.notificationMessage(follower),
      `whiskeysocial://user/${follower.id}`
    );

    await this.sendNotification.sendNotification();

    await this.sendNotification.checkReceipts();
  }
}

module.exports = FollowNotificationHandler;
