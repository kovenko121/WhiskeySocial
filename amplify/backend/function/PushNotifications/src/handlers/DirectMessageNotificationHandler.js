const NotificationHandlerAbstract = require('./NotificationHandlerAbstract');

class DirectMessageNotificationHandler extends NotificationHandlerAbstract {
  shouldRun() {
    return (
      this.event.eventName === 'INSERT' &&
      this.event.eventSourceARN.includes(
        process.env.API_WHISKEYSOCIAL_MESSAGETABLE_NAME
      )
    );
  }

  async doHandle() {
    const {
      senderId: { S: senderId },
      participantIds: { L: participantIdsList },
      conversationId: { S: conversationId },
    } = this.event.dynamodb.NewImage;

    // Determine recipientId from participantIds (the one that isn't the sender)
    const recipientId = participantIdsList
      .map((item) => item.S)
      .find((id) => id !== senderId);

    if (!recipientId) {
      console.log('Could not determine recipient from participantIds');
      return;
    }

    // Fetch sender and recipient user data
    const [senderData, recipientData] = await Promise.all([
      this.userRepository.findUsersData([senderId]),
      this.userRepository.findUsersData([recipientId]),
    ]);

    if (senderData.length === 0 || recipientData.length === 0) {
      console.log('Sender or recipient not found');
      return;
    }

    const sender = senderData[0];
    const recipient = recipientData[0];

    // Look up the recipient's conversation participant record
    const recipientParticipant =
      await this.conversationParticipantRepository.findByConversationAndUser(
        conversationId,
        recipientId
      );

    if (!recipientParticipant) {
      console.log('Recipient participant record not found');
      return;
    }

    // Skip if conversation is muted
    if (recipientParticipant.isMuted) {
      return;
    }

    // Debounce: max one notification per conversation per 60 seconds.
    // Prevents pile-up during active conversations where read-reset cycles
    // would otherwise trigger a notification on every message.
    const DEBOUNCE_SECONDS = 60;
    if (recipientParticipant.lastDmNotifiedAt) {
      const secondsSinceLastNotified =
        (Date.now() -
          new Date(recipientParticipant.lastDmNotifiedAt).getTime()) /
        1000;
      if (secondsSinceLastNotified < DEBOUNCE_SECONDS) {
        return;
      }
    }

    const isMessageRequest = recipientParticipant.requestStatus === 'PENDING';
    const notificationType = isMessageRequest
      ? 'message_requests'
      : 'direct_messages';

    const senderUsername = sender.username || 'Someone';
    const title = isMessageRequest ? 'Message Request' : `@${senderUsername}`;
    const body = isMessageRequest
      ? `@${senderUsername} wants to send you a message`
      : 'sent you a message';
    const deepLink = isMessageRequest
      ? 'whiskeysocial://messages?initialTab=Requests'
      : 'whiskeysocial://messages';

    // Save in-app notification record
    await this.notificationRepository.saveNotification({
      userId: recipientId,
      message: isMessageRequest
        ? `@${senderUsername} wants to send you a message`
        : `@${senderUsername} sent you a message`,
      link: deepLink,
      relatedUserId: senderId,
      type: isMessageRequest ? 'MESSAGE_REQUEST' : 'DIRECT_MESSAGE',
    });

    // Check if recipient can receive push notifications for this type
    if (!recipient.canReceiveNotification(notificationType)) {
      return;
    }

    const [notificationCount, dmUnreadCount] = await Promise.all([
      this.notificationRepository.countActivityNotificationsForUser(recipientId),
      this.conversationParticipantRepository.getTotalUnreadCountForUser(recipientId),
    ]);

    this.sendNotification.queueNotification(
      recipient.expoTokens,
      body,
      deepLink,
      title,
      notificationCount + dmUnreadCount
    );

    await this.sendNotification.sendNotification();
    await this.sendNotification.checkReceipts();

    // Update debounce timestamp (non-fatal if it fails)
    try {
      await this.conversationParticipantRepository.updateLastDmNotifiedAt(
        recipientParticipant.id
      );
    } catch (debounceError) {
      console.warn('Failed to update lastDmNotifiedAt (non-fatal):', debounceError.message);
    }
  }
}

module.exports = DirectMessageNotificationHandler;
