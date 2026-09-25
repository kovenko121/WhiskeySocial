/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_ADCAMPAIGNTABLE_ARN
	API_WHISKEYSOCIAL_ADCAMPAIGNTABLE_NAME
	API_WHISKEYSOCIAL_EVENTTABLE_ARN
	API_WHISKEYSOCIAL_EVENTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
	TOKEN
Amplify Params - DO NOT EDIT */

/**
 * Lambda: DeleteAdCampaign
 * Purpose: Permanently delete an ad campaign and all associated data (event analytics, S3 image)
 * Trigger: GraphQL mutation deleteAdCampaignAdmin
 *
 * Deletion Order:
 * 1. Event record (analytics: impressions/interactions)
 * 2. S3 image (campaign picture)
 * 3. AdCampaign record
 *
 * If failure occurs, returns which step failed. Retry is safe - each step
 * checks for existence before deleting, so already-deleted items won't cause errors.
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

const {
  API_WHISKEYSOCIAL_ADCAMPAIGNTABLE_NAME,
  API_WHISKEYSOCIAL_EVENTTABLE_NAME,
  STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
  TOKEN,
} = process.env;

// Constants
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate campaignId is a valid UUID string
 */
const isValidCampaignId = (campaignId) => {
  return typeof campaignId === 'string' && UUID_REGEX.test(campaignId);
};

// Deletion steps for progress tracking
const STEPS = {
  EVENT: 'deleting event record',
  S3_IMAGE: 'deleting S3 image',
  CAMPAIGN: 'deleting campaign record',
};

/**
 * Delete the Event analytics record for this campaign
 * Event.id === campaignId (direct key lookup)
 */
const deleteEventRecord = async (campaignId) => {
  const { Item: event } = await dynamodb.get({
    TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
    Key: { id: campaignId },
  }).promise();

  if (!event) {
    return 0;
  }

  await dynamodb.delete({
    TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
    Key: { id: campaignId },
  }).promise();

  return 1;
};

/**
 * Delete the S3 image for this campaign
 */
const deleteS3Image = async (campaign) => {
  if (!campaign.picture || !campaign.picture.key) {
    return 0;
  }

  await s3.deleteObject({
    Bucket: STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
    Key: campaign.picture.key,
  }).promise();

  return 1;
};

/**
 * Delete the AdCampaign record
 */
const deleteCampaignRecord = async (campaignId) => {
  await dynamodb.delete({
    TableName: API_WHISKEYSOCIAL_ADCAMPAIGNTABLE_NAME,
    Key: { id: campaignId },
  }).promise();
};

/**
 * Main handler - processes deleteAdCampaignAdmin GraphQL mutation
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  let currentStep = null;
  let campaignName = null;
  let campaignId = null;

  try {
    if (!event.arguments?.input) {
      throw new Error('No arguments provided');
    }

    ({ campaignId } = event.arguments.input);
    const { token } = event.arguments.input;

    // Token validation
    if (token !== TOKEN) {
      throw new Error('Unauthorized request');
    }

    if (!isValidCampaignId(campaignId)) {
      throw new Error('campaignId is required and must be a valid UUID');
    }

    // Verify campaign exists
    const { Item: campaign } = await dynamodb.get({
      TableName: API_WHISKEYSOCIAL_ADCAMPAIGNTABLE_NAME,
      Key: { id: campaignId },
    }).promise();

    if (!campaign) {
      throw new Error(`Campaign not found with ID: ${campaignId}`);
    }

    campaignName = campaign.name;

    // Track deletion counts
    const deletedCounts = {
      eventRecords: 0,
      s3Objects: 0,
    };

    // Step 1: Delete Event record
    currentStep = STEPS.EVENT;
    deletedCounts.eventRecords = await deleteEventRecord(campaignId);

    // Step 2: Delete S3 image
    currentStep = STEPS.S3_IMAGE;
    deletedCounts.s3Objects = await deleteS3Image(campaign);

    // Step 3: Delete AdCampaign record (last for safe retries)
    currentStep = STEPS.CAMPAIGN;
    await deleteCampaignRecord(campaignId);

    // Log for audit trail
    console.log(`[DeleteAdCampaign] Campaign deleted - ID: ${campaignId}, Name: "${campaignName}", Events: ${deletedCounts.eventRecords}, S3 Objects: ${deletedCounts.s3Objects}`);

    return {
      success: true,
      campaignId: campaignId,
      campaignName: campaignName,
      deletedCounts: deletedCounts,
      message: `Successfully deleted campaign "${campaignName}" and all associated data`,
    };
  } catch (error) {
    const stepInfo = currentStep ? ` while ${currentStep}` : '';
    const retryMessage = currentStep ? ' You can safely retry this operation.' : '';

    console.error(`[DeleteAdCampaign] Error${stepInfo}: ${error.message}`);

    return {
      success: false,
      campaignId: campaignId,
      campaignName: campaignName,
      deletedCounts: null,
      message: `Failed${stepInfo}: ${error.message}.${retryMessage}`,
    };
  }
};
