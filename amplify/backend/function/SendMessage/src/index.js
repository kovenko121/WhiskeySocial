/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_ARN
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME
	API_WHISKEYSOCIAL_CONVERSATIONTABLE_ARN
	API_WHISKEYSOCIAL_CONVERSATIONTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_MESSAGETABLE_ARN
	API_WHISKEYSOCIAL_MESSAGETABLE_NAME
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const docClient = new AWS.DynamoDB.DocumentClient();

const USER_TABLE = process.env.API_WHISKEYSOCIAL_USERTABLE_NAME;
const CONVERSATION_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONTABLE_NAME;
const PARTICIPANT_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME;
const MESSAGE_TABLE = process.env.API_WHISKEYSOCIAL_MESSAGETABLE_NAME;

const MAX_MESSAGE_LENGTH = 2000;
const MAX_PREVIEW_LENGTH = 100;

const EXEMPT_USER_IDS = (process.env.RATE_LIMIT_EXEMPT_USER_IDS || '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean);

const RATE_LIMITS = {
  MESSAGES_PER_MINUTE: { window: 60 * 1000, max: 30 },
  MESSAGES_PER_HOUR: { window: 3600 * 1000, max: 200 },
  NEW_CONVERSATIONS_PER_DAY: { window: 86400 * 1000, max: 50 },
};

// --- Helpers ---

const buildParticipantKey = (id1, id2) => [id1, id2].sort().join('#');

const toArray = (field) => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (field.values && Array.isArray(field.values)) return field.values;
  if (typeof field === 'object' && field.wrapperName === 'Set') return field.values || [];
  // Handle plain string sets stored as objects with numeric keys
  if (typeof field === 'object') {
    const vals = Object.values(field);
    if (vals.length > 0 && typeof vals[0] === 'string') return vals;
  }
  return [];
};

const getUser = async (userId) => {
  const { Item } = await docClient
    .get({ TableName: USER_TABLE, Key: { id: userId } })
    .promise();
  return Item;
};

const findConversationByParticipantKey = async (participantKey) => {
  const result = await docClient
    .query({
      TableName: CONVERSATION_TABLE,
      IndexName: 'byParticipants',
      KeyConditionExpression: 'participantKey = :pk',
      ExpressionAttributeValues: { ':pk': participantKey },
      Limit: 1,
    })
    .promise();
  return result.Items && result.Items[0];
};

// --- Rate Limiting ---

const checkMessageRateLimit = async (senderId) => {
  if (EXEMPT_USER_IDS.includes(senderId)) return;
  const now = Date.now();

  // Messages per minute
  const oneMinuteAgo = new Date(now - RATE_LIMITS.MESSAGES_PER_MINUTE.window).toISOString();
  const minuteResult = await docClient
    .query({
      TableName: MESSAGE_TABLE,
      IndexName: 'bySender',
      KeyConditionExpression: 'senderId = :senderId AND createdAt >= :since',
      ExpressionAttributeValues: {
        ':senderId': senderId,
        ':since': oneMinuteAgo,
      },
      Select: 'COUNT',
    })
    .promise();

  if (minuteResult.Count >= RATE_LIMITS.MESSAGES_PER_MINUTE.max) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }

  // Messages per hour
  const oneHourAgo = new Date(now - RATE_LIMITS.MESSAGES_PER_HOUR.window).toISOString();
  const hourResult = await docClient
    .query({
      TableName: MESSAGE_TABLE,
      IndexName: 'bySender',
      KeyConditionExpression: 'senderId = :senderId AND createdAt >= :since',
      ExpressionAttributeValues: {
        ':senderId': senderId,
        ':since': oneHourAgo,
      },
      Select: 'COUNT',
    })
    .promise();

  if (hourResult.Count >= RATE_LIMITS.MESSAGES_PER_HOUR.max) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
};

const checkNewConversationRateLimit = async (senderId) => {
  if (EXEMPT_USER_IDS.includes(senderId)) return;
  const oneDayAgo = new Date(
    Date.now() - RATE_LIMITS.NEW_CONVERSATIONS_PER_DAY.window
  ).toISOString();

  const result = await docClient
    .query({
      TableName: PARTICIPANT_TABLE,
      IndexName: 'byUser',
      KeyConditionExpression: 'userId = :userId',
      FilterExpression: 'createdAt >= :since',
      ExpressionAttributeValues: {
        ':userId': senderId,
        ':since': oneDayAgo,
      },
      Select: 'COUNT',
    })
    .promise();

  if (result.Count >= RATE_LIMITS.NEW_CONVERSATIONS_PER_DAY.max) {
    throw new Error('RATE_LIMIT_EXCEEDED');
  }
};

// --- Validation ---

const validateInput = (input) => {
  if (!input || !input.recipientId || !input.text) {
    throw new Error('VALIDATION_ERROR');
  }

  const text = input.text.trim();
  if (text.length === 0 || text.length > MAX_MESSAGE_LENGTH) {
    throw new Error('VALIDATION_ERROR');
  }

  return { recipientId: input.recipientId, text };
};

// --- Block & Privacy Checks ---

const checkBlocked = (sender, recipient) => {
  const senderBlocked = toArray(sender.blockedUsers);
  const recipientBlocked = toArray(recipient.blockedUsers);

  if (senderBlocked.includes(recipient.id)) {
    throw new Error('USER_BLOCKED');
  }
  if (recipientBlocked.includes(sender.id)) {
    throw new Error('USER_BLOCKED');
  }
};

const checkPrivacy = (sender, recipient) => {
  const setting = recipient.dmPrivacySetting;

  // null/undefined defaults to EVERYONE
  if (!setting || setting === 'EVERYONE') return;

  if (setting === 'NONE') {
    throw new Error('PRIVACY_RESTRICTED');
  }

  if (setting === 'FOLLOWING') {
    const following = toArray(recipient.following);
    if (!following.includes(sender.id)) {
      throw new Error('PRIVACY_RESTRICTED');
    }
  }
};

// --- Conversation & Message Creation ---

const createConversation = async (senderId, recipientId, participantKey) => {
  const now = new Date().toISOString();
  const conversationId = uuidv4();

  const conversation = {
    id: conversationId,
    participantIds: [senderId, recipientId],
    participantKey,
    lastMessageText: null,
    lastMessageSenderId: null,
    lastMessageAt: null,
    __typename: 'Conversation',
    createdAt: now,
    updatedAt: now,
  };

  await docClient
    .put({ TableName: CONVERSATION_TABLE, Item: conversation })
    .promise();

  return conversation;
};

const createParticipants = async (conversationId, senderId, recipientId, isMutualFollow) => {
  const now = new Date().toISOString();

  const senderParticipant = {
    id: uuidv4(),
    conversationId,
    userId: senderId,
    unreadCount: 0,
    lastReadAt: now,
    isMuted: false,
    isDeleted: false,
    requestStatus: 'ACCEPTED',
    __typename: 'ConversationParticipant',
    createdAt: now,
    updatedAt: now,
  };

  const recipientParticipant = {
    id: uuidv4(),
    conversationId,
    userId: recipientId,
    unreadCount: 0,
    lastReadAt: null,
    isMuted: false,
    isDeleted: false,
    requestStatus: isMutualFollow ? 'ACCEPTED' : 'PENDING',
    __typename: 'ConversationParticipant',
    createdAt: now,
    updatedAt: now,
  };

  await docClient
    .transactWrite({
      TransactItems: [
        { Put: { TableName: PARTICIPANT_TABLE, Item: senderParticipant } },
        { Put: { TableName: PARTICIPANT_TABLE, Item: recipientParticipant } },
      ],
    })
    .promise();

  return { senderParticipant, recipientParticipant };
};

const createMessage = async (conversationId, senderId, recipientId, text) => {
  const now = new Date().toISOString();
  const messageId = uuidv4();

  const message = {
    id: messageId,
    conversationId,
    participantIds: [senderId, recipientId],
    senderId,
    text,
    // readAt omitted intentionally — attribute absence signals "unread" for
    // MarkMessagesAsRead's attribute_not_exists(readAt) filter.
    deletedBySender: false,
    deletedForEveryone: false,
    senderDeleted: false,
    __typename: 'Message',
    createdAt: now,
    updatedAt: now,
  };

  await docClient
    .put({ TableName: MESSAGE_TABLE, Item: message })
    .promise();

  return message;
};

const updateConversationMetadata = async (conversationId, text, senderId, messageCreatedAt) => {
  const preview = text.length > MAX_PREVIEW_LENGTH
    ? text.substring(0, MAX_PREVIEW_LENGTH)
    : text;

  await docClient
    .update({
      TableName: CONVERSATION_TABLE,
      Key: { id: conversationId },
      UpdateExpression:
        'SET lastMessageText = :text, lastMessageSenderId = :senderId, lastMessageAt = :msgTime, updatedAt = :now',
      ExpressionAttributeValues: {
        ':text': preview,
        ':senderId': senderId,
        ':msgTime': messageCreatedAt,
        ':now': new Date().toISOString(),
      },
    })
    .promise();
};

const incrementUnreadCount = async (conversationId, recipientId) => {
  const result = await docClient
    .query({
      TableName: PARTICIPANT_TABLE,
      IndexName: 'byConversation',
      KeyConditionExpression: 'conversationId = :convId AND userId = :userId',
      ExpressionAttributeValues: {
        ':convId': conversationId,
        ':userId': recipientId,
      },
      Limit: 1,
    })
    .promise();

  const participant = result.Items && result.Items[0];
  if (!participant) return;

  // Build the update expression dynamically based on current state
  let updateExpr =
    'SET unreadCount = if_not_exists(unreadCount, :zero) + :inc, isDeleted = :false, updatedAt = :now';
  const exprValues = {
    ':inc': 1,
    ':zero': 0,
    ':false': false,
    ':now': new Date().toISOString(),
  };

  // If the recipient previously declined the request, reset to PENDING so
  // the conversation resurfaces in their Requests tab.
  // TODO: A hidden/declined filter can be added later if desired.
  if (participant.requestStatus === 'DECLINED') {
    updateExpr += ', requestStatus = :pending';
    exprValues[':pending'] = 'PENDING';
  }

  await docClient
    .update({
      TableName: PARTICIPANT_TABLE,
      Key: { id: participant.id },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprValues,
    })
    .promise();
};

// Restore sender's participant if they had soft-deleted the conversation
// or re-engage if they had previously declined the request
const restoreSenderParticipant = async (conversationId, senderId) => {
  const result = await docClient
    .query({
      TableName: PARTICIPANT_TABLE,
      IndexName: 'byConversation',
      KeyConditionExpression: 'conversationId = :convId AND userId = :userId',
      ExpressionAttributeValues: {
        ':convId': conversationId,
        ':userId': senderId,
      },
      Limit: 1,
    })
    .promise();

  const participant = result.Items && result.Items[0];
  if (!participant) return;

  const needsRestore = participant.isDeleted;
  const needsReengage = participant.requestStatus === 'DECLINED';

  if (!needsRestore && !needsReengage) return;

  let updateExpr = 'SET updatedAt = :now';
  const exprValues = { ':now': new Date().toISOString() };

  if (needsRestore) {
    updateExpr += ', isDeleted = :false';
    exprValues[':false'] = false;
  }

  if (needsReengage) {
    updateExpr += ', requestStatus = :accepted';
    exprValues[':accepted'] = 'ACCEPTED';
  }

  await docClient
    .update({
      TableName: PARTICIPANT_TABLE,
      Key: { id: participant.id },
      UpdateExpression: updateExpr,
      ExpressionAttributeValues: exprValues,
    })
    .promise();
};

// --- Main Handler ---

exports.handler = async (event) => {
  console.log('SendMessage invoked', { senderId: event.identity?.sub, recipientId: event.arguments?.input?.recipientId });

  const senderId = event.identity.sub;

  try {
    // 1. Validate input
    const { recipientId, text } = validateInput(event.arguments.input);

    if (recipientId === senderId) {
      throw new Error('VALIDATION_ERROR');
    }

    // 2. Check message rate limits
    await checkMessageRateLimit(senderId);

    // 3. Fetch both users
    const [sender, recipient] = await Promise.all([
      getUser(senderId),
      getUser(recipientId),
    ]);

    if (!sender || sender.deleted) throw new Error('VALIDATION_ERROR');
    if (!recipient || recipient.deleted) throw new Error('VALIDATION_ERROR');

    // 4. Check blocked users
    checkBlocked(sender, recipient);

    // 5. Check privacy settings
    checkPrivacy(sender, recipient);

    // 6. Find or create conversation
    const participantKey = buildParticipantKey(senderId, recipientId);
    let conversation = await findConversationByParticipantKey(participantKey);
    let isNewConversation = false;

    if (!conversation) {
      await checkNewConversationRateLimit(senderId);

      const senderFollowing = toArray(sender.following);
      const recipientFollowing = toArray(recipient.following);
      const isMutualFollow =
        senderFollowing.includes(recipientId) &&
        recipientFollowing.includes(senderId);

      conversation = await createConversation(senderId, recipientId, participantKey);
      await createParticipants(conversation.id, senderId, recipientId, isMutualFollow);
      isNewConversation = true;
    }

    // 7. Restore soft-deleted participants so the conversation reappears
    if (!isNewConversation) {
      await restoreSenderParticipant(conversation.id, senderId);
    }

    // 8. Create message
    const message = await createMessage(conversation.id, senderId, recipientId, text);

    // 9. Update conversation metadata
    await updateConversationMetadata(conversation.id, text, senderId, message.createdAt);

    // 10. Increment recipient's unread count (also restores recipient if they had deleted)
    await incrementUnreadCount(conversation.id, recipientId);

    // 11. Return result
    return {
      messageId: message.id,
      conversationId: conversation.id,
      text: message.text,
      senderId: message.senderId,
      createdAt: message.createdAt,
      isNewConversation,
    };
  } catch (error) {
    console.error('SendMessage error:', error.message);
    throw error;
  }
};
