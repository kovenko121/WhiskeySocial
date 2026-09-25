/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT *//* Amplify Params - DO NOT EDIT
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

const addFollowing = (myUser, targetUser) => {
  return new Promise((resolve, reject) => {
    const params = {
      TransactItems: [
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
            UpdateExpression: 'ADD  #followers :followers',
          },
        },
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
            UpdateExpression: 'ADD  #following :following',
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

const checkIfUserExists = async (user) => {
  const params = {
    TableName: process.env.API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: { id: user },
  };

  const { Item } = await docClient.get(params).promise();
  if (!Item) {
    throw new Error('User does not exist');
  }
};

exports.handler = async (event) => {
  const { user } = event.arguments;

  if (user === event.identity.username) {
    throw new Error('Cannot follow yourself');
  }
  await checkIfUserExists(user);
  await addFollowing(event.identity.sub, user);

  return true;
};
