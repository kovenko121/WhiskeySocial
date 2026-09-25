/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_ARN
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */const AWS = require('aws-sdk');
const fetchNotifications = async (docClient, userId) => {
  const fetchNotifications = {
    TableName: process.env.API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME,
    IndexName: 'byUserId',
    KeyConditionExpression: 'userId = :value',
    ExpressionAttributeValues: {
      ':value': userId,
    },
    ProjectionExpression: 'id',
  };
  const notifications = await docClient.query(fetchNotifications).promise();
  return notifications.Items;
};

const removeNotifications = async (docClient, notifications) => {
  const request = {
    RequestItems: {},
  };

  if (notifications.length > 0) {
    request.RequestItems[process.env.API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME] =
      notifications.map((notification) => ({
        DeleteRequest: {
          Key: {
            id: notification.id,
          },
        },
      }));
  }

  if (Object.keys(request.RequestItems).length === 0) {
    return Promise.resolve('No items to delete');
  }

  const batchReturn = await docClient.batchWrite(request).promise();
  console.log(batchReturn);

  return true;
};

exports.handler = async (event) => {
  const docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
  });
  console.log(`EVENT: ${JSON.stringify(event)}`);
  try {
    const userId = event.identity.sub;
    const notifications = await fetchNotifications(docClient, userId);

    const batches = [];
    for (let i = 0; i < notifications.length; i += 25) {
      batches.push(removeNotifications(docClient, notifications.slice(i, i + 25)));
    }
    await Promise.all(batches);
  } catch (err) {
    console.log(err);
    return false;
  }
};
