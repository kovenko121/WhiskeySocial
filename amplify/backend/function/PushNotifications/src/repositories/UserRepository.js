const AWS = require('aws-sdk');
const User = require('../entities/User');

class UserRepository {
  constructor() {
    this._docClient = new AWS.DynamoDB.DocumentClient();
  }

  async findUsersData(ids) {
    const params = {
      RequestItems: {},
    };
    params.RequestItems[process.env.API_WHISKEYSOCIAL_USERTABLE_NAME] = {
      Keys: ids.map((id) => ({ id: id })),
    };
    const { Responses } = await this._docClient.batchGet(params).promise();
    return Responses[process.env.API_WHISKEYSOCIAL_USERTABLE_NAME].map(
      (i) => new User(i)
    );
  }
}

module.exports = UserRepository;
