/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */ const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const postmark = require('postmark');
const fs = require('fs');
const path = require('path');

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ssm = new AWS.SSM();

const CMS_USERS_TABLE = process.env.API_WHISKEYSOCIAL_CMSUSERTABLE_NAME;
const CMS_USER_BRAND_TABLE =
  process.env.API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME;
const USER_TABLE = process.env.API_WHISKEYSOCIAL_USERTABLE_NAME;

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

const checkUserExists = async (email) => {
  const params = {
    TableName: CMS_USERS_TABLE,
    FilterExpression: 'email = :email',
    ExpressionAttributeValues: {
      ':email': email,
    },
  };

  try {
    console.log('checkUserExists params: ', JSON.stringify(params));
    const result = await dynamodb.scan(params).promise();
    console.log('checkUserExists result:', JSON.stringify(result));
    return result.Items && result.Items.length > 0 ? result.Items[0] : null;
  } catch (error) {
    console.error('Error checking user existence:', error);
    throw error;
  }
};

const checkBrandOwnership = async (cmsUserId, brandId) => {
  // Check the CMSUserBrand table for the relationship
  const brandOwnershipParams = {
    TableName: CMS_USER_BRAND_TABLE,
    FilterExpression: 'cmsUserId = :cmsUserId AND brandUserId = :brandId',
    ExpressionAttributeValues: {
      ':cmsUserId': cmsUserId,
      ':brandId': brandId,
    },
  };

  console.log(
    'checkBrandOwnership params: ',
    JSON.stringify(brandOwnershipParams)
  );
  try {
    const result = await dynamodb.scan(brandOwnershipParams).promise();
    console.log('checkBrandOwnership result: ', JSON.stringify(result));

    // If there's a record in CMSUserBrand table, the user owns the brand
    return result.Items && result.Items.length > 0;
  } catch (error) {
    console.error('Error checking brand ownership:', error);
    throw error;
  }
};

const createCognitoUser = async (email, group, cognitoUserPool) => {
  const tempPassword = generateTemporaryPassword();

  const params = {
    UserPoolId: cognitoUserPool,
    Username: email,
    UserAttributes: [
      {
        Name: 'email',
        Value: email,
      },
      {
        Name: 'email_verified',
        Value: 'false',
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
    console.log('createCognitoUser params: ', JSON.stringify(params));
    const result = await cognito.adminCreateUser(params).promise();
    console.log('createCognitoUser result: ', JSON.stringify(result));

    // Add the user to the specified group
    if (group) {
      const addToGroupParams = {
        GroupName: group,
        UserPoolId: cognitoUserPool,
        Username: result.User.Username,
      };

      console.log('Adding user to group:', JSON.stringify(addToGroupParams));
      await cognito.adminAddUserToGroup(addToGroupParams).promise();
      console.log(`User added to ${group} group successfully`);
    }

    return {
      username: result.User.Username,
      temporaryPassword: tempPassword,
      sub: result.User.Attributes.find((attr) => attr.Name === 'sub').Value,
    };
  } catch (error) {
    console.error('Error creating Cognito user:', error);
    throw error;
  }
};

const createCMSUser = async (email, role, authId) => {
  //const cmsUserId = uuidv4();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: CMS_USERS_TABLE,
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
    console.log('createCMSUser params: ', JSON.stringify(params));
    await dynamodb.put(params).promise();
    console.log('createCMSUser cmsUserId: ', authId);
    return authId;
  } catch (error) {
    console.error('Error creating CMS user:', error);
    throw error;
  }
};

const createCMSUserBrandEntry = async (cmsUserId, brandId, assignedBy) => {
  const entryId = uuidv4();
  const timestamp = new Date().toISOString();

  const params = {
    TableName: CMS_USER_BRAND_TABLE,
    Item: {
      id: entryId,
      cmsUserId: cmsUserId,
      brandUserId: brandId,
      assignedAt: timestamp,
      assignedBy: assignedBy,
      createdAt: timestamp,
      updatedAt: timestamp,
      __typename: 'CMSUserBrand',
    },
  };

  try {
    console.log('createCMSUserBrandEntry params: ', JSON.stringify(params));
    await dynamodb.put(params).promise();
    console.log('createCMSUser entryId: ', entryId);
    return entryId;
  } catch (error) {
    console.error('Error creating CMS user brand entry:', error);
    throw error;
  }
};

let postmarkClient = null;

const getPostmarkClient = async () => {
  console.log('getting postmark client');
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
  console.log('returning postmark client');
  return postmarkClient;
};

const sendInvitationEmail = async (email, role, brandId, temporaryPassword) => {
  const emailSender = 'Whiskey Social <pours@whiskeysocial.app>';
  const emailSubject = '[WS CMS] Welcome to Whiskey Social CMS';

  // Generate invitation URL
  let baseUrl;
  // Check for CMS_URL override first (set in AWS Amplify Console)
  if (process.env.CMS_URL) {
    baseUrl = process.env.CMS_URL;
  } else if (process.env.ENV === 'prod') {
    // Production fallback (matches CreateBrandV2 pattern)
    baseUrl = 'https://cms-prod.d1qp1ad0zi25cp.amplifyapp.com';
  } else {
    // Dev environment fallback (matches CreateBrandV2 pattern, defaults to dev for safety)
    baseUrl = 'https://main.d1qp1ad0zi25cp.amplifyapp.com';
  }
  const invitationUrl = `${baseUrl}/login?invitation=true&email=${encodeURIComponent(
    email
  )}`;

  let brandInfo = '';
  if (brandId) {
    brandInfo = `Brand Access: ${brandId}`;
  }

  // Load HTML template
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, 'email-template.html'),
    'utf8'
  );

  // Load logo base64
  const WS_LOGO_BASE64 = fs
    .readFileSync(path.join(__dirname, 'logo-base64.txt'), 'utf8')
    .trim();

  // Replace tokens in HTML template
  const htmlBody = htmlTemplate
    .replace(/{{email}}/g, email)
    .replace(/{{role}}/g, role)
    .replace(/{{invitationUrl}}/g, invitationUrl)
    .replace(/{{temporaryPassword}}/g, temporaryPassword)
    .replace(/{{brandInfo}}/g, brandInfo);

  // Text version for email clients that don't support HTML
  const emailBodyText = `Welcome to Whiskey Social CMS

You've been invited to join the Whiskey Social Content Management System with the role of ${role}.

Accept your invitation: ${invitationUrl}

Your account details:
Email: ${email}
Temporary Password: ${temporaryPassword}
Role: ${role}
${brandInfo}

If you have any questions, please contact the administrator.

If you didn't expect this invitation, please ignore this email.`;

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
    return await client.sendEmail(message);
  } catch (error) {
    console.error('Error sending invitation email:', error);
    throw error;
  }
};

exports.handler = async (event) => {
  console.log('CreateCMSUser event:', JSON.stringify(event, null, 2));

  const iss = event.identity?.issuer || event.identity?.claims?.iss;
  const userPoolId = iss?.split('/').pop();

  const { email, brandId, role } = event.arguments;
  console.log('email is: ', email);
  console.log('role is: ', role);
  const cognitoSub = event.identity?.sub;
  const cognitoGroups = event.identity?.claims['cognito:groups'] || [];
  const isUserAdmin = cognitoGroups.find((g) => g === 'Admin');
  const isUserBrandOwner = cognitoGroups.find((g) => g === 'BrandOwner');

  try {
    // Step 1: Check if user already exists in CMSUsers table
    const existingUser = await checkUserExists(email);
    if (existingUser) {
      console.log('User exists', JSON.stringify(existingUser));
      return {
        statusCode: 400,
        success: false,
        message: 'User with this email already exists in the CMS system',
        cmsUserId: null,
      };
    }

    console.log('user does not exist, checking current user group');

    // Step 3: Validate permissions based on group
    if (!isUserAdmin) {
      console.log('user is not an admin, checking if brand owner');
      if (isUserBrandOwner) {
        console.log(
          'user is brand a brand owner, checking if they are the brand owner of this brand'
        );
        if (!brandId) {
          console.log('Brand Id not passed in');
          return {
            statusCode: 400,
            success: false,
            message: 'Brand ID is required for BrandOwner to create users',
            cmsUserId: null,
          };
        }

        // Check if the current user owns the brand
        const isOwner = await checkBrandOwnership(cognitoSub, brandId);
        if (!isOwner) {
          return {
            statusCode: 403,
            success: false,
            message:
              'You do not have permission to create users for this brand',
            cmsUserId: null,
          };
        }
      } else {
        return {
          statusCode: 403,
          success: false,
          message: 'You do not have permission to create CMS users',
          cmsUserId: null,
        };
      }
    }

    // Step 4: Create new Cognito user with temporary password
    const cognitoUser = await createCognitoUser(email, role, userPoolId);
    console.log('Created Cognito user:', cognitoUser.username);

    // Step 5: Create entry in CMSUsers table
    const cmsUserId = await createCMSUser(email, role, cognitoUser.sub);
    console.log('Created CMS user:', cmsUserId);

    // Step 6: If brandId provided, create entry in CMSUserBrand table
    if (brandId) {
      // Use current user's Cognito Sub (CMS user ID) if available, otherwise use email for Admin
      const currentUserCmsId = cognitoSub;
      const assignedBy =
        currentUserCmsId || event.identity?.claims?.email || 'System';
      await createCMSUserBrandEntry(cmsUserId, brandId, assignedBy);
      console.log('Created CMS user brand association');
    }

    // Step 7: Send invitation email with temporary password
    try {
      await sendInvitationEmail(
        email,
        role,
        brandId,
        cognitoUser.temporaryPassword
      );
      console.log('Invitation email sent');
    } catch (emailError) {
      console.error('Error sending invitation email:', emailError);
      // Don't fail the whole operation if email fails
    }

    return {
      statusCode: 200,
      success: true,
      message: 'CMS user created successfully and invitation sent.',
      cmsUserId: cmsUserId,
    };
  } catch (error) {
    console.error('Error in CreateCMSUser:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to create CMS user',
      cmsUserId: null,
    };
  }
};
