/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME
	API_WHISKEYSOCIAL_CMSUSERTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	CMS_COGNITO_USER_POOL_ID
	CMS_URL
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

/**
 * ============================================================
 * CreateBrandV2 Lambda Function
 * ============================================================
 *
 * PURPOSE:
 * Creates a new brand user in the Whiskey Social app. Handles multiple scenarios:
 * 1. Mobile email only - User can log in to mobile app immediately
 * 2. CMS email only - Brand owner has CMS access, mobile app requires transfer
 * 3. Both emails - User can log in to mobile app, separate brand owner has CMS access
 * 4. No emails - Brand must be transferred later, no CMS access yet
 *
 * MAIN HANDLER FLOW:
 * Step 1: Validate admin permissions
 * Step 2: Extract and validate inputs (mobileEmail and cmsEmail)
 * Step 3: Validate authentication token
 * Step 4: Check username uniqueness
 * Step 5: Validate and sanitize mobile email
 * Step 6: Create mobile app Cognito user (calls createAppCognitoUser)
 * Step 7: Create User record in DynamoDB (calls createUserDynamo)
 * Step 8: If cmsEmail provided, create CMS user and send CMS access email (with idempotency checks)
 *         (calls checkCmsCognitoUserExists, createCmsCognitoUser, checkCmsUserExists,
 *          createCmsUser, checkCmsUserBrandExists, createCmsUserBrandEntry, sendBrandOwnerCmsEmail)
 * Step 9: If mobileEmail provided, send mobile app invite email (calls sendBrandAppInviteEmail)
 *
 * HELPER FUNCTIONS:
 * - validateAdminUser(event) - Validates requesting user has Admin permissions
 * - validateEmail(email) - Validates and sanitizes email, returns {isValid, sanitizedEmail, toBeRedeemed}
 * - generateHashedPassword(email) - Generates deterministic password from email
 * - checkUsernameUniqueness(username) - Validates username is available
 * - createAppCognitoUser(email) - Creates Cognito user, returns cognitoSub
 * - createUserDynamo(id, brandData, toBeRedeemed) - Creates User table record
 * - generateTemporaryPassword() - Generates random temporary password for CMS user
 * - createCmsCognitoUser(email, role) - Creates CMS Cognito user, returns {username, temporaryPassword, sub}
 * - createCmsUser(email, role, authId) - Creates CMSUser record in DynamoDB
 * - createCmsUserBrandEntry(cmsUserId, brandUserId, assignedBy) - Links CMS user to brand
 * - checkCmsCognitoUserExists(email) - Checks if CMS Cognito user exists (idempotency)
 * - checkCmsUserExists(authId) - Checks if CMSUser record exists (idempotency)
 * - checkCmsUserBrandExists(cmsUserId, brandUserId) - Checks if association exists (idempotency)
 * - sendBrandOwnerCmsEmail(email, brandName, username, temporaryPassword) - Sends CMS access email
 * - sendBrandAppInviteEmail(email, brandName, username) - Sends mobile app welcome email
 *
 * CRITICAL CONCEPT:
 * User table ID is ALWAYS the Cognito sub (UUID from AWS Cognito).
 * This ensures mobile app authentication works correctly:
 * - Mobile app logs in → Cognito returns cognitoSub
 * - Mobile app queries User table by cognitoSub
 * - If User.id matches cognitoSub → User found ✓
 *
 * IMPORTANT NOTES:
 * - cognitoSub is extracted from data.User.Username (NOT the username passed in)
 * - Password is generated from the sanitized email (not cognitoSub)
 * - owner field in User table is set to cognitoSub (same as id)
 * - toBeRedeemed flag indicates if brand needs transfer (true = no email provided)
 * - Email sending is non-critical and won't fail brand creation if it errors
 *
 * ============================================================
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const postmark = require('postmark');
const fs = require('fs');
const path = require('path');
const db = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ssm = new AWS.SSM();

const {
  STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  API_WHISKEYSOCIAL_CMSUSERTABLE_NAME,
  API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME,
  AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
  CMS_COGNITO_USER_POOL_ID,
  TOKEN,
  SECRET,
  CMS_URL,
} = process.env;

/**
 * Get CMS URL with fallback logic
 * Can be overridden via CMS_URL environment variable set in AWS Amplify Console
 * Matches API_URL naming pattern
 */
const getCmsUrl = () => {
  // Use CMS_URL if provided (set in AWS Amplify Console or CloudFormation)
  if (CMS_URL) {
    return CMS_URL;
  }

  // Fallback to environment-based defaults (default to dev for safety)
  if (process.env.ENV === 'prod') {
    return 'https://cms-prod.d1qp1ad0zi25cp.amplifyapp.com';
  } else {
    return 'https://main.d1qp1ad0zi25cp.amplifyapp.com';
  }
};

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

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
      'User is not authorized to create brands. Admin access required.'
    );
  }

  console.log(`Admin user validated: ${event.identity.username}`);
  return event.identity.username;
};

/**
 * Validates and sanitizes email input for brand creation
 *
 * This function handles three scenarios:
 * 1. null/undefined: Brand without email - creates temp UUID email, toBeRedeemed = true
 * 2. Empty string: User mistake - throws error to alert front end
 * 3. Valid string: Real email - sanitizes and returns, toBeRedeemed = false
 *
 * @param {string|null|undefined} email - The email to validate
 * @returns {{isValid: boolean, sanitizedEmail: string, toBeRedeemed: boolean}} Validation result
 * @throws {Error} If email is an empty string or invalid type
 *
 * @example
 * Brand without email (intentional)
 * validateEmail(null)
 * Returns: { isValid: false, sanitizedEmail: 'uuid@whiskeysocial.app', toBeRedeemed: true }
 *
 * @example
 * Empty string (user mistake)
 * validateEmail('')
 * Throws: Error('Email is an empty string, was this a mistake?')
 *
 * @example
 * Valid email
 * validateEmail('  John@Example.COM  ')
 * Returns: { isValid: true, sanitizedEmail: 'john@example.com', toBeRedeemed: false }
 */
const validateEmail = (email) => {
  // Check for null, undefined, or empty string
  if (email === null || email === undefined) {
    return {
      isValid: false,
      sanitizedEmail: `${uuidv4()}@whiskeysocial.app`,
      toBeRedeemed: true,
    };
  }

  if (typeof email === 'string' && email.trim() === '') {
    throw new Error('Email is an empty string, was this a mistake?');
  }

  if (typeof email === 'string' && email.trim() !== '') {
    return {
      isValid: true,
      sanitizedEmail: email.trim().toLowerCase(),
      toBeRedeemed: false,
    };
  }

  // Handle invalid types (number, boolean, object, array, etc.)
  throw new Error(
    `Email must be a string, null, or undefined. Received type: ${typeof email}`
  );
};

const generateHashedPassword = (email) => {
  // Use SHA512 hash with SECRET to generate deterministic password
  // This matches the pattern in TransferVenue Lambda
  const hash = crypto.createHash('sha512');
  hash.update(`${SECRET} ${email}`);
  const password = hash.digest('hex').slice(98);

  return password;
};

const checkUsernameUniqueness = async (username) => {
  if (!username) throw new Error('Username is required');

  const paramsUsername = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    IndexName: 'byUsername',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': username,
    },
  };

  const result = await db.query(paramsUsername).promise();

  if (result.Count > 0) throw new Error('Username already exists');

  return result.Count === 0;
};

// ============================================================
// COGNITO & DYNAMODB FUNCTIONS
// ============================================================

/**
 * Create App Cognito user - streamlined single function
 *
 * This function handles BOTH scenarios:
 * 1. WITH EMAIL: Creates Cognito user with provided email as username
 * 2. WITHOUT EMAIL: Creates Cognito user with temp UUID email
 *
 * Flow:
 * 1. Handler sanitizes email before calling this function (always provides a valid string)
 * 2. Create Cognito user with adminCreateUser
 * 3. Extract cognitoSub from response.User.Username (CRITICAL!)
 * 4. Set permanent password using hashed email
 * 5. Return cognitoSub to be used as User table ID
 *
 * IMPORTANT:
 * - The cognitoSub is extracted from data.User.Username (NOT from the username we passed in)
 * - This cognitoSub becomes the User table ID and owner field
 * - Password is generated from the sanitized email (not the cognitoSub)
 *
 * @param {string} email - Sanitized user email or temp UUID email (always a valid string)
 * @returns {Promise<string>} cognitoSub - The Cognito sub to use as User table ID
 */
const createAppCognitoUser = async (email) => {
  // Create a variable to hold the cognitoSub id
  let cognitoSub = null;

  try {
    // Try creating the Cognito user
    const params = {
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: email,
      MessageAction: 'SUPPRESS',
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'custom:onboarding',
          Value: 'true',
        },
        {
          Name: 'email_verified',
          Value: 'true',
        },
      ],
    };

    const adminUserCreationResponse = await cognito
      .adminCreateUser(params)
      .promise();
    // Set cognitoSub from the response of adminCreateUser - Username is the sub id
    cognitoSub = adminUserCreationResponse.User.Username;
    console.log('[createAppCognitoUser] App Cognito user created:', cognitoSub);
  } catch (error) {
    console.error('[createAppCognitoUser] Error creating Cognito user:', error);
    // Provide a specific error message for duplicate email
    if (error.code === 'UsernameExistsException') {
      throw new Error('Mobile App Email is already in use by another account');
    }
    throw error;
  }

  // After successful creation of our Cognito user, set a permanent password
  // Set permanent password using email
  try {
    const password = generateHashedPassword(email);
    await cognito
      .adminSetUserPassword({
        UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
        Username: cognitoSub,
        Password: password,
        Permanent: true,
      })
      .promise();
  } catch (error) {
    console.error(
      '[createAppCognitoUser] Error setting permanent password:',
      error
    );
    throw error;
  }

  return cognitoSub;
};

/**
 * Create User record in DynamoDB
 *
 * Creates a brand user record in the User table with all necessary fields.
 *
 * @param {string} id - The cognitoSub to use as the User table ID (primary key)
 * @param {object} brandData - Object containing all brand details
 * @param {boolean} toBeRedeemed - Flag indicating if brand needs to be transferred later
 *                                 - true: Brand created without email, must be transferred
 *                                 - false: Brand created with email, user can log in
 * @returns {Promise<object>} user - The created user object
 */
const createUserDynamo = async (
  id,
  {
    username,
    brandName,
    brandDescription,
    brandLogo,
    brandCoverImage,
    brandWebsite,
    brandCountry,
    brandFoundedYear,
    brandStory,
    bio,
    profilePicture,
    coverPicture,
    externalId,
  },
  toBeRedeemed = true
) => {
  const user = {
    id,
    username: username.toLowerCase().trim(),
    brandName: brandName.trim(),
    brandSearchName: brandName
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replaceAll('&', 'ëéèê')
      .toLowerCase()
      .trim(),
    brandDescription: brandDescription?.trim() || null,
    brandLogo: brandLogo ||
      profilePicture || {
        bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
        region: 'us-east-2',
        key: 'new_brand.png',
      },
    brandCoverImage: brandCoverImage || coverPicture || null,
    brandWebsite: brandWebsite?.trim() || null,
    brandCountry: brandCountry?.trim() || null,
    brandFoundedYear: brandFoundedYear || null,
    brandStory: brandStory?.trim() || null,
    externalId,
    bio: bio || brandDescription?.trim() || null,
    deleted: false,
    toBeRedeemed: toBeRedeemed, // Only true if no email is provided
    userType: 'BRAND',
    owner: id,
    isMyCollectionPublic: true,
    profilePicture: profilePicture ||
      brandLogo || {
        bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
        region: 'us-east-2',
        key: 'new_brand.png',
      },
    coverPicture: coverPicture || brandCoverImage || null,
    securitySettings: [
      {
        name: 'seePosts',
        description: '',
        value: 'Public',
      },
      {
        name: 'commentPosts',
        description: '',
        value: 'Public',
      },
      {
        name: 'commentPhotos',
        description: '',
        value: 'Public',
      },
      {
        name: 'location',
        description: '',
        value: 'false',
      },
      {
        name: 'seeLocation',
        description: '',
        value: 'Public',
      },
    ],
    notificationSettings: [
      {
        name: 'friends',
        description:
          'Allows you to customize how you receive notifications when someone follows you.',
        value: 'true',
      },
      {
        name: 'activities',
        description:
          'Allows you to receive notifications when a new activity is available on your feed.',
        value: 'true',
      },
      {
        name: 'clubs',
        description:
          'Allows you to receive notifications for club activity and updates.',
        value: 'true',
      },
    ],
    _typename: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db
    .put({
      TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
      Item: user,
    })
    .promise();

  return user;
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
 * Send mobile app invite email to brand owner
 *
 * Sends a welcome email to the brand owner with their account information
 * and instructions for downloading/accessing the mobile app.
 *
 * This function is NON-CRITICAL - if it fails, brand creation should still succeed.
 * The email is sent ONLY when a valid email is provided during brand creation.
 *
 * @param {string} email - The brand owner's email address
 * @param {string} brandName - The name of the brand
 * @param {string} username - The brand's username (without @ symbol)
 * @returns {Promise<object|null>} Postmark response or null if failed
 */
const sendBrandAppInviteEmail = async (email, brandName, username) => {
  const emailSender = 'Whiskey Social <brands@whiskeysocial.app>';
  const emailSubject = `Welcome to Whiskey Social - ${brandName}`;

  // Load HTML template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'brand-mobile-app-invite-template.html'),
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
    return result;
  } catch (error) {
    console.error('Error sending brand mobile app invite email:', error);
    // Don't throw - we don't want to fail brand creation if email fails
    // Instead, log the error and continue
    return null;
  }
};

// ============================================================
// CMS USER FUNCTIONS
// ============================================================

/**
 * Generate a temporary password for CMS user
 * Follows the same pattern as CreateCMSUser function
 */
const generateTemporaryPassword = () => {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';

  let password = '';
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  const allChars = lowercase + uppercase + numbers + symbols;
  for (let i = 4; i < 12; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  return password
    .split('')
    .sort(() => Math.random() - 0.5)
    .join('');
};

/**
 * Create CMS Cognito user
 *
 * Creates a user in the CMS Cognito User Pool with BrandOwner role.
 * This is separate from the app Cognito user pool.
 *
 * @param {string} email - The brand owner's email
 * @param {string} role - The CMS role (typically "BrandOwner")
 * @returns {Promise<{username: string, temporaryPassword: string, sub: string}>}
 */
const createCmsCognitoUser = async (email, role = 'BrandOwner') => {
  const tempPassword = generateTemporaryPassword();

  const params = {
    UserPoolId: CMS_COGNITO_USER_POOL_ID,
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'true',
      },
      {
        Name: 'custom:is_active',
        Value: 'true',
      },
    ],
    MessageAction: 'SUPPRESS',
    TemporaryPassword: tempPassword,
  };

  try {
    const result = await cognito.adminCreateUser(params).promise();
    console.log(
      '[createCmsCognitoUser] CMS Cognito user created:',
      result.User.Username
    );

    // Add the user to the BrandOwner group
    if (role) {
      const addToGroupParams = {
        GroupName: role,
        UserPoolId: CMS_COGNITO_USER_POOL_ID,
        Username: result.User.Username,
      };

      await cognito.adminAddUserToGroup(addToGroupParams).promise();
      console.log('[createCmsCognitoUser] User added to group:', role);
    }

    return {
      username: result.User.Username,
      temporaryPassword: tempPassword,
      sub: result.User.Attributes.find((attr) => attr.Name === 'sub').Value,
    };
  } catch (error) {
    console.error(
      '[createCmsCognitoUser] Error creating CMS Cognito user:',
      error
    );
    // Provide a specific error message for duplicate email
    if (error.code === 'UsernameExistsException') {
      throw new Error(
        'CMS Brand Owner Email is already in use by another account'
      );
    }
    throw error;
  }
};

/**
 * Create CMS User record in DynamoDB
 *
 * Creates a record in the CMSUser table linking the brand owner to the CMS system.
 *
 * @param {string} email - The brand owner's email
 * @param {string} role - The CMS role
 * @param {string} authId - The Cognito sub from CMS user pool
 * @returns {Promise<string>} The CMS user ID (same as authId)
 */
const createCmsUser = async (email, role, authId) => {
  const timestamp = new Date().toISOString();

  const params = {
    TableName: API_WHISKEYSOCIAL_CMSUSERTABLE_NAME,
    Item: {
      id: authId,
      authId: authId,
      email: email,
      role: role,
      isActive: true,
      createdAt: timestamp,
      updatedAt: timestamp,
      __typename: 'CMSUser',
    },
  };

  try {
    await db.put(params).promise();
    console.log('[createCmsUser] CMS user record created:', authId);
    return authId;
  } catch (error) {
    console.error('[createCmsUser] Error creating CMS user record:', error);
    throw error;
  }
};

/**
 * Create CMS User Brand association
 *
 * Creates a record in the CMSUserBrand table linking the CMS user to their brand.
 * This allows the brand owner to manage their brand in the CMS.
 *
 * @param {string} cmsUserId - The CMS user ID
 * @param {string} brandUserId - The brand's User table ID (app user)
 * @param {string} assignedBy - Who assigned this relationship (typically "System" or admin username)
 * @returns {Promise<string>} The entry ID
 */
const createCmsUserBrandEntry = async (cmsUserId, brandUserId, assignedBy) => {
  const entryId = uuidv4();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME,
    Item: {
      id: entryId,
      cmsUserId: cmsUserId,
      brandUserId: brandUserId,
      assignedAt: timestamp,
      assignedBy: assignedBy,
      createdAt: timestamp,
      updatedAt: timestamp,
      __typename: 'CMSUserBrand',
    },
  };

  try {
    await db.put(params).promise();
    console.log(
      '[createCmsUserBrandEntry] CMS user brand association created:',
      entryId
    );
    return entryId;
  } catch (error) {
    console.error(
      '[createCmsUserBrandEntry] Error creating association:',
      error
    );
    throw error;
  }
};

/**
 * Check if CMS Cognito user already exists
 *
 * @param {string} email - The email to check
 * @returns {Promise<{exists: boolean, user: object|null}>}
 */
const checkCmsCognitoUserExists = async (email) => {
  try {
    const params = {
      UserPoolId: CMS_COGNITO_USER_POOL_ID,
      Username: email,
    };
    const result = await cognito.adminGetUser(params).promise();
    console.log(
      '[checkCmsCognitoUserExists] CMS Cognito user already exists:',
      email
    );
    return { exists: true, user: result };
  } catch (error) {
    if (error.code === 'UserNotFoundException') {
      return { exists: false, user: null };
    }
    // For other errors, log and rethrow
    console.error(
      '[checkCmsCognitoUserExists] Error checking CMS Cognito user:',
      error
    );
    throw error;
  }
};

/**
 * Check if CMSUser DynamoDB record already exists
 *
 * @param {string} authId - The Cognito sub to check
 * @returns {Promise<{exists: boolean, user: object|null}>}
 */
const checkCmsUserExists = async (authId) => {
  try {
    const params = {
      TableName: API_WHISKEYSOCIAL_CMSUSERTABLE_NAME,
      Key: { id: authId },
    };
    const result = await db.get(params).promise();
    if (result.Item) {
      console.log(
        '[checkCmsUserExists] CMSUser record already exists:',
        authId
      );
      return { exists: true, user: result.Item };
    }
    return { exists: false, user: null };
  } catch (error) {
    console.error('[checkCmsUserExists] Error checking CMSUser record:', error);
    throw error;
  }
};

/**
 * Check if CMSUserBrand association already exists
 *
 * @param {string} cmsUserId - The CMS user ID
 * @param {string} brandUserId - The brand's User table ID
 * @returns {Promise<{exists: boolean, association: object|null}>}
 */
const checkCmsUserBrandExists = async (cmsUserId, brandUserId) => {
  try {
    const params = {
      TableName: API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME,
      FilterExpression: 'cmsUserId = :cmsUserId AND brandUserId = :brandUserId',
      ExpressionAttributeValues: {
        ':cmsUserId': cmsUserId,
        ':brandUserId': brandUserId,
      },
    };
    const result = await db.scan(params).promise();
    if (result.Items && result.Items.length > 0) {
      console.log(
        '[checkCmsUserBrandExists] CMSUserBrand association already exists'
      );
      return { exists: true, association: result.Items[0] };
    }
    return { exists: false, association: null };
  } catch (error) {
    console.error(
      '[checkCmsUserBrandExists] Error checking CMSUserBrand association:',
      error
    );
    throw error;
  }
};

/**
 * Send brand owner CMS access email
 *
 * Sends an email to the brand owner with their CMS login credentials and access link.
 * Uses the brand-owner-email-template.html template.
 *
 * @param {string} email - The brand owner's email
 * @param {string} brandName - The name of the brand
 * @param {string} username - The brand's username
 * @param {string} temporaryPassword - The temporary password for CMS login
 * @returns {Promise<object|null>} Postmark response or null if failed
 */
const sendBrandOwnerCmsEmail = async (
  email,
  brandName,
  username,
  temporaryPassword
) => {
  const emailSender = 'Whiskey Social <brands@whiskeysocial.app>';
  const emailSubject = `Welcome to Whiskey Social - ${brandName}`;

  // Load HTML template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'brand-owner-email-template.html'),
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
    .replace(/{{username}}/g, username)
    .replace(/{{cmsUrl}}/g, getCmsUrl())
    .replace(/{{temporaryPassword}}/g, temporaryPassword);

  // Text version for email clients that don't support HTML
  const emailBodyText = `Welcome to Whiskey Social!

Your brand "${brandName}" has been successfully created. As the brand owner, you now have exclusive access to manage your brand on Whiskey Social.

Access your brand dashboard: ${getCmsUrl()}

Your Login Credentials:
------------------------
Email: ${email}
Temporary Password: ${temporaryPassword}
Brand Name: ${brandName}
Brand Username: @${username}

Important: You will be prompted to change your password on first login.

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
    console.log('[sendBrandOwnerCmsEmail] Email sent successfully');
    return result;
  } catch (error) {
    console.error('[sendBrandOwnerCmsEmail] Error sending email:', error);
    // Don't throw - we don't want to fail brand creation if email fails
    return null;
  }
};

// ============================================================
// MAIN HANDLER
// ============================================================

/**
 * CreateBrandV2 Handler
 *
 * Creates a new brand user with the following flow:
 * 1. Validates admin permissions and inputs
 * 2. Validates and processes mobile and CMS emails separately
 * 3. Creates mobile app Cognito user (with mobileEmail if provided, or temp UUID email if not)
 * 4. Extracts cognitoSub from Cognito response - this becomes the User table ID
 * 5. Creates User record in DynamoDB with cognitoSub as ID and owner
 * 6. If cmsEmail provided: Creates CMS user for brand owner access (with idempotency)
 *    a. Checks if CMS Cognito user exists; creates if not (tracks creation)
 *    b. Checks if CMSUser record exists; creates if not (tracks creation)
 *    c. Checks if CMSUserBrand association exists; creates if not (tracks creation)
 *    d. Sends brand owner CMS access email with credentials (only if new user)
 * 7. If mobileEmail provided: Sends mobile app invite email
 *
 * SCENARIOS SUPPORTED:
 * - Mobile email only: User can log in to mobile app, no CMS access
 * - CMS email only: Brand owner has CMS access, mobile app requires transfer
 * - Both emails: User can log in to mobile app, separate brand owner has CMS access
 * - No emails: Brand must be transferred later, no CMS access yet
 *
 * CRITICAL CONCEPT: User table ID is ALWAYS the mobile app Cognito sub
 *
 * IDEMPOTENCY:
 * - CMS creation is idempotent: reuses existing resources if Lambda retries
 * - Brand creation always succeeds even if CMS creation fails
 *
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  try {
    // Step 1: Validate admin permissions
    const adminUsername = validateAdminUser(event);

    // Step 2: Extract and validate inputs
    const { token, username, brandName, mobileEmail, cmsEmail } =
      event.arguments.input;

    if (!token || !username || !brandName) {
      throw new Error('Missing required fields: token, username, or brandName');
    }

    // Step 3: Validate token
    if (token !== TOKEN) {
      throw new Error('Unauthorized request: Invalid token');
    }

    // Step 4: Check username uniqueness
    await checkUsernameUniqueness(username.toLowerCase().trim());

    // Step 5: Validate and sanitize mobile email
    // Mobile email is used for mobile app Cognito user creation
    const {
      isValid: mobileEmailValid,
      sanitizedEmail: sanitizedMobileEmail,
      toBeRedeemed,
    } = validateEmail(mobileEmail);

    // Validate and sanitize CMS email (separate from mobile email)
    const { isValid: cmsEmailValid, sanitizedEmail: sanitizedCmsEmail } =
      validateEmail(cmsEmail);

    // Step 6: Create mobile app Cognito user using mobile email
    const cognitoSub = await createAppCognitoUser(sanitizedMobileEmail);

    // Step 7: Create User record in DynamoDB
    // The third parameter is the toBeRedeemed flag:
    // - If email provided: toBeRedeemed = false (user can log in immediately)
    // - If no email: toBeRedeemed = true (brand must be transferred later)
    const user = await createUserDynamo(
      cognitoSub, // User table ID = cognitoSub
      event.arguments.input,
      toBeRedeemed
    );

    // Step 8: If CMS email provided, create CMS user for brand owner access
    // This allows the brand owner to manage their brand via the CMS
    let cmsUserCreated = false;
    let cmsTemporaryPassword = null;

    if (cmsEmailValid) {
      try {
        // Step 8a: Create CMS Cognito user (with idempotency check)
        console.log('[CreateBrandV2] Checking if CMS Cognito user exists...');
        const cognitoCheck = await checkCmsCognitoUserExists(sanitizedCmsEmail);

        let cmsCognitoUser;
        if (cognitoCheck.exists) {
          console.log(
            '[CreateBrandV2] CMS Cognito user already exists, reusing...'
          );
          // Extract sub from existing user attributes
          const subAttr = cognitoCheck.user.UserAttributes.find(
            (attr) => attr.Name === 'sub'
          );
          cmsCognitoUser = {
            username: cognitoCheck.user.Username,
            temporaryPassword: null, // Can't retrieve existing password
            sub: subAttr.Value,
          };
          // Note: We can't send email with temp password if user already exists
          console.log(
            '[CreateBrandV2] Cannot send CMS email - user already exists, password unknown'
          );
        } else {
          cmsCognitoUser = await createCmsCognitoUser(
            sanitizedCmsEmail,
            'BrandOwner'
          );
          cmsTemporaryPassword = cmsCognitoUser.temporaryPassword;
        }

        // Step 8b: Create CMSUser record in DynamoDB (with idempotency check)
        console.log('[CreateBrandV2] Checking if CMSUser record exists...');
        const cmsUserCheck = await checkCmsUserExists(cmsCognitoUser.sub);

        let cmsUserId;
        if (cmsUserCheck.exists) {
          console.log(
            '[CreateBrandV2] CMSUser record already exists, reusing...'
          );
          cmsUserId = cmsUserCheck.user.id;
        } else {
          cmsUserId = await createCmsUser(
            sanitizedCmsEmail,
            'BrandOwner',
            cmsCognitoUser.sub
          );
        }

        // Step 8c: Create CMSUserBrand association (with idempotency check)
        console.log(
          '[CreateBrandV2] Checking if CMSUserBrand association exists...'
        );
        const associationCheck = await checkCmsUserBrandExists(
          cmsUserId,
          user.id
        );

        if (associationCheck.exists) {
          console.log(
            '[CreateBrandV2] CMSUserBrand association already exists, skipping...'
          );
        } else {
          const associationId = await createCmsUserBrandEntry(
            cmsUserId,
            user.id, // Link to the brand's User table ID
            adminUsername || 'System'
          );
        }

        cmsUserCreated = true;
        console.log('[CreateBrandV2] CMS user setup completed successfully');

        // Step 8d: Send brand owner CMS access email (only if we have temp password)
        if (cmsTemporaryPassword) {
          try {
            await sendBrandOwnerCmsEmail(
              sanitizedCmsEmail,
              brandName,
              username,
              cmsTemporaryPassword
            );
            console.log('[CreateBrandV2] Brand owner CMS email sent');
          } catch (emailError) {
            console.error(
              '[CreateBrandV2] Failed to send brand owner CMS email:',
              emailError
            );
            // Don't fail brand creation if email fails - this is non-critical
          }
        } else {
          console.log(
            '[CreateBrandV2] Skipping CMS email - no temporary password available (user existed)'
          );
        }
      } catch (cmsError) {
        console.error('[CreateBrandV2] Error creating CMS user:', cmsError);

        // Don't fail brand creation if CMS user creation fails
        // The brand can still be used in the mobile app
        // CMS access can be set up manually later if needed
      }
    }

    // Step 9: Send mobile app invite email if mobile email was provided
    // Skip if the CMS email and mobile email are the same address — the CMS
    // onboarding email already covers that recipient, and sending both would
    // result in duplicate welcome emails to the same inbox.
    const mobileAndCmsSameAddress =
      mobileEmailValid &&
      cmsEmailValid &&
      sanitizedMobileEmail === sanitizedCmsEmail;

    if (mobileEmailValid && !mobileAndCmsSameAddress) {
      try {
        await sendBrandAppInviteEmail(
          sanitizedMobileEmail,
          brandName,
          username
        );
        console.log('[CreateBrandV2] Mobile app invite email sent');
      } catch (emailError) {
        console.error(
          '[CreateBrandV2] Failed to send mobile app invite email:',
          emailError
        );
        // Don't fail brand creation if email fails - this is non-critical
      }
    }

    console.log('Brand creation successful:', {
      id: user.id,
      username: user.username,
      brandName: user.brandName,
      toBeRedeemed: user.toBeRedeemed,
      mobileEmailProvided: mobileEmailValid,
      cmsUserCreated: cmsUserCreated,
      createdBy: adminUsername,
    });

    return user;
  } catch (error) {
    console.error('ERROR in CreateBrandV2:', error);
    throw error;
  }
};
