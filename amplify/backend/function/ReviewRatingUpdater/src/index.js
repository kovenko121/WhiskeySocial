/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_REVIEWTABLE_ARN
	API_WHISKEYSOCIAL_REVIEWTABLE_NAME
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

// Initialize DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

/**
 * Get all reviews for a specific whiskey
 * @param {string} whiskeyId - The ID of the whiskey
 * @returns {Promise<Array>} Array of review objects with rating field
 */
const getAllReviewsByWhiskey = async (whiskeyId) => {
  if (!whiskeyId) {
    console.error('getAllReviewsByWhiskey: whiskeyId is required');
    throw new Error('whiskeyId is required');
  }

  try {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_REVIEWTABLE_NAME,
      IndexName: 'byWhiskey',
      KeyConditionExpression: 'whiskeyId = :whiskeyId',
      ProjectionExpression: 'rating, id',
      ExpressionAttributeValues: {
        ':whiskeyId': whiskeyId,
      },
    };

    console.log(`Querying reviews for whiskey: ${whiskeyId}`);
    const result = await docClient.query(params).promise();
    console.log(`Found ${result.Items.length} reviews for whiskey: ${whiskeyId}`);

    return result.Items || [];
  } catch (error) {
    console.error(`Error fetching reviews for whiskey ${whiskeyId}:`, error);
    throw error;
  }
};

/**
 * Calculate the average rating from an array of reviews
 * Filters out reviews with invalid or missing ratings
 * @param {Array} reviews - Array of review objects
 * @returns {number|null} Calculated rating with 1 decimal place, or null if no valid reviews
 */
const calculateAverageRating = (reviews) => {
  if (!Array.isArray(reviews)) {
    console.error('calculateAverageRating: reviews must be an array');
    return null;
  }

  if (reviews.length === 0) {
    console.log('No reviews found, returning null');
    return null;
  }

  // Filter out invalid ratings (null, undefined, NaN, or not a number)
  const validReviews = reviews.filter((review) => {
    const rating = review?.rating;

    // Check if rating exists and is a valid number
    if (rating === null || rating === undefined) {
      console.log(`Review ${review?.id || 'unknown'} has null/undefined rating, skipping`);
      return false;
    }

    if (typeof rating !== 'number' || isNaN(rating)) {
      console.log(`Review ${review?.id || 'unknown'} has invalid rating: ${rating}, skipping`);
      return false;
    }

    // Optionally check if rating is within expected range (e.g., 1-5)
    if (rating < 0 || rating > 5) {
      console.log(`Review ${review?.id || 'unknown'} has out-of-range rating: ${rating}, skipping`);
      return false;
    }

    return true;
  });

  if (validReviews.length === 0) {
    console.log('No valid reviews with ratings found, returning null');
    return null;
  }

  // Calculate sum of all valid ratings
  const sum = validReviews.reduce((acc, review) => acc + review.rating, 0);

  // Calculate average and round to 1 decimal place
  const average = sum / validReviews.length;
  const roundedAverage = parseFloat(average.toFixed(1));

  console.log(`Calculated rating: ${roundedAverage} from ${validReviews.length} valid reviews (${reviews.length} total)`);

  return roundedAverage;
};

/**
 * Update the calculated rating for a whiskey in DynamoDB
 * @param {string} whiskeyId - The ID of the whiskey
 * @param {number|null} calculatedRating - The calculated rating or null
 * @returns {Promise<boolean>} Success status
 */
const updateWhiskeyRating = async (whiskeyId, calculatedRating) => {
  if (!whiskeyId) {
    console.error('updateWhiskeyRating: whiskeyId is required');
    throw new Error('whiskeyId is required');
  }

  try {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
      Key: { id: whiskeyId },
      UpdateExpression: 'SET #calculatedRating = :calculatedRating',
      ExpressionAttributeNames: {
        '#calculatedRating': 'calculatedRating',
      },
      ExpressionAttributeValues: {
        ':calculatedRating': calculatedRating,
      },
    };

    console.log(`Updating whiskey ${whiskeyId} with rating: ${calculatedRating}`);
    await docClient.update(params).promise();
    console.log(`Successfully updated whiskey ${whiskeyId}`);

    return true;
  } catch (error) {
    console.error(`Error updating whiskey ${whiskeyId}:`, error);
    throw error;
  }
};

/**
 * Process a single whiskey rating update
 * @param {string} whiskeyId - The ID of the whiskey to update
 * @returns {Promise<Object>} Result object with success status
 */
const processWhiskeyRatingUpdate = async (whiskeyId) => {
  try {
    console.log(`\n========== Processing whiskey: ${whiskeyId} ==========`);

    // Fetch all reviews for this whiskey
    const reviews = await getAllReviewsByWhiskey(whiskeyId);

    // Calculate the new rating
    const calculatedRating = calculateAverageRating(reviews);

    // Update the whiskey with the new rating
    await updateWhiskeyRating(whiskeyId, calculatedRating);

    console.log(`========== Successfully processed whiskey: ${whiskeyId} ==========\n`);

    return {
      whiskeyId,
      success: true,
      calculatedRating,
      reviewCount: reviews.length,
    };
  } catch (error) {
    console.error(`Failed to process whiskey ${whiskeyId}:`, error);
    return {
      whiskeyId,
      success: false,
      error: error.message,
    };
  }
};

/**
 * Extract whiskey ID from a DynamoDB Stream record
 * @param {Object} record - DynamoDB Stream record
 * @returns {string|null} Whiskey ID or null if not found
 */
const extractWhiskeyIdFromRecord = (record) => {
  try {
    // For INSERT and MODIFY events, get from NewImage
    if (record.dynamodb.NewImage && record.dynamodb.NewImage.whiskeyId) {
      return record.dynamodb.NewImage.whiskeyId.S;
    }

    // For REMOVE events, get from OldImage
    if (record.dynamodb.OldImage && record.dynamodb.OldImage.whiskeyId) {
      return record.dynamodb.OldImage.whiskeyId.S;
    }

    console.warn('Could not extract whiskeyId from record:', JSON.stringify(record, null, 2));
    return null;
  } catch (error) {
    console.error('Error extracting whiskeyId from record:', error);
    return null;
  }
};

/**
 * Lambda handler function
 * Triggered by DynamoDB Stream events from the Review table
 * @param {Object} event - DynamoDB Stream event
 * @returns {Promise<Object>} Processing results
 */
exports.handler = async (event) => {
  console.log('=================================================');
  console.log('ReviewRatingUpdater Lambda triggered');
  console.log('Event record count:', event.Records?.length || 0);
  console.log('=================================================\n');

  if (!event.Records || event.Records.length === 0) {
    console.log('No records to process');
    return {
      statusCode: 200,
      body: 'No records to process',
    };
  }

  // Extract unique whiskey IDs from all records
  const whiskeyIds = new Set();

  event.Records.forEach((record, index) => {
    console.log(`\nProcessing record ${index + 1}/${event.Records.length}`);
    console.log('Event name:', record.eventName);

    const whiskeyId = extractWhiskeyIdFromRecord(record);

    if (whiskeyId) {
      console.log(`Found whiskeyId: ${whiskeyId}`);
      whiskeyIds.add(whiskeyId);
    } else {
      console.warn(`Could not extract whiskeyId from record ${index + 1}`);
    }
  });

  console.log(`\nUnique whiskeys to update: ${whiskeyIds.size}`);
  console.log('Whiskey IDs:', Array.from(whiskeyIds).join(', '));

  if (whiskeyIds.size === 0) {
    console.warn('No valid whiskey IDs found in stream records');
    return {
      statusCode: 200,
      body: 'No valid whiskey IDs to process',
    };
  }

  // Process each unique whiskey
  const results = await Promise.all(
    Array.from(whiskeyIds).map(whiskeyId => processWhiskeyRatingUpdate(whiskeyId))
  );

  // Summarize results
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log('\n=================================================');
  console.log('Processing complete');
  console.log(`Total whiskeys processed: ${results.length}`);
  console.log(`Successful: ${successful}`);
  console.log(`Failed: ${failed}`);
  console.log('=================================================');

  if (failed > 0) {
    console.error('Failed updates:', results.filter(r => !r.success));
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      processed: results.length,
      successful,
      failed,
      results,
    }),
  };
};
