/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERPOURSTABLE_ARN
	API_WHISKEYSOCIAL_USERPOURSTABLE_NAME
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();

const { API_WHISKEYSOCIAL_USERPOURSTABLE_NAME, API_WHISKEYSOCIAL_WHISKEYTABLE_NAME, API_WHISKEYSOCIAL_USERTABLE_NAME } = process.env;

// Function to get whiskey with brandUser data using DynamoDB
async function getWhiskeyWithBrandUser(whiskeyId) {
  try {
    // Get whiskey record
    const whiskeyResult = await db.get({
      TableName: API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
      Key: { id: whiskeyId }
    }).promise();

    const whiskey = whiskeyResult.Item;
    if (!whiskey) {
      console.error(`Whiskey not found: ${whiskeyId}`);
      return null;
    }

    // If whiskey has a brandId, get the brand user data
    let brandUser = null;
    if (whiskey.brandId) {
      try {
        const brandUserResult = await db.get({
          TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
          Key: { id: whiskey.brandId }
        }).promise();
        brandUser = brandUserResult.Item;
      } catch (error) {
        console.warn(`Failed to fetch brand user ${whiskey.brandId}:`, error);
      }
    }

    // Return whiskey data with brandUser attached
    return {
      ...whiskey,
      brandUser: brandUser
    };
  } catch (error) {
    console.error('Error fetching whiskey data:', error);
    return null;
  }
}

// Function to generate fullName from whiskey data
function generateFullName(whiskey) {
  const brandName = whiskey?.brandUser?.brandName || whiskey?.brand || '';
  const whiskeyName = whiskey?.name || '';

  return `${brandName} ${whiskeyName}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks (accents, umlauts, etc.) - Unicode range U+0300-U+036F
    .replace(/&/g, 'ëéèê')
    .toLowerCase()
    .trim();
}

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  for (const record of event.Records) {
    console.log(record.eventID);
    console.log(record.eventName);
    console.log('DynamoDB Record: %j', record.dynamodb);
    console.log('whiskeyId', record.dynamodb.Keys.id.S);

    if (record.eventName === 'MODIFY' || record.eventName === 'INSERT') {
      const whiskeyId = record.dynamodb.Keys.id.S;

      // Get whiskey data with brandUser relationship
      const whiskeyData = await getWhiskeyWithBrandUser(whiskeyId);

      if (!whiskeyData) {
        console.error(`Failed to fetch whiskey data for ID: ${whiskeyId}`);
        continue;
      }

      // Generate fullName using brandUser.brandName
      const newFullName = generateFullName(whiskeyData);

      // Check if fullName actually changed (for MODIFY events)
      const oldFullName = record.dynamodb.OldImage?.fullName?.S;
      if (record.eventName === 'MODIFY' && oldFullName === newFullName) {
        console.log(`No fullName change for whiskey ${whiskeyId}, skipping`);
        continue;
      }

      console.log(`Updating fullName for whiskey ${whiskeyId}: "${oldFullName}" -> "${newFullName}"`);

      // Update the whiskey record's fullName if it's different
      if (record.dynamodb.NewImage?.fullName?.S !== newFullName) {
        try {
          await db.update({
            TableName: API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
            Key: { id: whiskeyId },
            UpdateExpression: 'set fullName = :fullName',
            ExpressionAttributeValues: {
              ':fullName': newFullName
            }
          }).promise();
        } catch (error) {
          console.error(`Failed to update whiskey fullName for ${whiskeyId}:`, error);
        }
      }

      // Update related UserPours records
      const data = await db.scan({
        TableName: API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
        FilterExpression: 'whiskeyId = :whiskey',
        ExpressionAttributeValues: {
          ':whiskey': whiskeyId
        }
      }).promise();

      for (const item of data.Items) {
        try {
          await db.update({
            TableName: API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
            Key: {
              id: item.id
            },
            UpdateExpression: 'set whiskeyFullName = :fullName',
            ExpressionAttributeValues: {
              ':fullName': newFullName
            }
          }).promise();
        } catch (error) {
          console.error(`Failed to update UserPour ${item.id}:`, error);
        }
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify('OK'),
  };
};
