/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_ARN
	API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_MESSAGETABLE_ARN
	API_WHISKEYSOCIAL_MESSAGETABLE_NAME
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_ARN
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */


const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const PARTICIPANT_TABLE = process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME;
const MESSAGE_TABLE = process.env.API_WHISKEYSOCIAL_MESSAGETABLE_NAME;
const NOTIFICATION_TABLE = process.env.API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME;

exports.handler = async (event) => {
  console.log('MarkMessagesAsRead invoked', {
    callerId: event.identity?.sub,
    input: event.arguments?.input,
  });

  const callerId = event.identity.sub;

  try {
    const { conversationId } = event.arguments.input || {};

    // 1. Validate input
    if (!conversationId) {
      throw new Error('VALIDATION_ERROR: conversationId is required');
    }

    // 2. Verify caller is a participant in this conversation
    const participantResult = await docClient
      .query({
        TableName: PARTICIPANT_TABLE,
        IndexName: 'byConversation',
        KeyConditionExpression: 'conversationId = :cid AND userId = :uid',
        ExpressionAttributeValues: {
          ':cid': conversationId,
          ':uid': callerId,
        },
      })
      .promise();

    if (!participantResult.Items || participantResult.Items.length === 0) {
      throw new Error('UNAUTHORIZED: you are not a participant in this conversation');
    }

    const participant = participantResult.Items[0];

    // 3. Query unread messages from other users in this conversation
    const now = new Date().toISOString();
    let unreadMessages = [];
    let lastEvaluatedKey = null;

    do {
      const queryParams = {
        TableName: MESSAGE_TABLE,
        IndexName: 'byConversation',
        KeyConditionExpression: 'conversationId = :cid',
        FilterExpression: 'senderId <> :callerId AND attribute_not_exists(readAt)',
        ExpressionAttributeValues: {
          ':cid': conversationId,
          ':callerId': callerId,
        },
      };

      if (lastEvaluatedKey) {
        queryParams.ExclusiveStartKey = lastEvaluatedKey;
      }

      const result = await docClient.query(queryParams).promise();
      unreadMessages = unreadMessages.concat(result.Items || []);
      lastEvaluatedKey = result.LastEvaluatedKey;
    } while (lastEvaluatedKey);

    // 4. Batch update unread messages with readAt timestamp
    // TODO: Future enhancement — make readAt conditional on recipient's read receipt
    // privacy setting. If the recipient opts out, skip setting readAt so the sender
    // doesn't see "Read". The rest of this function (unreadCount reset, lastReadAt,
    // notification cleanup) should still run regardless of that setting.
    if (unreadMessages.length > 0) {
      // DynamoDB batch write supports max 25 items per request
      const BATCH_SIZE = 25;
      for (let i = 0; i < unreadMessages.length; i += BATCH_SIZE) {
        const batch = unreadMessages.slice(i, i + BATCH_SIZE);
        const updatePromises = batch.map((msg) =>
          docClient
            .update({
              TableName: MESSAGE_TABLE,
              Key: { id: msg.id },
              UpdateExpression: 'SET readAt = :readAt, updatedAt = :now',
              ExpressionAttributeValues: {
                ':readAt': now,
                ':now': now,
              },
            })
            .promise(),
        );
        await Promise.all(updatePromises);
      }
    }

    // 5. Update caller's participant record: reset unreadCount, set lastReadAt
    await docClient
      .update({
        TableName: PARTICIPANT_TABLE,
        Key: { id: participant.id },
        UpdateExpression: 'SET unreadCount = :zero, lastReadAt = :now, updatedAt = :now',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':now': now,
        },
      })
      .promise();

    // 6. Clean up DM notification records for this conversation
    // Wrapped in try/catch so cleanup failure never breaks read receipts
    try {
      const allParticipantsResult = await docClient
        .query({
          TableName: PARTICIPANT_TABLE,
          IndexName: 'byConversation',
          KeyConditionExpression: 'conversationId = :cid',
          ExpressionAttributeValues: {
            ':cid': conversationId,
          },
        })
        .promise();

      const otherUserIds = (allParticipantsResult.Items || [])
        .filter((p) => p.userId !== callerId)
        .map((p) => p.userId);

      for (const otherUserId of otherUserIds) {
        let notifLastKey = null;
        const notificationsToDelete = [];

        do {
          const notifQuery = {
            TableName: NOTIFICATION_TABLE,
            IndexName: 'byUserId',
            KeyConditionExpression: 'userId = :uid',
            FilterExpression: '#type IN (:dm, :mr) AND relatedUserId = :ruid',
            ExpressionAttributeNames: { '#type': 'type' },
            ExpressionAttributeValues: {
              ':uid': callerId,
              ':dm': 'DIRECT_MESSAGE',
              ':mr': 'MESSAGE_REQUEST',
              ':ruid': otherUserId,
            },
          };

          if (notifLastKey) {
            notifQuery.ExclusiveStartKey = notifLastKey;
          }

          const notifResult = await docClient.query(notifQuery).promise();
          notificationsToDelete.push(...(notifResult.Items || []));
          notifLastKey = notifResult.LastEvaluatedKey;
        } while (notifLastKey);

        if (notificationsToDelete.length > 0) {
          const BATCH_SIZE = 25;
          for (let i = 0; i < notificationsToDelete.length; i += BATCH_SIZE) {
            const batch = notificationsToDelete.slice(i, i + BATCH_SIZE);
            await Promise.all(
              batch.map((notification) =>
                docClient
                  .delete({
                    TableName: NOTIFICATION_TABLE,
                    Key: { id: notification.id },
                  })
                  .promise(),
              ),
            );
          }
        }
      }
    } catch (cleanupError) {
      console.warn('DM notification cleanup failed (non-fatal):', cleanupError.message);
    }

    console.log('MarkMessagesAsRead completed', {
      conversationId,
      updatedMessageCount: unreadMessages.length,
    });

    return {
      success: true,
      conversationId,
      readAt: now,
      updatedMessageCount: unreadMessages.length,
    };
  } catch (error) {
    console.error('MarkMessagesAsRead error:', error.message);
    throw error;
  }
};