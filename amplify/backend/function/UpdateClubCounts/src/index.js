/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_ARN
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
	API_WHISKEYSOCIAL_CLUBTABLE_ARN
	API_WHISKEYSOCIAL_CLUBTABLE_NAME
	API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * Lambda: UpdateClubCounts
 * Created: 2025-11-13
 * Purpose: Maintain denormalized counts on Club model (memberCount, whiskeyCount)
 * Trigger: DynamoDB Streams on ClubMember and ClubWhiskey tables
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Main handler - processes DynamoDB stream events from multiple tables
 * @type {import('@types/aws-lambda').DynamoDBStreamHandler}
 */
exports.handler = async (event) => {
  console.log('=== UpdateClubCounts Lambda Triggered ===');
  console.log(`Processing ${event.Records.length} record(s)`);

  for (const record of event.Records) {
    // Extract table name from ARN: arn:aws:dynamodb:region:account:table/TableName/stream/timestamp
    // Note: Cannot split by ':' because the stream timestamp contains colons (e.g., 2025-11-17T22:05:28.124)
    // Use regex to extract table name from "table/TableName/stream" pattern
    const arn = record.eventSourceARN;
    const tableMatch = arn.match(/table\/([^\/]+)/);
    const tableName = tableMatch ? tableMatch[1] : null;

    try {
      if (!tableName) {
        console.error('⚠️  Could not extract table name from ARN:', arn);
        continue;
      }

      console.log(`Processing event from table: ${tableName}`);

      if (tableName === process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME) {
        await handleClubMemberChange(record);
      } else if (
        tableName === process.env.API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME
      ) {
        await handleClubWhiskeyChange(record);
      } else {
        console.log(`⚠️  Ignoring event from unexpected table: ${tableName}`);
      }
    } catch (error) {
      console.error('Error processing record:', error);
      console.error('Table:', tableName);
      console.error('Event:', record.eventName);
      // Continue processing other records
    }
  }

  console.log('=== Lambda Complete ===\n');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Counts updated',
    }),
  };
};

/**
 * Handle ClubMember table changes (INSERT, MODIFY, REMOVE)
 */
async function handleClubMemberChange(record) {
  const eventName = record.eventName;
  let clubId, oldStatus, newStatus;

  if (eventName === 'INSERT') {
    const newImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.NewImage
    );
    clubId = newImage.clubId;
    newStatus = newImage.status;
    console.log(`Member INSERT: Club ${clubId}, Status ${newStatus}`);
    await updateMemberCounts(clubId, null, newStatus);
  } else if (eventName === 'MODIFY') {
    const oldImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.OldImage
    );
    const newImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.NewImage
    );
    clubId = newImage.clubId;
    oldStatus = oldImage.status;
    newStatus = newImage.status;

    if (oldStatus !== newStatus) {
      console.log(
        `Member MODIFY: Club ${clubId}, Status ${oldStatus} → ${newStatus}`
      );
      await updateMemberCounts(clubId, oldStatus, newStatus);
    }
  } else if (eventName === 'REMOVE') {
    const oldImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.OldImage
    );
    clubId = oldImage.clubId;
    oldStatus = oldImage.status;
    console.log(`Member REMOVE: Club ${clubId}, Status ${oldStatus}`);
    await updateMemberCounts(clubId, oldStatus, null);
  }
}

/**
 * Update member counts on Club model
 */
async function updateMemberCounts(clubId, oldStatus, newStatus) {
  // Calculate net change for ACTIVE members
  const oldCount = oldStatus === 'ACTIVE' ? 1 : 0;
  const newCount = newStatus === 'ACTIVE' ? 1 : 0;
  const delta = newCount - oldCount;

  // If no net change, skip update
  if (delta === 0) {
    console.log(
      `No count change for club ${clubId} (both statuses ${
        oldStatus === 'ACTIVE' ? 'ACTIVE' : 'not ACTIVE'
      })`
    );
    return;
  }

  const attributeValues = {
    ':delta': Math.abs(delta),
    ':zero': 0,
    ':now': new Date().toISOString(),
  };

  const updateParams = {
    TableName: process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME,
    Key: { id: clubId },
    UpdateExpression:
      delta > 0
        ? 'SET memberCount = if_not_exists(memberCount, :zero) + :delta, updatedAt = :now'
        : 'SET memberCount = if_not_exists(memberCount, :zero) - :delta, updatedAt = :now',
    ExpressionAttributeValues: attributeValues,
  };

  // Add condition to prevent negative counts when decrementing
  // Check that memberCount exists and is greater than 0
  if (delta < 0) {
    updateParams.ConditionExpression =
      'attribute_exists(memberCount) AND memberCount > :zero';
  }

  try {
    await dynamodb.update(updateParams).promise();
    console.log(
      `✓ Updated memberCount for club ${clubId} (${
        delta > 0 ? '+' : ''
      }${delta})`
    );
  } catch (err) {
    // If condition fails (count already at 0), log but don't fail
    if (err.code === 'ConditionalCheckFailedException') {
      console.log(
        `⚠️  Warning: memberCount already at 0 for club ${clubId}, cannot decrement`
      );
    } else {
      throw err;
    }
  }
}

/**
 * Handle ClubWhiskey table changes (INSERT, REMOVE)
 * Note: MODIFY events are ignored as whiskey count only changes on INSERT/REMOVE
 */
async function handleClubWhiskeyChange(record) {
  const eventName = record.eventName;
  let clubId;

  if (eventName === 'INSERT') {
    const newImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.NewImage
    );
    clubId = newImage.clubId;
    console.log(`Whiskey INSERT: Club ${clubId}`);
    await incrementWhiskeyCount(clubId);
  } else if (eventName === 'REMOVE') {
    const oldImage = AWS.DynamoDB.Converter.unmarshall(
      record.dynamodb.OldImage
    );
    clubId = oldImage.clubId;
    console.log(`Whiskey REMOVE: Club ${clubId}`);
    await decrementWhiskeyCount(clubId);
  }
  // MODIFY events are intentionally ignored - count doesn't change
}

/**
 * Increment whiskey count
 */
async function incrementWhiskeyCount(clubId) {
  try {
    await dynamodb
      .update({
        TableName: process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME,
        Key: { id: clubId },
        UpdateExpression:
          'SET whiskeyCount = if_not_exists(whiskeyCount, :zero) + :inc, updatedAt = :now',
        ExpressionAttributeValues: {
          ':inc': 1,
          ':zero': 0,
          ':now': new Date().toISOString(),
        },
      })
      .promise();

    console.log(`✓ Incremented whiskey count for club ${clubId}`);
  } catch (err) {
    console.error(`Error incrementing whiskey count for club ${clubId}:`, err);
    throw err;
  }
}

/**
 * Decrement whiskey count
 */
async function decrementWhiskeyCount(clubId) {
  try {
    await dynamodb
      .update({
        TableName: process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME,
        Key: { id: clubId },
        UpdateExpression:
          'SET whiskeyCount = if_not_exists(whiskeyCount, :zero) - :dec, updatedAt = :now',
        ConditionExpression:
          'attribute_exists(whiskeyCount) AND whiskeyCount > :zero', // Prevent negative counts
        ExpressionAttributeValues: {
          ':dec': 1,
          ':zero': 0,
          ':now': new Date().toISOString(),
        },
      })
      .promise();
    console.log(`✓ Decremented whiskey count for club ${clubId}`);
  } catch (err) {
    // If condition fails (count already at 0), log but don't fail
    if (err.code === 'ConditionalCheckFailedException') {
      console.log(
        `⚠️  Warning: whiskeyCount already at 0 for club ${clubId}, cannot decrement`
      );
    } else {
      throw err;
    }
  }
}
