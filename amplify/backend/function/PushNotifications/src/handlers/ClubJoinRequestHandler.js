const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a user requests to join a club.
 * Triggered on ClubMember INSERT event with status PENDING.
 * Sends notification to all club admins (including owner).
 */
class ClubJoinRequestHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'INSERT') {
      return false;
    }

    if (
      !this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
      )
    ) {
      return false;
    }

    const status = this.event.dynamodb.NewImage?.status?.S;

    return status === 'PENDING';
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const requesterId = NewImage.userId?.S;
    const clubId = NewImage.clubId?.S;

    if (!requesterId || !clubId) {
      console.log('Missing requesterId or clubId in ClubJoinRequestHandler');
      return;
    }

    const [requesterData, club, admins] = await Promise.all([
      this.userRepository.findUsersData([requesterId]),
      this.clubRepository.findClubById(clubId),
      this.clubRepository.findClubAdmins(clubId),
    ]);

    if (requesterData.length === 0) {
      console.log('Requester not found in ClubJoinRequestHandler');
      return;
    }

    if (!club) {
      console.log('Club not found in ClubJoinRequestHandler');
      return;
    }

    if (admins.length === 0) {
      console.log('No admins found for club in ClubJoinRequestHandler');
      return;
    }

    const requester = requesterData[0];
    const requesterUsername = requester.username || 'Someone';

    const adminUserIds = admins.map((admin) => admin.userId);
    const adminUsers = await this.userRepository.findUsersData(adminUserIds);

    const inAppMessage = `@${requesterUsername} requested to join ${club.clubName}`;
    const pushMessage = `@${requesterUsername} wants to join ${club.clubName}`;

    for (const adminUser of adminUsers) {
      // Only show requester's avatar - no secondary club picture for join requests
      await this.notificationRepository.saveNotification({
        userId: adminUser.id,
        message: inAppMessage,
        link: `whiskeysocial://club/${clubId}`,
        relatedUserId: requesterId,
        type: 'CLUB_JOIN_REQUEST',
      });

      if (adminUser.expoTokens && adminUser.expoTokens.length > 0) {
        this.sendNotification.queueNotification(
          adminUser.expoTokens,
          pushMessage,
          `whiskeysocial://club/${clubId}`,
          'New Join Request'
        );
      }
    }

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = ClubJoinRequestHandler;
