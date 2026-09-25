const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a club member request is rejected.
 * Triggered on ClubMember DELETE event where OldImage.status was PENDING.
 *
 * Note: Since this is a DELETE event, we can't track who performed the action.
 * V1 uses club owner as relatedUserId. V2 soft delete would enable tracking the actual admin.
 */
class ClubMemberRejectedHandler extends NotificationHandlerAbstract {
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

    // Skip if user canceled their own request (not an admin rejection)
    if (deletionType === 'USER_CANCELED') {
      return false;
    }

    return oldStatus === 'PENDING';
  }

  async doHandle() {
    const { OldImage } = this.event.dynamodb;
    const userId = OldImage.userId?.S;
    const clubId = OldImage.clubId?.S;

    if (!userId || !clubId) {
      console.log('Missing userId or clubId in ClubMemberRejectedHandler');
      return;
    }

    const [userData, club] = await Promise.all([
      this.userRepository.findUsersData([userId]),
      this.clubRepository.findClubById(clubId),
    ]);

    if (userData.length === 0) {
      console.log('User not found in ClubMemberRejectedHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubMemberRejectedHandler');
      return;
    }

    const user = userData[0];

    const inAppMessage = `Your request to join ${club.clubName} was declined`;
    const pushMessage = `Your request to join ${club.clubName} was declined`;

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
      type: 'CLUB_REQUEST_REJECTED',
      secondaryPicture: clubPicture,
    });

    if (user.expoTokens && user.expoTokens.length > 0) {
      this.sendNotification.queueNotification(
        user.expoTokens,
        pushMessage,
        `whiskeysocial://club/${clubId}`,
        'Request Declined'
      );

      await this.sendNotification.sendNotification();
      await this.sendNotification.checkReceipts();
    }
  }
}

module.exports = ClubMemberRejectedHandler;
