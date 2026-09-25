const AWS = require('aws-sdk');
const User = require('../entities/User');

class PostRepository {
  constructor() {
    this._docClient = new AWS.DynamoDB.DocumentClient();
  }

  async findPosts(ids) {
    const params = {
      RequestItems: {},
    };

    params.RequestItems[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME] = {
      Keys: ids.map((id) => ({ id: id })),
    };
    const { Responses } = await this._docClient.batchGet(params).promise();
    return Responses[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME];
  }

  async findPostById(id) {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME,
      Key: { id },
    };
    const { Item } = await this._docClient.get(params).promise();
    return Item;
  }
}

module.exports = PostRepository;
