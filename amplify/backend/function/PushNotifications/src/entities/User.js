class User {
  constructor(data) {
    Object.assign(this, data);
  }

  canReceiveNotification(notificationType) {
    if (!this.expoTokens || this.expoTokens.length == 0) {
      return false;
    }

    if (!notificationType) {
      return true;
    }

    const setting = this.notificationSettings?.find(
      (s) => s.name === notificationType
    );

    // Default behavior when setting doesn't exist
    if (!setting) {
      // For 'clubs' setting, default to true - club members expect activity notifications
      // This ensures existing users receive club notifications without needing to visit settings
      if (notificationType === 'clubs') {
        return true;
      }
      // DM notifications default to true - users expect to be notified about new messages
      if (
        notificationType === 'direct_messages' ||
        notificationType === 'message_requests'
      ) {
        return true;
      }
      // For other notification types, default to false (require explicit opt-in)
      return false;
    }

    return setting.value !== 'false';
  }
}

module.exports = User;
