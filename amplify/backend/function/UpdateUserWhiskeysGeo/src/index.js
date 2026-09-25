/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERWHISKEYSTABLE_ARN
	API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const { API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME } = process.env;

const getAllUserWhiskey = async (userId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME,
    IndexName: 'byUserWhiskey',
    KeyConditionExpression: 'userId = :value',
    ExpressionAttributeValues: {
      ':value': userId,
    },
    ProjectionExpression: 'id',
  };
  const userWhiskeys = await docClient.query(params).promise();
  return userWhiskeys.Items;
};

const updateAllUserWhiskey = async (userId, lat, lon) => {
  const userWhiskeys = await getAllUserWhiskey(userId);

  await Promise.all(
    userWhiskeys.map((userWhiskey) => {
      const params = {
        TableName: API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME,
        Key: {
          id: userWhiskey.id,
        },
        UpdateExpression: 'SET #geo = :geo',
        ExpressionAttributeNames: {
          '#geo': 'geo',
        },
        ExpressionAttributeValues: {
          ':geo': {
            lat,
            lon,
          },
        },
      };
      return docClient.update(params).promise();
    })
  );

  return Promise.resolve('Successfully updated items');
};

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    try {
      const userId = record.dynamodb.NewImage.id.S;
      const lat = record.dynamodb.NewImage.venueAddressGeo.M.lat.N;
      const lon = record.dynamodb.NewImage.venueAddressGeo.M.lon.N;

      if (lat || lon) {
        return updateAllUserWhiskey(userId, lat, lon);
      }
    } catch (err) {
      console.log(err);
      return Promise.resolve('An error occured');
    }
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
