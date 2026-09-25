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
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const MESSAGE_TABLE = process.env.API_WHISKEYSOCIAL_MESSAGETABLE_NAME;
const PARTICIPANT_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME;
const CONVERSATION_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONTABLE_NAME;

exports.handler = async (event) => {
  console.log('DeleteMessage invoked', {
    callerId: event.identity?.sub,
    input: event.arguments?.input,
  });

  const callerId = event.identity.sub;

  try {
    const { messageId, deleteForEveryone } = event.arguments.input || {};

    // 1. Validate input
    if (!messageId) {
      throw new Error('VALIDATION_ERROR: messageId is required');
    }
    if (typeof deleteForEveryone !== 'boolean') {
      throw new Error('VALIDATION_ERROR: deleteForEveryone is required');
    }

    // 2. Fetch the message
    const messageResult = await docClient
      .get({
        TableName: MESSAGE_TABLE,
        Key: { id: messageId },
      })
      .promise();

    const message = messageResult.Item;
    if (!message) {
      throw new Error('NOT_FOUND: message does not exist');
    }

    // 3. Verify caller is the sender
    if (message.senderId !== callerId) {
      throw new Error('UNAUTHORIZED: you can only delete your own messages');
    }

    // 4. Verify caller is a conversation participant
    const participantResult = await docClient
      .query({
        TableName: PARTICIPANT_TABLE,
        IndexName: 'byConversation',
        KeyConditionExpression: 'conversationId = :cid AND userId = :uid',
        ExpressionAttributeValues: {
          ':cid': message.conversationId,
          ':uid': callerId,
        },
      })
      .promise();

    if (!participantResult.Items || participantResult.Items.length === 0) {
      throw new Error('UNAUTHORIZED: you are not a participant in this conversation');
    }

    const now = new Date().toISOString();

    // 5. Apply delete based on type
    if (!deleteForEveryone) {
      // Delete for me — only hide from sender's view
      await docClient
        .update({
          TableName: MESSAGE_TABLE,
          Key: { id: messageId },
          UpdateExpression: 'SET deletedBySender = :true, updatedAt = :now',
          ExpressionAttributeValues: {
            ':true': true,
            ':now': now,
          },
        })
        .promise();
    } else {
      // Delete for everyone
      await docClient
        .update({
          TableName: MESSAGE_TABLE,
          Key: { id: messageId },
          UpdateExpression: 'SET deletedForEveryone = :true, updatedAt = :now',
          ExpressionAttributeValues: {
            ':true': true,
            ':now': now,
          },
        })
        .promise();

      // Check if this was the latest message and update conversation preview
      const conversationResult = await docClient
        .get({
          TableName: CONVERSATION_TABLE,
          Key: { id: message.conversationId },
        })
        .promise();

      const conversation = conversationResult.Item;
      if (conversation && conversation.lastMessageAt === message.createdAt) {
        await docClient
          .update({
            TableName: CONVERSATION_TABLE,
            Key: { id: message.conversationId },
            UpdateExpression: 'SET lastMessageText = :text, updatedAt = :now',
            ExpressionAttributeValues: {
              ':text': 'This message was deleted',
              ':now': now,
            },
          })
          .promise();
      }
    }

    console.log('DeleteMessage completed', {
      messageId,
      conversationId: message.conversationId,
      deleteForEveryone,
    });

    return {
      success: true,
      messageId,
      conversationId: message.conversationId,
      deleteForEveryone,
    };
  } catch (error) {
    console.error('DeleteMessage error:', error.message);
    throw error;
  }
};