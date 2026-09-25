class NotificationHandlerAbstract {
  constructor(event, dependencies) {
    this.next = null;
    this.event = event;
    this.sendNotification = dependencies.sendNotification;
    this.userRepository = dependencies.userRepository;
    this.postRepository = dependencies.postRepository;
    this.notificationRepository = dependencies.notificationRepository;
    this.clubRepository = dependencies.clubRepository;
    this.conversationParticipantRepository =
      dependencies.conversationParticipantRepository;
  }

  setNext(handler) {
    this.next = handler;
  }

  async handle() {
    const result = this.shouldRun();

    if (result === true) {
      await this.doHandle();
    }

    if (this.next) {
      await this.next.handle();
    }
  }

  shouldRun() {
    throw new Error('Not implemented');
  }
  async doHandle() {
    throw new Error('Not implemented');
  }
}

module.exports = NotificationHandlerAbstract;
