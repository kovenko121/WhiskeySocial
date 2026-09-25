/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_REWARDTABLE_ARN
	API_WHISKEYSOCIAL_REWARDTABLE_NAME
	API_WHISKEYSOCIAL_USERREWARDTABLE_ARN
	API_WHISKEYSOCIAL_USERREWARDTABLE_NAME
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const docClient = new AWS.DynamoDB.DocumentClient();

const {
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  API_WHISKEYSOCIAL_USERREWARDTABLE_NAME,
  API_WHISKEYSOCIAL_REWARDTABLE_NAME,
} = process.env;

const setUserIsOnRewards = async (user) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: {
      id: user,
    },
    UpdateExpression: 'set isOnRewards = :isOnRewards',
    ExpressionAttributeValues: {
      ':isOnRewards': true,
    },
  };

  await docClient.update(params).promise();
};

const getAllRewards = () => {
  const params = {
    TableName: API_WHISKEYSOCIAL_REWARDTABLE_NAME,
  };

  return docClient.scan(params).promise();
};

const getUserRewards = async (userId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERREWARDTABLE_NAME,
    IndexName: 'byUser',
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
    },
  };

  const { Items } = await docClient.query(params).promise();
  return Items;
};

const createUserRewards = async (userId) => {
  const { Items } = await getAllRewards();
  const userRewards = await getUserRewards(userId);

  if (userRewards.length !== 0) {
    return;
  }

  const params = {
    RequestItems: {
      [API_WHISKEYSOCIAL_USERREWARDTABLE_NAME]: Items.map((item) => ({
        PutRequest: {
          Item: {
            id: uuidv4(),
            userId,
            rewardId: item.id,
            isRedeemed: false,
            isCompleted: false,
            lastScoreUpdate: '2000-01-01T20:01:01.100Z',
            owner: userId,
            score: 0,
          },
        },
      })),
    },
  };

  await docClient.batchWrite(params).promise();
};

exports.handler = async (event) => {
  const { sub } = event.identity;
  try {
    await setUserIsOnRewards(sub);
    await createUserRewards(sub);

    return true;
  } catch (error) {
    console.log({ error, event });
    return false;
  }
};
