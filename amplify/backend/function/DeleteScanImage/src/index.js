/* Amplify Params - DO NOT EDIT
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const VALID_PREFIX = 'whiskey_';

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  try {
    const { imageKey } = event.arguments.input;

    if (!imageKey || !imageKey.startsWith(VALID_PREFIX)) {
      return {
        success: false,
        error: 'Invalid image key',
      };
    }

    const bucketName = process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME;

    if (!bucketName) {
      console.error('S3 bucket name not found in environment variables');
      return {
        success: false,
        error: 'Storage configuration error',
      };
    }

    await s3
      .deleteObject({
        Bucket: bucketName,
        Key: `public/${imageKey}`,
      })
      .promise();

    console.log(`Deleted scan image: public/${imageKey}`);

    return {
      success: true,
      error: null,
    };
  } catch (err) {
    console.error('Error deleting scan image:', err);
    return {
      success: false,
      error: 'Failed to delete image',
    };
  }
};
