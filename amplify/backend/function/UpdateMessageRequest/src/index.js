/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_ARN
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const PARTICIPANT_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME;

const VALID_ACTIONS = ['ACCEPTED', 'DECLINED'];

exports.handler = async (event) => {
  console.log('UpdateMessageRequest invoked', {
    callerId: event.identity?.sub,
    input: event.arguments?.input,
  });

  const callerId = event.identity.sub;

  try {
    const { participantId, action } = event.arguments.input || {};

    // 1. Validate input
    if (!participantId || !action) {
      throw new Error('VALIDATION_ERROR: participantId and action are required');
    }

    if (!VALID_ACTIONS.includes(action)) {
      throw new Error('VALIDATION_ERROR: action must be ACCEPTED or DECLINED');
    }

    // 2. Get the participant record
    const { Item: participant } = await docClient
      .get({ TableName: PARTICIPANT_TABLE, Key: { id: participantId } })
      .promise();

    if (!participant) {
      throw new Error('NOT_FOUND: participant record not found');
    }

    // 3. Verify the caller owns this participant record
    if (participant.userId !== callerId) {
      throw new Error('UNAUTHORIZED: you can only update your own message requests');
    }

    // 4. Verify the request is still pending
    if (participant.requestStatus !== 'PENDING') {
      throw new Error('INVALID_STATE: request is no longer pending');
    }

    // 5. Update the request status
    const now = new Date().toISOString();

    await docClient
      .update({
        TableName: PARTICIPANT_TABLE,
        Key: { id: participantId },
        UpdateExpression: 'SET requestStatus = :status, updatedAt = :now',
        ConditionExpression: 'requestStatus = :pending',
        ExpressionAttributeValues: {
          ':status': action,
          ':now': now,
          ':pending': 'PENDING',
        },
      })
      .promise();

    return {
      success: true,
      participantId,
      conversationId: participant.conversationId,
      requestStatus: action,
    };
  } catch (error) {
    console.error('UpdateMessageRequest error:', error.message);
    throw error;
  }
};