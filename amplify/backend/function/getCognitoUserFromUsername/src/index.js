/* Amplify Params - DO NOT EDIT
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const cognito = new AWS.CognitoIdentityServiceProvider();

const { AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID } = process.env;

/**
 * Get Cognito user email by username (user ID / sub)
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  const { userId } = event.arguments;

  if (!userId) {
    console.error('❌ Missing userId argument');
    throw new Error('userId is required');
  }

  try {
    // Fetch user from Cognito User Pool
    const params = {
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: userId,
    };

    const cognitoUser = await cognito.adminGetUser(params).promise();

    // Extract email from user attributes
    const emailAttribute = cognitoUser.UserAttributes?.find(
      (attr) => attr.Name === 'email'
    );

    if (!emailAttribute?.Value) {
      throw new Error('Email not found for user');
    }

    const result = {
      email: emailAttribute.Value,
      username: cognitoUser.Username,
      userStatus: cognitoUser.UserStatus,
    };

    return result;
  } catch (error) {
    console.error('❌ ERROR in getCognitoUserFromUsername:');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Full error:', error);

    // Re-throw with user-friendly message
    if (error.code === 'UserNotFoundException') {
      throw new Error(`User not found in Cognito User Pool: ${userId}`);
    }

    throw new Error(`Failed to fetch user email: ${error.message}`);
  }
};
