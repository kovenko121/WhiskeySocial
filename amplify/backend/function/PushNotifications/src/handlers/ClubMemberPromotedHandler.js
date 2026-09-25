const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a club member is promoted to admin.
 * Triggered on ClubMember MODIFY event when role changes to CLUBADMINROLE.
 */
class ClubMemberPromotedHandler extends NotificationHandlerAbstract {
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

    const oldRole = this.event.dynamodb.OldImage?.role?.S;
    const newRole = this.event.dynamodb.NewImage?.role?.S;

    return oldRole !== 'CLUBADMINROLE' && newRole === 'CLUBADMINROLE';
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const userId = NewImage.userId?.S;
    const clubId = NewImage.clubId?.S;
    const adminId = NewImage.promotedBy?.S;

    if (!userId || !clubId) {
      console.log('Missing userId or clubId in ClubMemberPromotedHandler');
      return;
    }

    const [userData, club, adminData] = await Promise.all([
      this.userRepository.findUsersData([userId]),
      this.clubRepository.findClubById(clubId),
      adminId ? this.userRepository.findUsersData([adminId]) : Promise.resolve([]),
    ]);

    if (userData.length === 0) {
      console.log('User not found in ClubMemberPromotedHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubMemberPromotedHandler');
      return;
    }

    const user = userData[0];
    const admin = adminData.length > 0 ? adminData[0] : null;

    const adminUsername = admin?.username || 'an admin';
    const inAppMessage = `You're now an admin of ${club.clubName}`;
    const pushMessage = `You've been promoted to admin of ${club.clubName}`;

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
      type: 'CLUB_PROMOTED_TO_ADMIN',
      secondaryPicture: clubPicture,
    });

    if (user.expoTokens && user.expoTokens.length > 0) {
      this.sendNotification.queueNotification(
        user.expoTokens,
        pushMessage,
        `whiskeysocial://club/${clubId}`,
        "You're now an admin!"
      );

      await this.sendNotification.sendNotification();
      await this.sendNotification.checkReceipts();
    }
  }
}

module.exports = ClubMemberPromotedHandler;
