/* Amplify Params - DO NOT EDIT
  API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
  API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
  API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
  API_WHISKEYSOCIAL_POSTTABLE_ARN
  API_WHISKEYSOCIAL_POSTTABLE_NAME
  API_WHISKEYSOCIAL_USERTABLE_ARN
  API_WHISKEYSOCIAL_USERTABLE_NAME
  ENV
  REGION
Amplify Params - DO NOT EDIT */

// Image Content Moderation Lambda Function

const AWS = require('aws-sdk');
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Moderation configuration (60% threshold as discussed)
const MODERATION_CONFIG = {
  minConfidence: 60,
  rejectedLabels: [
    'Explicit Nudity',
    'Nudity',
    'Graphic Male Nudity',
    'Graphic Female Nudity',
    'Sexual Activity',
    'Illustrated Explicit Nudity',
    'Adult Toys',
    'Graphic Violence Or Gore',
    'Physical Violence',
    'Weapon Violence',
    'Weapons',
    'Self Injury',
    'Hate Symbols',
    'Nazi Party',
    'White Supremacy',
    'Extremist'
  ]
};

/**
 * @type {import('@types/aws-lambda').Handler}
 */
exports.handler = async (event) => {
  for (const record of event.Records) {
    const bucket = record.s3.bucket.name;
    const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

    // Only process files in public/ folder
    if (!key.startsWith('public/')) {
      continue;
    }

    // Skip non-image files
    if (!isImageFile(key)) {
      continue;
    }

    // Parse S3 key to extract fileName and imageType
    const { fileName, imageType } = parseS3Key(key);

    try {
      // Skip moderation for whiskey images and menu PDFs (not social content)
      if (imageType === 'whiskey' || imageType === 'menu') {
        continue;
      }

      // Call Rekognition for content moderation
      const moderationResult = await rekognition.detectModerationLabels({
        Image: {
          S3Object: {
            Bucket: bucket,
            Name: key
          }
        },
        MinConfidence: MODERATION_CONFIG.minConfidence
      }).promise();

      // Check if content is appropriate
      const inappropriateLabels = moderationResult.ModerationLabels.filter(label =>
        MODERATION_CONFIG.rejectedLabels.includes(label.Name)
      );

      const isAppropriate = inappropriateLabels.length === 0;
      const moderationStatus = isAppropriate ? 'APPROVED' : 'REJECTED';

      // Update DynamoDB records with moderation status
      if (imageType === 'post') {
        // Posts need retry logic due to timing issues
        // update to Posts/ 
        await updateModerationStatusWithRetry(fileName, moderationStatus);
      } else {
        // User images (profile/cover) also need retry logic due to timing issues
        await updateUserModerationStatusWithRetry(fileName, moderationStatus, imageType);
      }

    } catch (error) {
      console.error(`Error processing ${key}:`, error);

      // Try to set ERROR status so frontend knows moderation failed
      try {
        if (imageType === 'post') {
          await updateModerationStatusWithRetry(fileName, 'ERROR');
        } else {
          await updateUserModerationStatusWithRetry(fileName, 'ERROR', imageType);
        }
      } catch (updateError) {
        // Silently handle error status update failure
        console.error('Failed to update moderation status to ERROR:', updateError);
      }
    }
  }

  return {
    statusCode: 200,
    body: JSON.stringify('Moderation processing complete')
  };
};

// Helper function to parse S3 key and extract fileName and imageType
function parseS3Key(key) {
  // Extract filename from public/filename
  const fileName = key.replace('public/', '');
  let imageType;

  // Extract prefix from filename
  const prefix = fileName.split('_')[0];

  switch (prefix) {
    case 'post':
      imageType = 'post';
      break;
    case 'profile':
      imageType = 'profile';
      break;
    case 'cover':
      imageType = 'cover';
      break;
    case 'whiskey':
      imageType = 'whiskey';
      break;
    case 'menu':
      imageType = 'menu';
      break;
    default:
      // Legacy post (backwards compatible - no prefix)
      imageType = 'post';
  }

  return { fileName, imageType };
}

// Helper function to check if file is an image
function isImageFile(key) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
  const lowerKey = key.toLowerCase();
  return imageExtensions.some(ext => lowerKey.endsWith(ext));
}

// Update moderation status with retry mechanism to handle race conditions
async function updateModerationStatusWithRetry(fileName, status) {
  const maxRetries = 3;
  const delays = [2000, 4000, 8000]; // Exponential backoff: 2s, 4s, 8s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const recordsUpdated = await updateModerationStatus(fileName, status);

      if (recordsUpdated > 0) {
        return; // Success - found and updated records
      }

      // If no records found and not final attempt, retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt + 1} for ${fileName}:`, error);
      // If not the final attempt, wait and retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    }
  }

  // If we get here, all retries failed
  console.warn(`⚠️ Failed to update moderation status for post ${fileName} after ${maxRetries} attempts`);
}

// Update moderation status in DynamoDB for all related records
async function updateModerationStatus(fileName, status) {
  const updatePromises = [];

  // Find and update Post records with this image
  const postTableName = process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME;

  if (postTableName) {
    const tableName = postTableName;

    try {
      // Query GSI for posts with this filename (much faster than scan)
      const queryResult = await dynamodb.query({
        TableName: tableName,
        IndexName: 'byPhotoKey',
        KeyConditionExpression: '#photoKey = :fileName',
        ExpressionAttributeNames: {
          '#photoKey': 'photoKey'
        },
        ExpressionAttributeValues: {
          ':fileName': fileName
        }
      }).promise();

      // Update each post
      for (const post of queryResult.Items) {
        updatePromises.push(
          dynamodb.update({
            TableName: tableName,
            Key: { id: post.id },
            UpdateExpression: 'SET #photoModerationStatus = :status, #updatedAt = :updatedAt',
            ExpressionAttributeNames: {
              '#photoModerationStatus': 'photoModerationStatus',
              '#updatedAt': 'updatedAt'
            },
            ExpressionAttributeValues: {
              ':status': status,
              ':updatedAt': new Date().toISOString()
            }
          }).promise()
        );
      }
    } catch (error) {
      console.error(`Error scanning/updating posts:`, error);
      throw error;
    }
  }

  // Wait for all updates to complete
  await Promise.all(updatePromises);

  // Return the count of records updated
  return updatePromises.length;
}

// Update user moderation status with retry mechanism to handle race conditions
async function updateUserModerationStatusWithRetry(fileName, status, imageType) {
  const maxRetries = 3;
  const delays = [2000, 4000, 8000]; // Exponential backoff: 2s, 4s, 8s

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const recordsUpdated = await updateUserModerationStatus(fileName, status, imageType);

      if (recordsUpdated > 0) {
        return; // Success - found and updated records
      }

      // If no records found and not final attempt, retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      }
    } catch (error) {
      console.error(`❌ Error on attempt ${attempt + 1} for ${imageType} image ${fileName}:`, error);
      // If not the final attempt, wait and retry
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
      } else {
        throw error; // Rethrow on final attempt
      }
    }
  }

  // If we get here, all retries failed
  console.warn(`⚠️ Failed to update ${imageType} image moderation status for ${fileName} after ${maxRetries} attempts`);
}

// Update moderation status in DynamoDB for User records (profile/cover images)
async function updateUserModerationStatus(fileName, status, imageType) {
  const userTableName = process.env.API_WHISKEYSOCIAL_USERTABLE_NAME;

  if (!userTableName) {
    throw new Error('User table name not found in environment variables');
  }

  const isProfilePicture = (imageType === 'profile');

  try {
    // Query GSI for users with this filename
    const indexName = isProfilePicture ? 'byProfilePictureKey' : 'byCoverPictureKey';
    const keyAttribute = isProfilePicture ? 'profilePictureKey' : 'coverPictureKey';

    const queryResult = await dynamodb.query({
      TableName: userTableName,
      IndexName: indexName,
      KeyConditionExpression: '#imageKey = :fileName',
      ExpressionAttributeNames: {
        '#imageKey': keyAttribute
      },
      ExpressionAttributeValues: {
        ':fileName': fileName
      }
    }).promise();

    if (queryResult.Items.length === 0) {
      return 0;
    }

    // Update each user (should only be one)
    const updatePromises = [];

    for (const user of queryResult.Items) {
      // For rejected profile pictures, reset to default image key
      let defaultKey = null;
      if (status === 'REJECTED' && isProfilePicture) {
        const userType = user.userType;

        if (userType === 'PERSON') {
          defaultKey = 'new_user.png';
        } else if (userType === 'VENUE') {
          defaultKey = 'new_venue.png';
        } else if (userType === 'BRAND') {
          defaultKey = 'new_brand.png';
        }
      }

      // Build update expression based on status and image type
      // For rejected profile pictures, only update the key field within the existing S3 object
      const updateExpression = (status === 'REJECTED' && isProfilePicture)
        ? 'SET #status = :status, #picture.#key = :key, #updatedAt = :updatedAt'
        : status === 'REJECTED'
        ? 'SET #status = :status, #picture = :picture, #updatedAt = :updatedAt'
        : 'SET #status = :status, #updatedAt = :updatedAt';

      const expressionAttributeNames = {
        '#status': isProfilePicture ? 'profilePictureModerationStatus' : 'coverPictureModerationStatus',
        ...(status === 'REJECTED' && { '#picture': isProfilePicture ? 'profilePicture' : 'coverPicture' }),
        ...(status === 'REJECTED' && isProfilePicture && { '#key': 'key' }),
        '#updatedAt': 'updatedAt'
      };

      const expressionAttributeValues = {
        ':status': status,
        ...(status === 'REJECTED' && isProfilePicture && { ':key': defaultKey }),
        ...(status === 'REJECTED' && !isProfilePicture && { ':picture': null }),
        ':updatedAt': new Date().toISOString()
      };

      // If rejected, reset to default image (profile) or null (cover)
      updatePromises.push(
        dynamodb.update({
          TableName: userTableName,
          Key: { id: user.id },
          UpdateExpression: updateExpression,
          ExpressionAttributeNames: expressionAttributeNames,
          ExpressionAttributeValues: expressionAttributeValues
        }).promise()
      );
    }

    // Wait for all updates to complete
    await Promise.all(updatePromises);

    return updatePromises.length;

  } catch (error) {
    console.error(`Error updating user ${imageType} moderation status:`, error);
    throw error;
  }
}