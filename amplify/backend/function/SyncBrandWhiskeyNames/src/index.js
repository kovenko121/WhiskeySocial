/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
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

const {
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
  API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
} = process.env;

/**
 * Generate fullName from brand name and whiskey name
 * Must match the logic in SyncWhiskeyName Lambda
 */
function generateFullName(brandName, whiskeyName) {
  return `${brandName} ${whiskeyName}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .replace(/&/g, 'ëéèê')
    .toLowerCase()
    .trim();
}

/**
 * Get all whiskeys for a brand
 */
async function getWhiskeysForBrand(brandId) {
  try {
    const result = await db
      .query({
        TableName: API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
        IndexName: 'byBrand',
        KeyConditionExpression: 'brandId = :brandId',
        ExpressionAttributeValues: {
          ':brandId': brandId,
        },
      })
      .promise();

    return result.Items || [];
  } catch (error) {
    console.error(`Error querying whiskeys for brand ${brandId}:`, error);
    throw error;
  }
}

/**
 * Update whiskey fullName
 */
async function updateWhiskeyFullName(whiskeyId, newFullName) {
  try {
    await db
      .update({
        TableName: API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
        Key: { id: whiskeyId },
        UpdateExpression: 'set fullName = :fullName',
        ExpressionAttributeValues: {
          ':fullName': newFullName,
        },
      })
      .promise();

    console.log(`✓ Updated whiskey ${whiskeyId} fullName to: ${newFullName}`);
  } catch (error) {
    console.error(`✗ Failed to update whiskey ${whiskeyId}:`, error);
    throw error;
  }
}

/**
 * Update all UserPours records for a whiskey
 */
async function updateUserPoursForWhiskey(whiskeyId, newFullName) {
  try {
    // Scan for all UserPours with this whiskeyId
    const result = await db
      .scan({
        TableName: API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
        FilterExpression: 'whiskeyId = :whiskeyId',
        ExpressionAttributeValues: {
          ':whiskeyId': whiskeyId,
        },
      })
      .promise();

    const userPours = result.Items || [];

    // Update each UserPour
    for (const pour of userPours) {
      try {
        await db
          .update({
            TableName: API_WHISKEYSOCIAL_USERPOURSTABLE_NAME,
            Key: { id: pour.id },
            UpdateExpression: 'set whiskeyFullName = :fullName',
            ExpressionAttributeValues: {
              ':fullName': newFullName,
            },
          })
          .promise();

        console.log(`  ✓ Updated UserPour ${pour.id}`);
      } catch (error) {
        console.error(`  ✗ Failed to update UserPour ${pour.id}:`, error);
      }
    }

    return userPours.length;
  } catch (error) {
    console.error(`Error updating UserPours for whiskey ${whiskeyId}:`, error);
    return 0;
  }
}

/**
 * Main handler - processes DynamoDB stream events from User table
 * @type {import('@types/aws-lambda').DynamoDBStreamHandler}
 */
exports.handler = async (event) => {
  console.log('=== SyncBrandWhiskeyNames Lambda Triggered ===');
  console.log(`Processing ${event.Records.length} record(s)`);

  let totalWhiskeysUpdated = 0;
  let totalUserPoursUpdated = 0;

  for (const record of event.Records) {
    // Only process MODIFY events
    if (record.eventName !== 'MODIFY') {
      continue;
    }

    try {
      const oldImage = record.dynamodb.OldImage;
      const newImage = record.dynamodb.NewImage;

      // Check if this is a BRAND user
      const userType = newImage?.userType?.S;
      if (userType !== 'BRAND') {
        continue;
      }

      // Check if brandName changed
      const oldBrandName = oldImage?.brandName?.S;
      const newBrandName = newImage?.brandName?.S;

      if (!oldBrandName || !newBrandName || oldBrandName === newBrandName) {
        continue;
      }

      console.log(`Brand name changed: "${oldBrandName}" → "${newBrandName}"`);

      const brandId = record.dynamodb.Keys.id.S;

      // Get all whiskeys for this brand
      const whiskeys = await getWhiskeysForBrand(brandId);
      console.log(`Found ${whiskeys.length} whiskey(s) for brand ${brandId}`);

      // Update each whiskey
      for (const whiskey of whiskeys) {
        const oldFullName = whiskey.fullName;
        const newFullName = generateFullName(newBrandName, whiskey.name || '');

        console.log(
          'Old Full Name:',
          oldFullName,
          'New Full Name:',
          newFullName
        );
        if (oldFullName === newFullName) {
          continue;
        }

        // Update whiskey
        await updateWhiskeyFullName(whiskey.id, newFullName);
        totalWhiskeysUpdated++;

        // Update related UserPours
        const poursUpdated = await updateUserPoursForWhiskey(
          whiskey.id,
          newFullName
        );
        totalUserPoursUpdated += poursUpdated;
      }
    } catch (error) {
      console.error('Error processing record:', error.message);
      console.error('User ID:', record.dynamodb.Keys?.id?.S);
      console.error('Error details:', error);
      // Continue processing other records
    }
  }

  console.log('\n=== Summary ===');
  console.log(`Total of ${event.Records.length} record(s) processed`);
  console.log(`Total Whiskeys Updated: ${totalWhiskeysUpdated}`);
  console.log(`Total UserPours Updated: ${totalUserPoursUpdated}`);
  console.log('=== Lambda Complete ===\n');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Sync complete',
      whiskeysUpdated: totalWhiskeysUpdated,
      userPoursUpdated: totalUserPoursUpdated,
    }),
  };
};
