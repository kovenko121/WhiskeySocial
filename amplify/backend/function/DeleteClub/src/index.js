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
	API_WHISKEYSOCIAL_POSTTABLE_ARN
	API_WHISKEYSOCIAL_POSTTABLE_NAME
	ENV
	REGION
	TOKEN
Amplify Params - DO NOT EDIT */

/**
 * Lambda: DeleteClub
 * Purpose: Permanently delete a club and all associated data (members, whiskeys, posts)
 * Trigger: GraphQL mutation deleteClubAdmin
 *
 * Deletion Order:
 * 1. ClubMember records
 * 2. ClubWhiskey records
 * 3. Post records (Comments/Likes cleaned up by DeletePostCleanUp Lambda)
 * 4. Club record
 *
 * If failure occurs, returns which step failed. Retry is safe - each step
 * queries for remaining items, so already-deleted items won't be re-processed.
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const {
  API_WHISKEYSOCIAL_CLUBTABLE_NAME,
  API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME,
  API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME,
  API_WHISKEYSOCIAL_POSTTABLE_NAME,
  TOKEN,
} = process.env;

// Constants
const BATCH_SIZE = 25; // DynamoDB limit
const MAX_RETRIES = 5;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate clubId is a valid UUID string
 */
const isValidClubId = (clubId) => {
  return typeof clubId === 'string' && UUID_REGEX.test(clubId);
};

// Deletion steps for progress tracking
const STEPS = {
  MEMBERS: 'deleting members',
  WHISKEYS: 'deleting whiskeys',
  POSTS: 'deleting posts',
  CLUB: 'deleting club record',
};

/**
 * Query items from a GSI with pagination
 */
const queryAllItems = async (tableName, indexName, keyConditionExpression, expressionAttributeValues) => {
  const items = [];
  let nextToken = null;

  do {
    const params = {
      TableName: tableName,
      IndexName: indexName,
      KeyConditionExpression: keyConditionExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExclusiveStartKey: nextToken,
    };

    const result = await dynamodb.query(params).promise();
    items.push(...(result.Items || []));
    nextToken = result.LastEvaluatedKey;
  } while (nextToken);

  return items;
};

/**
 * Batch delete items with retry logic and exponential backoff
 */
const batchDeleteItems = async (tableName, items) => {
  if (items.length === 0) {
    return 0;
  }

  let totalDeleted = 0;

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);

    let unprocessed = batch.map(item => ({
      DeleteRequest: {
        Key: { id: item.id },
      },
    }));

    let retryCount = 0;

    do {
      const response = await dynamodb.batchWrite({
        RequestItems: {
          [tableName]: unprocessed,
        },
      }).promise();

      const unprocessedItems = response.UnprocessedItems?.[tableName];

      if (unprocessedItems && unprocessedItems.length > 0) {
        unprocessed = unprocessedItems;
        retryCount++;
        const backoffMs = 200 * Math.pow(2, retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
      } else {
        totalDeleted += batch.length;
        unprocessed = [];
      }
    } while (unprocessed.length > 0 && retryCount < MAX_RETRIES);

    if (unprocessed.length > 0) {
      const successCount = batch.length - unprocessed.length;
      totalDeleted += successCount;
      throw new Error(`Failed to delete ${unprocessed.length} items after ${MAX_RETRIES} retries`);
    }
  }

  return totalDeleted;
};

/**
 * Delete all club members
 */
const deleteClubMembers = async (clubId) => {
  const members = await queryAllItems(
    API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME,
    'byClubClubMember',
    'clubId = :clubId',
    { ':clubId': clubId }
  );

  if (members.length === 0) {
    return 0;
  }

  return batchDeleteItems(API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME, members);
};

/**
 * Delete all club whiskeys
 */
const deleteClubWhiskeys = async (clubId) => {
  const whiskeys = await queryAllItems(
    API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME,
    'byClubClubWhiskey',
    'clubId = :clubId',
    { ':clubId': clubId }
  );

  if (whiskeys.length === 0) {
    return 0;
  }

  return batchDeleteItems(API_WHISKEYSOCIAL_CLUBWHISKEYTABLE_NAME, whiskeys);
};

/**
 * Delete all club posts
 */
const deleteClubPosts = async (clubId) => {
  const posts = await queryAllItems(
    API_WHISKEYSOCIAL_POSTTABLE_NAME,
    'byPostClub',
    'clubId = :clubId',
    { ':clubId': clubId }
  );

  if (posts.length === 0) {
    return 0;
  }

  return batchDeleteItems(API_WHISKEYSOCIAL_POSTTABLE_NAME, posts);
};

/**
 * Delete the club record
 */
const deleteClubRecord = async (clubId) => {
  await dynamodb.delete({
    TableName: API_WHISKEYSOCIAL_CLUBTABLE_NAME,
    Key: { id: clubId },
  }).promise();
};

/**
 * Main handler - processes deleteClubAdmin GraphQL mutation
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  let currentStep = null;
  let clubName = null;
  let clubId = null;

  try {
    if (!event.arguments?.input) {
      throw new Error('No arguments provided');
    }

    ({ clubId } = event.arguments.input);
    const { token } = event.arguments.input;

    // Token validation
    if (token !== TOKEN) {
      throw new Error('Unauthorized request');
    }

    if (!isValidClubId(clubId)) {
      throw new Error('clubId is required and must be a valid UUID');
    }

    // Verify club exists
    const { Item: club } = await dynamodb.get({
      TableName: API_WHISKEYSOCIAL_CLUBTABLE_NAME,
      Key: { id: clubId },
    }).promise();

    if (!club) {
      throw new Error(`Club not found with ID: ${clubId}`);
    }

    clubName = club.clubName;

    // Track deletion counts
    const deletedCounts = {
      members: 0,
      whiskeys: 0,
      posts: 0,
    };

    // Step 1: Delete members
    currentStep = STEPS.MEMBERS;
    deletedCounts.members = await deleteClubMembers(clubId);

    // Step 2: Delete whiskeys
    currentStep = STEPS.WHISKEYS;
    deletedCounts.whiskeys = await deleteClubWhiskeys(clubId);

    // Step 3: Delete posts
    currentStep = STEPS.POSTS;
    deletedCounts.posts = await deleteClubPosts(clubId);

    // Step 4: Delete club record
    currentStep = STEPS.CLUB;
    await deleteClubRecord(clubId);

    // Log for audit trail
    console.log(`[DeleteClub] Club deleted - ID: ${clubId}, Name: "${clubName}", Members: ${deletedCounts.members}, Whiskeys: ${deletedCounts.whiskeys}, Posts: ${deletedCounts.posts}`);

    return {
      success: true,
      clubId: clubId,
      clubName: clubName,
      deletedCounts: deletedCounts,
      message: `Successfully deleted club "${clubName}" and all associated data`,
    };
  } catch (error) {
    const stepInfo = currentStep ? ` while ${currentStep}` : '';
    const retryMessage = currentStep ? ' You can safely retry this operation.' : '';

    console.error(`[DeleteClub] Error${stepInfo}: ${error.message}`);

    return {
      success: false,
      clubId: clubId,
      clubName: clubName,
      deletedCounts: null,
      message: `Failed${stepInfo}: ${error.message}.${retryMessage}`,
    };
  }
};
