/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_ARN
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
	API_WHISKEYSOCIAL_CLUBTABLE_ARN
	API_WHISKEYSOCIAL_CLUBTABLE_NAME
	API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME
	API_WHISKEYSOCIAL_COMMENTTABLE_ARN
	API_WHISKEYSOCIAL_COMMENTTABLE_NAME
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_ARN
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_MESSAGETABLE_ARN
	API_WHISKEYSOCIAL_MESSAGETABLE_NAME
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_ARN
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME
	API_WHISKEYSOCIAL_POSTTABLE_ARN
	API_WHISKEYSOCIAL_POSTTABLE_NAME
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */
const fs = require('fs');

const SendNotification = require('./external/SendNotification');
const UserRepository = require('./repositories/UserRepository');
const PostRepository = require('./repositories/PostRepository');
const NotificationRepository = require('./repositories/NotificationRepository');
const ClubRepository = require('./repositories/ClubRepository');
const ConversationParticipantRepository = require('./repositories/ConversationParticipantRepository');

exports.handler = (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  (async () => {
    const sendNotification = new SendNotification();
    const userRepository = new UserRepository();
    const postRepository = new PostRepository();
    const notificationRepository = new NotificationRepository();
    const clubRepository = new ClubRepository();
    const conversationParticipantRepository =
      new ConversationParticipantRepository();

    const allowedHandlers = [
      'NewCommentNotificationHandler.js',
      'LikePostNotificationHandler.js',
      'FollowNotificationHandler.js',
      'ClubMemberApprovedHandler.js',
      'ClubMemberRejectedHandler.js',
      'ClubMemberRemovedHandler.js',
      'ClubMemberPromotedHandler.js',
      'ClubJoinRequestHandler.js',
      'ClubPostTagHandler.js',
      'ClubPostPinnedHandler.js',
      'ClubWhiskeyAddedHandler.js',
      'RegularPostTagHandler.js',
      'DirectMessageNotificationHandler.js',
    ];

    for (const eventRecord of event.Records) {
      const notificationHandlers = fs
        .readdirSync('./handlers')
        .filter((file) => allowedHandlers.includes(file))
        .map((file) => {
          const Handler = require(`./handlers/${file}`);
          return new Handler(eventRecord, {
            sendNotification,
            userRepository,
            postRepository,
            notificationRepository,
            clubRepository,
            conversationParticipantRepository,
          });
        });

      notificationHandlers.forEach((handler, index) => {
        if (index > 0) {
          notificationHandlers[index - 1].setNext(handler);
        }
      });

      try {
        await notificationHandlers[0].handle();
      } catch (e) {
        console.log(e);
      }
    }

    return Promise.resolve('Successfully processed DynamoDB record');
  })();
};
