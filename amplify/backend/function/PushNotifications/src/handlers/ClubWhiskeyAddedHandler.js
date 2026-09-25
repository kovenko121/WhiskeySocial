const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

/**
 * Handles notifications when a whiskey is added to a club collection.
 * Triggered on ClubWhiskey INSERT event.
 * Sends notification to all active members of the club.
 */
class ClubWhiskeyAddedHandler extends NotificationHandlerAbstract {
  shouldRun() {
    if (this.event.eventName !== 'INSERT') {
      return false;
    }

    if (
      !this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME
      )
    ) {
      return false;
    }

    return true;
  }

  async doHandle() {
    const { NewImage } = this.event.dynamodb;
    const clubId = NewImage.clubId?.S;
    const whiskeyId = NewImage.whiskeyId?.S;
    const addedById = NewImage.addedBy?.S;

    if (!clubId || !whiskeyId) {
      console.log('Missing clubId or whiskeyId in ClubWhiskeyAddedHandler');
      return;
    }

    const [club, whiskey, addedByData, members] = await Promise.all([
      this.clubRepository.findClubById(clubId),
      this.clubRepository.findWhiskeyById(whiskeyId),
      addedById
        ? this.userRepository.findUsersData([addedById])
        : Promise.resolve([]),
      this.clubRepository.findActiveMembers(clubId),
    ]);

    if (!club) {
      console.log('Club not found in ClubWhiskeyAddedHandler');
      return;
    }

    if (!whiskey) {
      console.log('Whiskey not found in ClubWhiskeyAddedHandler');
      return;
    }

    const addedBy = addedByData.length > 0 ? addedByData[0] : null;
    const addedByUsername = addedBy?.username || 'An admin';
    const whiskeyName = whiskey.name || 'a whiskey';

    const inAppMessage = `${whiskeyName} was added to ${club.clubName}`;
    const pushMessage = `${whiskeyName} was added to ${club.clubName}`;

    if (members.length === 0) {
      console.log('No active members found for club in ClubWhiskeyAddedHandler');
      return;
    }

    const memberUserIds = members.map((member) => member.userId);
    const memberUsers = await this.userRepository.findUsersData(memberUserIds);

    const clubPicture = club.profilePicture
      ? {
          bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
          key: club.profilePicture,
          region: process.env.REGION,
        }
      : null;

    for (const memberUser of memberUsers) {
      // Skip the user who added the whiskey
      if (memberUser.id === addedById) {
        continue;
      }

      // Always save in-app notification
      await this.notificationRepository.saveNotification({
        userId: memberUser.id,
        message: inAppMessage,
        link: `whiskeysocial://club/${clubId}`,
        relatedUserId: addedById || club.createdBy,
        type: 'CLUB_WHISKEY_ADDED',
        secondaryPicture: clubPicture,
      });

      // Only send push if user can receive notifications
      if (!memberUser.canReceiveNotification('clubs')) {
        continue;
      }

      this.sendNotification.queueNotification(
        memberUser.expoTokens,
        pushMessage,
        `whiskeysocial://club/${clubId}`,
        club.clubName
      );
    }

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();
  }
}

module.exports = ClubWhiskeyAddedHandler;
