/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const removeFollowing = (myUser, targetUser) => {
  return new Promise((resolve, reject) => {
    const params = {
      TransactItems: [
        {
          Update: {
            TableName: process.env.API_WHISKEYSOCIAL_USERTABLE_NAME,
            Key: { id: myUser },
            ExpressionAttributeNames: {
              '#following': 'following',
            },
            ExpressionAttributeValues: {
              ':following': docClient.createSet([targetUser]),
            },
            UpdateExpression: 'DELETE  #following :following',
          },
        },
        {
          Update: {
            TableName: process.env.API_WHISKEYSOCIAL_USERTABLE_NAME,
            Key: { id: targetUser },
            ExpressionAttributeNames: {
              '#followers': 'followers',
            },
            ExpressionAttributeValues: {
              ':followers': docClient.createSet([myUser]),
            },
            UpdateExpression: 'DELETE  #followers :followers',
          },
        },
      ],
    };

    docClient.transactWrite(params, (err) => {
      if (err) reject(err);
      else resolve(true);
    });
  });
};

exports.handler = async (event) => {
  const { user } = event.arguments;

  if (user === event.identity.username) {
    throw new Error('Cannot unfollow yourself');
  }

  await removeFollowing(event.identity.sub, user);
  return true;
};
