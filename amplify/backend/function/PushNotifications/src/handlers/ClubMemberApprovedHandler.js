const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a club member request is approved.
 * Triggered on ClubMember MODIFY event when status changes from PENDING to ACTIVE.
 */
class ClubMemberApprovedHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'MODIFY') {
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
    const newStatus = this.event.dynamodb.NewImage?.status?.S;

    return oldStatus === 'PENDING' && newStatus === 'ACTIVE';
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const userId = NewImage.userId?.S;
    const clubId = NewImage.clubId?.S;
    const adminId = NewImage.approvedBy?.S;

    if (!userId || !clubId) {
      console.log('Missing userId or clubId in ClubMemberApprovedHandler');
      return;
    }

    const [userData, club, adminData] = await Promise.all([
      this.userRepository.findUsersData([userId]),
      this.clubRepository.findClubById(clubId),
      adminId ? this.userRepository.findUsersData([adminId]) : Promise.resolve([]),
    ]);

    if (userData.length === 0) {
      console.log('User not found in ClubMemberApprovedHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubMemberApprovedHandler');
      return;
    }

    const user = userData[0];
    const admin = adminData.length > 0 ? adminData[0] : null;

    const adminUsername = admin?.username || 'an admin';
    const inAppMessage = `You were accepted to ${club.clubName}`;
    const pushMessage = `You've been accepted to ${club.clubName}`;

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
      relatedUserId: adminId || club.createdBy,
      type: 'CLUB_REQUEST_APPROVED',
      secondaryPicture: clubPicture,
    });

    if (user.expoTokens && user.expoTokens.length > 0) {
      this.sendNotification.queueNotification(
        user.expoTokens,
        pushMessage,
        `whiskeysocial://club/${clubId}`,
        'Request Approved'
      );

      await this.sendNotification.sendNotification();
      await this.sendNotification.checkReceipts();
    }
  }
}

module.exports = ClubMemberApprovedHandler;
