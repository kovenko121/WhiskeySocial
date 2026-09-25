const AWS = require('aws-sdk');

class ConversationParticipantRepository {
  constructor() {
    this._docClient = new AWS.DynamoDB.DocumentClient();
  }

  async findByConversationAndUser(conversationId, userId) {
    const result = await this._docClient
      .query({
        TableName:
          process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME,
        IndexName: 'byConversation',
        KeyConditionExpression:
          'conversationId = :convId AND userId = :userId',
        ExpressionAttributeValues: {
          ':convId': conversationId,
          ':userId': userId,
        },
        Limit: 1,
      })
      .promise();

    return result.Items && result.Items[0];
  }

  async updateLastDmNotifiedAt(participantId) {
    await this._docClient
      .update({
        TableName:
          process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME,
        Key: { id: participantId },
        UpdateExpression: 'SET lastDmNotifiedAt = :now',
        ExpressionAttributeValues: {
          ':now': new Date().toISOString(),
        },
      })
      .promise();
  }

  // Returns the sum of unreadCount across all accepted, non-deleted conversations for a user.
  async getTotalUnreadCountForUser(userId) {
    let total = 0;
    let lastKey;
    do {
      const params = {
        TableName:
          process.env.API_WHISKEYSOCIAL_CONVERSATIONPARTICIPANTTABLE_NAME,
        IndexName: 'byUser',
        KeyConditionExpression: 'userId = :uid',
        FilterExpression:
          'isDeleted = :false AND requestStatus = :accepted AND unreadCount > :zero',
        ExpressionAttributeValues: {
          ':uid': userId,
          ':false': false,
          ':accepted': 'ACCEPTED',
          ':zero': 0,
        },
        ProjectionExpression: 'unreadCount',
        ExclusiveStartKey: lastKey,
      };
      const result = await this._docClient.query(params).promise();
      for (const item of result.Items || []) {
        total += item.unreadCount || 0;
      }
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
    return total;
  }
}

module.exports = ConversationParticipantRepository;
