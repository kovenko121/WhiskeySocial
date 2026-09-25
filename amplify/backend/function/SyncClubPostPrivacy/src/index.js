/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CLUBTABLE_ARN
	API_WHISKEYSOCIAL_CLUBTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_POSTTABLE_ARN
	API_WHISKEYSOCIAL_POSTTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * Lambda: SyncClubPostPrivacy
 * Created: 2025-11-13
 * Purpose: When a club's isPrivate field changes, update all posts in that club
 * Trigger: DynamoDB Stream on Club table (MODIFY events)
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

/**
 * Helper function to chunk an array into smaller batches
 */
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Main handler - processes DynamoDB stream events from Club table
 * @type {import('@types/aws-lambda').DynamoDBStreamHandler}
 */
exports.handler = async (event) => {
  console.log('=== SyncClubPostPrivacy Lambda Triggered ===');
  console.log(`Processing ${event.Records.length} record(s)`);

  for (const record of event.Records) {
    // Only process MODIFY events
    if (record.eventName !== 'MODIFY') {
      continue;
    }

    try {
      const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
      const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

      // Check if isPrivate field changed
      if (oldImage.isPrivate === newImage.isPrivate) {
        continue;
      }

      const clubId = newImage.id;
      const newPrivacySetting = newImage.isPrivate;

      console.log(`Club ${clubId} privacy changed: ${oldImage.isPrivate} → ${newPrivacySetting}`);

      // Query all posts for this club
      let nextToken = null;
      let totalUpdated = 0;

      do {
        const queryParams = {
          TableName: process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME,
          IndexName: 'byPostClub',
          KeyConditionExpression: 'clubId = :clubId',
          ExpressionAttributeValues: {
            ':clubId': clubId
          },
          ExclusiveStartKey: nextToken
        };

        const result = await dynamodb.query(queryParams).promise();
        const posts = result.Items || [];

        console.log(`Found ${posts.length} posts in batch`);

        // Update posts in batches to manage memory and avoid overwhelming DynamoDB
        const BATCH_SIZE = 20; // Process 20 posts at a time
        const postChunks = chunkArray(posts, BATCH_SIZE);
        for (const chunk of postChunks) {
          const updatePromises = chunk.map(post =>
            dynamodb.update({
              TableName: process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME,
              Key: { id: post.id },
              UpdateExpression: 'SET clubIsPrivate = :isPrivate, updatedAt = :now',
              ExpressionAttributeValues: {
                ':isPrivate': newPrivacySetting,
                ':now': new Date().toISOString()
              }
            }).promise()
          );
          const results = await Promise.allSettled(updatePromises);
          let failedCount = 0;
          results.forEach((result, idx) => {
            if (result.status === 'rejected') {
              failedCount++;
              console.error(`    ❌ Failed to update post ${chunk[idx].id}:`, result.reason);
            }
          });
          totalUpdated += (chunk.length - failedCount);
        }

        nextToken = result.LastEvaluatedKey;
      } while (nextToken);

      console.log(`✓ Updated ${totalUpdated} posts for club ${clubId}`);
    } catch (error) {
      console.error('Error processing record:', error.message);
      console.error('Club ID:', record.dynamodb.Keys?.id?.S);
      console.error('Error details:', error);
      // Continue processing other records
    }
  }

  console.log('=== Lambda Complete ===\n');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Privacy sync completed'
    })
  };
};
