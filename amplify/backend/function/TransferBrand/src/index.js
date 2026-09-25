/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const crypto = require('crypto');
const postmark = require('postmark');
const fs = require('fs');
const path = require('path');

const cognito = new AWS.CognitoIdentityServiceProvider();
const dynamodb = new AWS.DynamoDB.DocumentClient();
const ssm = new AWS.SSM();

const {
  SECRET,
  AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
  API_WHISKEYSOCIAL_USERTABLE_NAME,
} = process.env;

/**
 * Validate user is Admin
 * Uses Cognito groups from the request identity
 */
const validateAdminUser = (event) => {
  // Check if user is authenticated
  if (!event.identity || !event.identity.username) {
    throw new Error('User is not authenticated');
  }

  // Check if user is in Admin group
  const groups = event.identity.claims['cognito:groups'] || [];
  if (!groups.includes('Admin')) {
    throw new Error(
      'User is not authorized to transfer brands. Admin access required.'
    );
  }

  console.log(`Admin user validated: ${event.identity.username}`);
  return event.identity.username;
};

/**
 * Validate brand exists and is transferable
 */
const validateBrand = async (brandId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: { id: brandId },
  };

  const result = await dynamodb.get(params).promise();

  if (!result.Item) {
    throw new Error('Brand not found');
  }

  if (result.Item.userType !== 'BRAND') {
    throw new Error('User is not a brand');
  }

  return result.Item;
};

/**
 * Check if email already exists in Cognito
 */
const checkIfEmailAlreadyExists = async (email) => {
  const data = await cognito
    .listUsers({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Filter: `email = "${email}"`,
    })
    .promise();

  if (data.Users.length > 0) {
    throw new Error('Email already exists');
  }
};

/**
 * Change Cognito email for the brand user in App User Pool
 * owner parameter is the cognitoSub (which is also the User table ID)
 */
const changeCognitoEmail = async (owner, email) => {
  console.log(
    `[changeCognitoEmail] Updating Cognito user - owner (cognitoSub): ${owner}, new email: ${email}`
  );

  const data = await cognito
    .adminUpdateUserAttributes({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: owner, // owner is the cognitoSub
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    })
    .promise();

  console.log(`[changeCognitoEmail] Successfully updated email to: ${email}`);
  return data.User;
};

/**
 * Update Cognito password for the new owner
 * Uses cognitoSub as Username since that's the Cognito identifier
 */
const updateCognitoPassword = async (owner, email) => {
  console.log(
    `[updateCognitoPassword] Updating password for owner (cognitoSub): ${owner}, email: ${email}`
  );

  const hash = crypto.createHash('sha512');
  hash.update(`${SECRET} ${email}`);
  const password = hash.digest('hex').slice(98);

  const data = await cognito
    .adminSetUserPassword({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: owner, // owner is the cognitoSub
      Password: password,
      Permanent: true,
    })
    .promise();

  console.log(`[updateCognitoPassword] Successfully updated password`);
  return data.User;
};

/**
 * Update User table - set toBeRedeemed to false
 */
const updateUserTable = async (id) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: { id },
    UpdateExpression: 'set toBeRedeemed = :toBeRedeemed',
    ExpressionAttributeValues: {
      ':toBeRedeemed': false,
    },
  };

  await dynamodb.update(params).promise();
};

/**
 * Sign out user globally to invalidate refresh tokens
 * This prevents the old owner from obtaining new access tokens
 *
 * @param {string} username - The Cognito username (cognitoSub) of the user to sign out
 * @returns {Promise<void>} - Resolves when sign out is complete or fails gracefully
 *
 * @description
 * Uses AWS Cognito's adminUserGlobalSignOut API to invalidate all refresh tokens
 * for the specified user across all devices.
 *
 * Note: This only invalidates refresh tokens, not active access tokens.
 * Active access tokens may remain valid until they expire (default 1 hour).
 * The mobile app should handle token refresh failures and log the user out.
 *
 * This is a best-effort operation that will not throw errors if it fails,
 * ensuring brand transfer continues even if sign out fails.
 */
const signOutUser = async (username) => {
  try {
    await cognito
      .adminUserGlobalSignOut({
        UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
        Username: username,
      })
      .promise();
    console.log(`[signOutUser] Successfully signed out user: ${username}`);
  } catch (error) {
    console.error('[signOutUser] Failed to sign out user:', error);
    // Don't throw - continue with transfer even if sign out fails
    // This is a best-effort operation for security
  }
};

// ============================================================
// EMAIL FUNCTIONS
// ============================================================

let postmarkClient = null;

const getPostmarkClient = async () => {
  if (!postmarkClient) {
    try {
      const parameterName = `/amplify/${process.env.ENV}/POSTMARK_SERVER_TOKEN`;
      const parameter = await ssm
        .getParameter({
          Name: parameterName,
          WithDecryption: true,
        })
        .promise();
      const apiToken = parameter.Parameter.Value;
      postmarkClient = new postmark.ServerClient(apiToken);
    } catch (error) {
      console.error('Error initializing Postmark client:', error);
      throw error;
    }
  }
  return postmarkClient;
};

/**
 * Send welcome email to new brand owner after transfer
 * Uses the same mobile app invite template as CreateBrandV2
 */
const sendBrandTransferWelcomeEmail = async (email, brandName, username) => {
  const emailSender = 'Whiskey Social <brands@whiskeysocial.app>';
  const emailSubject = `Welcome to Whiskey Social - ${brandName}`;

  // Load HTML template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'brand-transfer-welcome-template.html'),
    'utf8'
  );

  // Load logo base64
  const WS_LOGO_BASE64 = fs
    .readFileSync(path.join(__dirname, 'logo-base64.txt'), 'utf8')
    .trim();

  // Replace tokens in HTML template
  const htmlBody = htmlTemplate
    .replace(/{{email}}/g, email)
    .replace(/{{brandName}}/g, brandName)
    .replace(/{{username}}/g, username);

  // Text version for email clients that don't support HTML
  const emailBodyText = `Welcome to Whiskey Social!

Your brand "${brandName}" has been successfully created! You can now access the Whiskey Social mobile app to manage your brand and connect with whiskey enthusiasts.

Download the app and log in with your email to get started:
https://whiskeysocial.app/install

Your Account Information:
------------------------
Email: ${email}
Brand Name: ${brandName}
Brand Username: @${username}

Get Started:
- Download the Whiskey Social app from the App Store or Google Play
- Log in with your email
- Complete your brand profile
- Start connecting with whiskey enthusiasts

Need help? Contact our support team at support@whiskeysocial.app

This email was sent to ${email} because a brand account was created for you on Whiskey Social.
If you didn't request this account, please contact support immediately.`;

  const message = {
    From: emailSender,
    To: email,
    Subject: emailSubject,
    TextBody: emailBodyText,
    HtmlBody: htmlBody,
    MessageStream: 'outbound',
    Attachments: [
      {
        Name: 'ws-logo.png',
        Content: WS_LOGO_BASE64,
        ContentType: 'image/png',
        ContentID: 'ws-logo',
        ContentDisposition: 'inline',
      },
    ],
  };

  try {
    const client = await getPostmarkClient();
    const result = await client.sendEmail(message);
    console.log(`Welcome email sent to ${email}:`, result.MessageID);
    return result;
  } catch (error) {
    console.error('Error sending brand transfer welcome email:', error);
    // Don't throw - we don't want to fail brand transfer if email fails
    // Instead, log the error and continue
    return null;
  }
};

/**
 * Main handler
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  try {
    // Step 1: Validate admin permissions
    const adminUsername = validateAdminUser(event);

    const { id: brandId, email, owner } = event.arguments;

    // Normalize email - lowercase and trim for consistency
    const newOwnerEmail = email?.toLowerCase().trim();

    // Validate inputs
    if (!brandId || !newOwnerEmail || !owner) {
      throw new Error('Brand ID, email, and owner are required');
    }

    // Step 2: Validate brand exists and is transferable
    const brand = await validateBrand(brandId);
    console.log(`Validated brand: ${brand.brandName} (${brand.username})`);

    // Step 3: Check if email already exists
    await checkIfEmailAlreadyExists(newOwnerEmail);
    console.log(`Email ${newOwnerEmail} is available`);

    // Step 4: Change Cognito email
    console.log(
      `Attempting to change Cognito email for brand ID: ${brandId}, username: ${brand.username}`
    );
    await changeCognitoEmail(owner, newOwnerEmail);
    console.log(`Changed Cognito email to: ${newOwnerEmail}`);

    // Step 5: Update Cognito password
    await updateCognitoPassword(owner, newOwnerEmail);
    console.log(`Updated Cognito password for: ${newOwnerEmail}`);

    // Step 6: Sign out user globally (invalidate refresh tokens)
    // Note: We sign out AFTER changing credentials to ensure old credentials
    // are already invalid. This minimizes the window where the old owner
    // could use refresh tokens to obtain new access tokens.
    console.log(`Signing out user globally: ${owner}`);
    await signOutUser(owner);
    console.log(`User signed out successfully`);

    // Step 7: Update User table (set toBeRedeemed = false)
    await updateUserTable(brandId);
    console.log(`Updated User table for brand: ${brandId}`);

    // Step 8: Send welcome email to new brand owner
    await sendBrandTransferWelcomeEmail(
      newOwnerEmail,
      brand.brandName,
      brand.username
    );
    console.log(`Sent welcome email to: ${newOwnerEmail}`);

    console.log(`Brand transfer completed successfully for: ${brandId}`);
    console.log(`Transferred by admin: ${adminUsername}`);

    return `Brand "${brand.brandName}" successfully transferred to ${newOwnerEmail}`;
  } catch (error) {
    console.error('ERROR', error);
    throw error;
  }
};
