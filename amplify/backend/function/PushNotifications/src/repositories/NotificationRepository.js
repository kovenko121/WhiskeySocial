const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

class NotificationRepository {
  constructor() {
    this._docClient = new AWS.DynamoDB.DocumentClient();
  }

  async saveNotification({
    userId,
    message,
    link,
    relatedUserId,
    type,
    primaryPicture,
    secondaryPicture,
  }) {
    const item = {
      id: uuidv4(),
      userId,
      owner: userId,
      message,
      link,
      relatedUserId,
      type,
      createdAt: new Date().toISOString(),
    };

    if (primaryPicture) {
      item.primaryPicture = primaryPicture;
    }

    if (secondaryPicture) {
      item.secondaryPicture = secondaryPicture;
    }

    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME,
      Item: item,
    };
    
    return await this._docClient.put(params).promise();
  }

  // Returns the count of non-DM notifications for a user (likes, comments, activity).
  // Paginates until all items are counted; uses Select:COUNT to avoid fetching item data.
  async countActivityNotificationsForUser(userId) {
    const DM_TYPES = ['DIRECT_MESSAGE', 'MESSAGE_REQUEST'];
    let count = 0;
    let lastKey;
    do {
      const params = {
        TableName: process.env.API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME,
        IndexName: 'byUserId',
        KeyConditionExpression: 'userId = :uid',
        FilterExpression: '#t <> :dm AND #t <> :mr',
        ExpressionAttributeNames: { '#t': 'type' },
        ExpressionAttributeValues: {
          ':uid': userId,
          ':dm': DM_TYPES[0],
          ':mr': DM_TYPES[1],
        },
        Select: 'COUNT',
        ExclusiveStartKey: lastKey,
      };
      const result = await this._docClient.query(params).promise();
      count += result.Count || 0;
      lastKey = result.LastEvaluatedKey;
    } while (lastKey);
    return count;
  }
}

module.exports = NotificationRepository;
