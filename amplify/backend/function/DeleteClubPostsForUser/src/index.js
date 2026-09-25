/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_ARN
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_POSTTABLE_ARN
	API_WHISKEYSOCIAL_POSTTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * Lambda: DeleteClubPostsForUser
 * Created: 2025-11-13
 * Purpose: When a user is blocked from a club, delete all their posts in that club
 * Trigger: DynamoDB Stream on ClubMember table (MODIFY where status→BLOCKED)
 * Note: Posts are NOT deleted when a user is simply removed/kicked from a club
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const CLUB_TABLE = process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME;

/**
 * Main handler - processes DynamoDB stream events from ClubMember table
 * @type {import('@types/aws-lambda').DynamoDBStreamHandler}
 */
exports.handler = async (event) => {
  console.log('=== DeleteClubPostsForUser Lambda Triggered ===');
  console.log(`Processing ${event.Records.length} record(s)`);

  for (const record of event.Records) {
    let clubId, userId, shouldDelete = false;

    try {
      if (record.eventName === 'MODIFY') {
        // Check if status changed to BLOCKED
        const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        const newImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage);

        if (newImage.status === 'BLOCKED' && oldImage.status !== 'BLOCKED') {
          clubId = newImage.clubId;
          userId = newImage.userId;
          shouldDelete = true;
          console.log(`User ${userId} was blocked from club ${clubId} - deleting their posts`);
        }
      } else if (record.eventName === 'REMOVE') {
        // Member was removed/kicked - do NOT delete their posts
        const oldImage = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage);
        console.log(`User ${oldImage.userId} was removed from club ${oldImage.clubId} - keeping their posts`);
        // shouldDelete remains false
      }

      if (!shouldDelete) continue;

      // Query all posts by this user in this club using efficient GSI
      let nextToken = null;
      let totalDeleted = 0;
      let shouldClearPinnedPost = false;

      // Check if any of the posts to delete is the club's pinned post
      const clubResult = await dynamodb
        .get({
          TableName: CLUB_TABLE,
          Key: { id: clubId },
        })
        .promise();

      const pinnedPostId = clubResult.Item?.pinnedPostId;

      do {
        const queryParams = {
          TableName: process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME,
          IndexName: 'byAuthorAndClub',
          KeyConditionExpression: 'authorId = :userId AND clubId = :clubId',
          ExpressionAttributeValues: {
            ':userId': userId,
            ':clubId': clubId
          },
          ExclusiveStartKey: nextToken
        };

        const result = await dynamodb.query(queryParams).promise();
        const posts = result.Items || [];

        console.log(`Found ${posts.length} posts to delete in batch`);

        // Check if the pinned post is in this batch
        if (pinnedPostId && !shouldClearPinnedPost) {
          const postIds = posts.map((post) => post.id);
          if (postIds.includes(pinnedPostId)) {
            shouldClearPinnedPost = true;
            console.log(
              `⚠️  Pinned post ${pinnedPostId} will be deleted - will clear club's pinnedPostId`
            );
          }
        }

        // Delete posts using true DynamoDB batch operations (max 25 per batch)
        const batchSize = 25;
        for (let i = 0; i < posts.length; i += batchSize) {
          const batch = posts.slice(i, i + batchSize);

          const batchParams = {
            RequestItems: {
              [process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME]: batch.map(post => ({
                DeleteRequest: {
                  Key: { id: post.id }
                }
              }))
            }
          };

          // Retry batchWrite for unprocessed items
          let unprocessed = batchParams.RequestItems[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME];
          let retryCount = 0;
          const maxRetries = 5;
          do {
            const response = await dynamodb.batchWrite({
              RequestItems: {
                [process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME]: unprocessed
              }
            }).promise();
            // UnprocessedItems is an object/map, not an array
            if (response.UnprocessedItems &&
                response.UnprocessedItems[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME] &&
                response.UnprocessedItems[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME].length > 0) {
              unprocessed = response.UnprocessedItems[process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME];
              retryCount++;
              console.warn(`    ⚠️  ${unprocessed.length} items unprocessed, retrying (attempt ${retryCount})`);
              await new Promise(res => setTimeout(res, 200 * retryCount)); // Exponential backoff
            } else {
              unprocessed = [];
            }
          } while (unprocessed.length > 0 && retryCount < maxRetries);

          // Track actual successful deletes
          const successfullyDeleted = batch.length - unprocessed.length;
          totalDeleted += successfullyDeleted;

          if (unprocessed.length > 0) {
            console.error(`    ❌ Failed to delete ${unprocessed.length} posts after ${maxRetries} retries`);
          } else {
            console.log(`  ✓ Deleted batch of ${batch.length} posts`);
          }
        }

        nextToken = result.LastEvaluatedKey;
      } while (nextToken);

      // Clear pinnedPostId if the pinned post was deleted
      if (shouldClearPinnedPost) {
        await dynamodb
          .update({
            TableName: CLUB_TABLE,
            Key: { id: clubId },
            UpdateExpression: 'REMOVE pinnedPostId',
          })
          .promise();
        console.log(`✓ Cleared pinnedPostId on club ${clubId}`);
      }

      console.log(`✓ Deleted ${totalDeleted} posts by user ${userId} in club ${clubId}`);
    } catch (error) {
      console.error('Error processing record:', error.message);
      console.error('Club ID:', clubId);
      console.error('User ID:', userId);
      console.error('Error details:', error);
      // Continue processing other records
    }
  }

  console.log('=== Lambda Complete ===\n');

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Cleanup completed'
    })
  };
};
