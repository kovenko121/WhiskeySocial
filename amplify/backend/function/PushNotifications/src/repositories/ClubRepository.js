const AWS = require('aws-sdk');

class ClubRepository {
  constructor() {
    this._docClient = new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Fetch a club by ID
   * @param {string} clubId
   * @returns {Promise<Object|null>}
   */
  async findClubById(clubId) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME,
      Key: { id: clubId },
    };
    const { Item } = await this._docClient.get(params).promise();
    return Item || null;
  }

  /**
   * Fetch active club members by club ID
   * @param {string} clubId
   * @returns {Promise<Array>}
   */
  async findActiveMembers(clubId) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME,
      IndexName: 'byClubClubMember',
      KeyConditionExpression: 'clubId = :clubId',
      FilterExpression: '#status = :activeStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':clubId': clubId,
        ':activeStatus': 'ACTIVE',
      },
    };

    const result = await this._docClient.query(params).promise();
    return result.Items || [];
  }

  /**
   * Fetch club admins (including owner) by club ID
   * @param {string} clubId
   * @returns {Promise<Array>}
   */
  async findClubAdmins(clubId) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME,
      IndexName: 'byClubClubMember',
      KeyConditionExpression: 'clubId = :clubId',
      FilterExpression:
        '#status = :activeStatus AND (#role = :adminRole OR #role = :ownerRole)',
      ExpressionAttributeNames: {
        '#status': 'status',
        '#role': 'role',
      },
      ExpressionAttributeValues: {
        ':clubId': clubId,
        ':activeStatus': 'ACTIVE',
        ':adminRole': 'CLUBADMINROLE',
        ':ownerRole': 'CLUBOWNERROLE',
      },
    };

    const result = await this._docClient.query(params).promise();
    return result.Items || [];
  }

  /**
   * Check if a user is an active member of a club
   * @param {string} clubId
   * @param {string} userId
   * @returns {Promise<boolean>}
   */
  async isActiveMember(clubId, userId) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME,
      IndexName: 'byUserClubMember',
      KeyConditionExpression: 'userId = :userId AND clubId = :clubId',
      FilterExpression: '#status = :activeStatus',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':clubId': clubId,
        ':activeStatus': 'ACTIVE',
      },
    };

    const result = await this._docClient.query(params).promise();
    return result.Items && result.Items.length > 0;
  }

  /**
   * Fetch a whiskey by ID
   * @param {string} whiskeyId
   * @returns {Promise<Object|null>}
   */
  async findWhiskeyById(whiskeyId) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
      Key: { id: whiskeyId },
    };
    const { Item } = await this._docClient.get(params).promise();
    return Item || null;
  }
}

module.exports = ClubRepository;
