/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERPOURSTABLE_ARN
	API_WHISKEYSOCIAL_USERPOURSTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);

    if (record.eventName === 'INSERT' && record.dynamodb.NewImage) {
      const pour = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      const params = {
        TableName: process.env.API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
        FilterExpression: 'userId = :userId and whiskeyId = :whiskeyId',
        ExpressionAttributeValues: {
          ':userId': pour.userId,
          ':whiskeyId': pour.whiskeyId,
        },
      };
      const results = await docClient.scan(params).promise();

      console.log('RESULT', results);
      console.log('COUNT', results.Count);

      const pourCount = results.Count;
      await Promise.all(
        results.Items.map(async (item) => {
          const params = {
            TableName: process.env.API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
            Key: {
              id: item.id,
            },
            UpdateExpression: 'set #count = :count',
            ExpressionAttributeNames: {
              '#count': 'count',
            },
            ExpressionAttributeValues: {
              ':count': pourCount,
            },
          };
          await docClient.update(params).promise();
        })
      );
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda!'),
  };
};
