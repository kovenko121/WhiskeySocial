const { Expo } = require('expo-server-sdk');

class SendNotification {
  constructor() {
    this._messages = [];
    this._tickets = [];
    this._expo = new Expo();
  }

  queueNotification(expoTokens, body, deepLink, title, badge) {
    this._messages.push(
      ...expoTokens.map((expoToken) => {
        const message = {
          to: String(expoToken),
          sound: 'default',
          body,
          data: { status: 'ok', deepLink },
        };
        if (title) {
          message.title = title;
        }
        if (typeof badge === 'number') {
          message.badge = badge;
        }
        return message;
      })
    );
  }
  async sendNotification() {
    let chunks = this._expo.chunkPushNotifications(this._messages);
    for (let chunk of chunks) {
      try {
        let ticketChunk = await this._expo.sendPushNotificationsAsync(chunk);
        console.log({ ticketChunk });
        this._tickets.push(...ticketChunk);
      } catch (error) {
        console.error('Error on sendNotification', error);
        throw error;
      }
    }
  }

  async checkReceipts() {
    let receiptIds = [];
    for (let ticket of this._tickets) {
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks =
      this._expo.chunkPushNotificationReceiptIds(receiptIds);

    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await this._expo.getPushNotificationReceiptsAsync(chunk);
        console.log({ receipts: JSON.stringify(receipts) });
      } catch (error) {
        console.error('Error on CheckReceipts', error);
        throw error;
      }
    }
  }
}

module.exports = SendNotification;
