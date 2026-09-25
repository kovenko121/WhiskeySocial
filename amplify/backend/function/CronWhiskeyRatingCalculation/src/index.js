/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
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
 * Get all whiskey IDs from the database
 * @returns {Promise<Array>} Array of whiskey objects with id field
 */
const getAllWhiskeys = () => {
  return new Promise((resolve, reject) => {
    const params = {
      ProjectionExpression: 'id',
      TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
    };

    docClient.scan(params, (err, data) => {
      if (err) {
        console.error('Error fetching all whiskeys:', err);
        reject(err);
      } else {
        console.log(`Found ${data.Items.length} whiskeys to process`);
        resolve(data.Items);
      }
    });
  });
};

/**
 * Get all reviews for a specific whiskey
 * @param {string} whiskeyId - The ID of the whiskey
 * @returns {Promise<Array>} Array of review objects with rating field
 */
const getAllReviewsByWhiskey = (whiskeyId) => {
  return new Promise((resolve, reject) => {
    const params = {
      ExpressionAttributeValues: {
        ':whiskeyId': whiskeyId,
      },
      KeyConditionExpression: 'whiskeyId = :whiskeyId',
      ProjectionExpression: 'rating, id',
      TableName: process.env.API_WHISKEYSOCIAL_REVIEWTABLE_NAME,
      IndexName: 'byWhiskey',
    };

    docClient.query(params, (err, data) => {
      if (err) {
        console.error(`Error fetching reviews for whiskey ${whiskeyId}:`, err);
        reject(err);
      } else {
        resolve(data.Items || []);
      }
    });
  });
};

/**
 * Calculate the average rating from an array of reviews
 * Filters out reviews with invalid or missing ratings
 * @param {Array} reviews - Array of review objects
 * @param {string} whiskeyId - The whiskey ID (for logging purposes)
 * @returns {number|null} Calculated rating with 1 decimal place, or null if no valid reviews
 */
const calculateAverageRating = (reviews, whiskeyId) => {
  if (!Array.isArray(reviews)) {
    console.error(`calculateAverageRating for whiskey ${whiskeyId}: reviews must be an array`);
    return null;
  }

  if (reviews.length === 0) {
    return null;
  }

  // Filter out invalid ratings (null, undefined, NaN, or not a number)
  const validReviews = reviews.filter((review) => {
    const rating = review?.rating;

    // Check if rating exists and is a valid number
    if (rating === null || rating === undefined) {
      console.log(`Whiskey ${whiskeyId}: Review ${review?.id || 'unknown'} has null/undefined rating, skipping`);
      return false;
    }

    if (typeof rating !== 'number' || isNaN(rating)) {
      console.log(`Whiskey ${whiskeyId}: Review ${review?.id || 'unknown'} has invalid rating: ${rating}, skipping`);
      return false;
    }

    // Check if rating is within expected range (0-5)
    if (rating < 0 || rating > 5) {
      console.log(`Whiskey ${whiskeyId}: Review ${review?.id || 'unknown'} has out-of-range rating: ${rating}, skipping`);
      return false;
    }

    return true;
  });

  if (validReviews.length === 0) {
    console.log(`Whiskey ${whiskeyId}: No valid reviews with ratings found, returning null`);
    return null;
  }

  // Calculate sum of all valid ratings
  const sum = validReviews.reduce((acc, review) => acc + review.rating, 0);

  // Calculate average and round to 1 decimal place
  const average = sum / validReviews.length;
  const roundedAverage = parseFloat(average.toFixed(1));

  return roundedAverage;
};

/**
 * Update the calculated rating for a whiskey in DynamoDB
 * @param {string} whiskeyId - The ID of the whiskey
 * @param {number|null} calculatedRating - The calculated rating or null
 * @returns {Promise<boolean>} Success status
 */
const saveCalculatedRating = (whiskeyId, calculatedRating) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
      Key: { id: whiskeyId },
      UpdateExpression: 'SET #calculatedRating = :calculatedRating',
      ExpressionAttributeNames: {
        '#calculatedRating': 'calculatedRating',
      },
      ExpressionAttributeValues: {
        ':calculatedRating': calculatedRating, // Store as Float or null
      },
    };

    docClient.update(params, (err) => {
      if (err) {
        console.error(`Error updating whiskey ${whiskeyId}:`, err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};

/**
 * Process a single whiskey rating update
 * @param {Object} whiskey - Whiskey object with id field
 * @returns {Promise<Object>} Result object with success status
 */
const processWhiskeyRating = async (whiskey) => {
  const whiskeyId = whiskey.id;

  try {
    // Fetch all reviews for this whiskey
    const reviews = await getAllReviewsByWhiskey(whiskeyId);

    // Calculate the new rating
    const calculatedRating = calculateAverageRating(reviews, whiskeyId);

    // Update the whiskey with the new rating
    await saveCalculatedRating(whiskeyId, calculatedRating);

    return {
      whiskeyId,
      success: true,
      calculatedRating,
      totalReviews: reviews.length,
      validReviews: reviews.filter(r => {
        const rating = r?.rating;
        return rating !== null && rating !== undefined && typeof rating === 'number' && !isNaN(rating) && rating >= 0 && rating <= 5;
      }).length,
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
 * Lambda handler function
 * Processes all whiskeys and recalculates their ratings
 * @returns {Promise<Object>} Processing results
 */
exports.handler = async () => {
  console.log('=================================================');
  console.log('CronWhiskeyRatingCalculation Lambda started');
  console.log('Timestamp:', new Date().toISOString());
  console.log('=================================================\n');

  try {
    // Fetch all whiskey IDs
    const whiskeys = await getAllWhiskeys();

    if (!whiskeys || whiskeys.length === 0) {
      console.log('No whiskeys found to process');
      return {
        statusCode: 200,
        body: 'No whiskeys to process',
      };
    }

    // Process all whiskeys in parallel
    console.log(`Starting to process ${whiskeys.length} whiskeys...\n`);
    const results = await Promise.all(
      whiskeys.map(whiskey => processWhiskeyRating(whiskey))
    );

    // Summarize results
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    const withRatings = results.filter(r => r.success && r.calculatedRating !== null).length;
    const withoutRatings = results.filter(r => r.success && r.calculatedRating === null).length;

    console.log('\n=================================================');
    console.log('Processing complete');
    console.log(`Total whiskeys: ${whiskeys.length}`);
    console.log(`Successfully updated: ${successful}`);
    console.log(`  - With ratings: ${withRatings}`);
    console.log(`  - Without ratings (null): ${withoutRatings}`);
    console.log(`Failed: ${failed}`);
    console.log('=================================================');

    if (failed > 0) {
      console.error('\nFailed whiskeys:', results.filter(r => !r.success).map(r => ({ id: r.whiskeyId, error: r.error })));
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        total: whiskeys.length,
        successful,
        failed,
        withRatings,
        withoutRatings,
        failedWhiskeys: failed > 0 ? results.filter(r => !r.success).map(r => r.whiskeyId) : [],
      }),
    };
  } catch (error) {
    console.error('Critical error in handler:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
    };
  }
};
