/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const postmark = require('postmark');

// Initialize AWS service clients
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();
const ssm = new AWS.SSM();

// Table names from environment variables
const CMS_USERS_TABLE = process.env.API_WHISKEYSOCIAL_CMSUSERTABLE_NAME;
const CMS_USER_BRAND_TABLE = process.env.API_WHISKEYSOCIAL_CMSUSERBRANDTABLE_NAME;

/**
 * Fetches a CMS user by their ID from DynamoDB
 * @param {string} userId - The ID of the user to fetch
 * @returns {Object|null} The user object or null if not found
 */
const getUserById = async (userId) => {
  const params = {
    TableName: CMS_USERS_TABLE,
    Key: {
      id: userId
    }
  };

  try {
    console.log('getUserById params:', JSON.stringify(params));
    const result = await dynamodb.get(params).promise();
    console.log('getUserById result:', JSON.stringify(result));
    return result.Item || null;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

/**
 * Gets all brand associations for a specific user
 * @param {string} userId - The CMS user ID
 * @returns {Array} Array of brand associations
 */
const getUserBrands = async (userId) => {
  const params = {
    TableName: CMS_USER_BRAND_TABLE,
    FilterExpression: 'cmsUserId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };

  try {
    console.log('getUserBrands params:', JSON.stringify(params));
    const result = await dynamodb.scan(params).promise();
    console.log('getUserBrands result:', JSON.stringify(result));
    return result.Items || [];
  } catch (error) {
    console.error('Error fetching user brands:', error);
    throw error;
  }
};

/**
 * Checks if a user owns a specific brand
 * @param {string} cmsUserId - The CMS user ID
 * @param {string} brandId - The brand ID to check
 * @returns {boolean} True if user owns the brand
 */
const checkBrandOwnership = async (cmsUserId, brandId) => {
  const params = {
    TableName: CMS_USER_BRAND_TABLE,
    FilterExpression: 'cmsUserId = :cmsUserId AND brandUserId = :brandId',
    ExpressionAttributeValues: {
      ':cmsUserId': cmsUserId,
      ':brandId': brandId
    }
  };

  try {
    console.log('checkBrandOwnership params:', JSON.stringify(params));
    const result = await dynamodb.scan(params).promise();
    console.log('checkBrandOwnership result:', JSON.stringify(result));
    return result.Items && result.Items.length > 0;
  } catch (error) {
    console.error('Error checking brand ownership:', error);
    throw error;
  }
};

/**
 * Validates if the requesting user has permission to update the target user
 * @param {Object} requestingUser - The user making the request
 * @param {Object} targetUser - The user being updated
 * @param {Array} requestingUserGroups - Cognito groups of requesting user
 * @param {Object} updateData - The data being updated
 * @returns {Object} Validation result with success flag and message
 */
const validatePermissions = async (requestingUser, targetUser, requestingUserGroups, updateData) => {
  const isAdmin = requestingUserGroups.includes('Admin');
  const isBrandOwner = requestingUserGroups.includes('BrandOwner');
  const isBrandEditor = requestingUserGroups.includes('BrandEditor');

  console.log('Validating permissions - Groups:', requestingUserGroups);
  console.log('Update data:', updateData);

  // BrandEditors cannot update any users
  if (isBrandEditor && !isAdmin && !isBrandOwner) {
    return {
      success: false,
      message: 'BrandEditors do not have permission to update users'
    };
  }

  // Admins can update anyone
  if (isAdmin) {
    return { success: true };
  }

  // BrandOwners have limited permissions
  if (isBrandOwner) {
    // Cannot promote to Admin or BrandOwner
    if (updateData.role && ['Admin', 'BrandOwner'].includes(updateData.role)) {
      return {
        success: false,
        message: 'BrandOwners cannot promote users to Admin or BrandOwner roles'
      };
    }

    // Check if BrandOwner has access to this user through brand association
    const targetUserBrands = await getUserBrands(targetUser.id);
    const requestingUserBrands = await getUserBrands(requestingUser.sub);
    
    // Find common brands between requesting user and target user
    const requestingBrandIds = requestingUserBrands.map(b => b.brandUserId);
    const targetBrandIds = targetUserBrands.map(b => b.brandUserId);
    const commonBrands = requestingBrandIds.filter(id => targetBrandIds.includes(id));

    if (commonBrands.length === 0) {
      return {
        success: false,
        message: 'You can only update users associated with your brands'
      };
    }

    // Validate brand operations only affect owned brands
    if (updateData.brandIds) {
      // Check that BrandOwner owns all brands they're trying to assign
      for (const brandId of updateData.brandIds) {
        const ownsThisBrand = requestingBrandIds.includes(brandId);
        if (!ownsThisBrand) {
          return {
            success: false,
            message: `You do not have permission to manage brand ${brandId}`
          };
        }
      }
    }

    return { success: true };
  }

  return {
    success: false,
    message: 'You do not have permission to update users'
  };
};

/**
 * Updates Cognito user groups based on role change
 * @param {string} username - Cognito username (email)
 * @param {string} oldRole - Previous role
 * @param {string} newRole - New role to assign
 * @param {string} userPoolId - Cognito User Pool ID
 */
const updateCognitoGroups = async (username, oldRole, newRole, userPoolId) => {
  try {
    // Remove from old group if it exists
    if (oldRole) {
      try {
        const removeParams = {
          GroupName: oldRole,
          UserPoolId: userPoolId,
          Username: username
        };
        console.log('Removing user from group:', removeParams);
        await cognito.adminRemoveUserFromGroup(removeParams).promise();
      } catch (error) {
        // Group might not exist or user might not be in it
        console.log('Could not remove from old group:', error.message);
      }
    }

    // Add to new group
    if (newRole) {
      const addParams = {
        GroupName: newRole,
        UserPoolId: userPoolId,
        Username: username
      };
      console.log('Adding user to group:', addParams);
      await cognito.adminAddUserToGroup(addParams).promise();
    }

    console.log(`Successfully updated Cognito groups from ${oldRole} to ${newRole}`);
  } catch (error) {
    console.error('Error updating Cognito groups:', error);
    throw error;
  }
};

/**
 * Updates Cognito user status (enable/disable)
 * @param {string} username - Cognito username (email)
 * @param {boolean} isActive - Whether user should be active
 * @param {string} userPoolId - Cognito User Pool ID
 */
const updateUserStatus = async (username, isActive, userPoolId) => {
  try {
    if (isActive) {
      const enableParams = {
        UserPoolId: userPoolId,
        Username: username
      };
      console.log('Enabling user:', enableParams);
      await cognito.adminEnableUser(enableParams).promise();
    } else {
      const disableParams = {
        UserPoolId: userPoolId,
        Username: username
      };
      console.log('Disabling user:', disableParams);
      await cognito.adminDisableUser(disableParams).promise();
    }
    console.log(`User ${username} status updated to ${isActive ? 'active' : 'inactive'}`);
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

/**
 * Updates Cognito user email attribute
 * @param {string} username - Current Cognito username (email)
 * @param {string} newEmail - New email address
 * @param {string} userPoolId - Cognito User Pool ID
 */
const updateCognitoEmail = async (username, newEmail, userPoolId) => {
  try {
    const params = {
      UserPoolId: userPoolId,
      Username: username,
      UserAttributes: [
        {
          Name: 'email',
          Value: newEmail
        },
        {
          Name: 'email_verified',
          Value: 'false' // Reset verification when email changes
        }
      ]
    };
    console.log('Updating Cognito email:', params);
    await cognito.adminUpdateUserAttributes(params).promise();
    console.log(`Email updated from ${username} to ${newEmail}`);
  } catch (error) {
    console.error('Error updating Cognito email:', error);
    throw error;
  }
};

/**
 * Creates a brand association entry in CMSUserBrand table
 * @param {string} cmsUserId - CMS User ID
 * @param {string} brandId - Brand ID
 * @param {string} assignedBy - Who assigned this brand
 */
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
      __typename: 'CMSUserBrand'
    }
  };

  try {
    console.log('createCMSUserBrandEntry params:', JSON.stringify(params));
    await dynamodb.put(params).promise();
    console.log('Created brand association:', entryId);
    return entryId;
  } catch (error) {
    console.error('Error creating brand association:', error);
    throw error;
  }
};

/**
 * Removes a brand association from CMSUserBrand table
 * @param {string} cmsUserId - CMS User ID
 * @param {string} brandId - Brand ID to remove
 */
const removeCMSUserBrandEntry = async (cmsUserId, brandId) => {
  // First find the entry
  const scanParams = {
    TableName: CMS_USER_BRAND_TABLE,
    FilterExpression: 'cmsUserId = :userId AND brandUserId = :brandId',
    ExpressionAttributeValues: {
      ':userId': cmsUserId,
      ':brandId': brandId
    }
  };

  try {
    const scanResult = await dynamodb.scan(scanParams).promise();
    if (scanResult.Items && scanResult.Items.length > 0) {
      // Delete each matching entry
      for (const item of scanResult.Items) {
        const deleteParams = {
          TableName: CMS_USER_BRAND_TABLE,
          Key: {
            id: item.id
          }
        };
        console.log('Deleting brand association:', deleteParams);
        await dynamodb.delete(deleteParams).promise();
      }
      console.log(`Removed brand association for user ${cmsUserId} and brand ${brandId}`);
    }
  } catch (error) {
    console.error('Error removing brand association:', error);
    throw error;
  }
};

/**
 * Handles the updateCMSUserWithAuth mutation (edit email/role/status/brands).
 */
const handleUpdate = async (event) => {
  console.log('UpdateCMSUser event:', JSON.stringify(event, null, 2));

  // Extract user pool ID from the event
  const iss = event.identity?.issuer || event.identity?.claims?.iss;
  const userPoolId = iss?.split('/').pop();

  // Extract requesting user information
  const requestingUserSub = event.identity?.sub;
  const requestingUserEmail = event.identity?.claims?.email;
  const cognitoGroups = event.identity?.claims['cognito:groups'] || [];

  // Extract update parameters from arguments
  const {
    userId,
    email,
    role,
    isActive,
    brandIds      // Single array of brand IDs to set for the user
  } = event.arguments;

  console.log('Update parameters:', {
    userId,
    email,
    role,
    isActive,
    brandIds
  });

  try {
    // Validate required parameters
    if (!userId) {
      return {
        statusCode: 400,
        success: false,
        message: 'User ID is required',
        updatedUser: null
      };
    }

    // Prevent users from updating their own role (security measure)
    if (requestingUserSub === userId && role) {
      return {
        statusCode: 403,
        success: false,
        message: 'You cannot update your own role',
        updatedUser: null
      };
    }

    // Step 1: Fetch the target user
    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return {
        statusCode: 404,
        success: false,
        message: 'User not found',
        updatedUser: null
      };
    }

    // Step 2: Validate permissions
    const requestingUser = { sub: requestingUserSub, email: requestingUserEmail };
    const permissionResult = await validatePermissions(
      requestingUser,
      targetUser,
      cognitoGroups,
      event.arguments
    );

    if (!permissionResult.success) {
      return {
        statusCode: 403,
        success: false,
        message: permissionResult.message,
        updatedUser: null
      };
    }

    // Step 3: Update DynamoDB CMSUser record
    const updateTimestamp = new Date().toISOString();
    const updateExpressions = [];
    const expressionAttributeNames = {};
    const expressionAttributeValues = {
      ':updatedAt': updateTimestamp
    };

    // Always update the timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';

    // Build update expressions based on provided fields
    if (email !== undefined && email !== targetUser.email) {
      updateExpressions.push('#email = :email');
      expressionAttributeNames['#email'] = 'email';
      expressionAttributeValues[':email'] = email;
    }

    if (role !== undefined && role !== targetUser.role) {
      updateExpressions.push('#role = :role');
      expressionAttributeNames['#role'] = 'role';
      expressionAttributeValues[':role'] = role;
    }

    if (isActive !== undefined && isActive !== targetUser.isActive) {
      updateExpressions.push('#isActive = :isActive');
      expressionAttributeNames['#isActive'] = 'isActive';
      expressionAttributeValues[':isActive'] = isActive;
    }

    // Update the DynamoDB record
    if (updateExpressions.length > 0) {
      const updateParams = {
        TableName: CMS_USERS_TABLE,
        Key: { id: userId },
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW'
      };

      console.log('Updating DynamoDB user:', updateParams);
      const updateResult = await dynamodb.update(updateParams).promise();
      console.log('DynamoDB update result:', updateResult);
    }

    // Step 4: Update Cognito if needed
    const originalEmail = targetUser.email;

    // Update Cognito email if changed
    if (email && email !== originalEmail) {
      await updateCognitoEmail(originalEmail, email, userPoolId);
    }

    // Update Cognito groups if role changed
    if (role && role !== targetUser.role) {
      // Use the new email if it was changed, otherwise use original
      const cognitoUsername = email || originalEmail;
      await updateCognitoGroups(cognitoUsername, targetUser.role, role, userPoolId);
    }

    // Update Cognito user status if changed
    if (isActive !== undefined && isActive !== targetUser.isActive) {
      const cognitoUsername = email || originalEmail;
      await updateUserStatus(cognitoUsername, isActive, userPoolId);
    }

    // Step 5: Handle brand associations if brandIds is provided
    let finalBrandIds = [];
    
    if (brandIds !== undefined) {
      // Get current brand associations
      const currentBrands = await getUserBrands(userId);
      const currentBrandIds = currentBrands.map(b => b.brandUserId);
      
      // Convert new brandIds to Set for efficient lookups
      const newBrandIdsSet = new Set(brandIds || []);
      const currentBrandIdsSet = new Set(currentBrandIds);
      
      // Determine which brands to add (in new list but not in current)
      const brandsToAdd = brandIds.filter(id => !currentBrandIdsSet.has(id));
      
      // Determine which brands to remove (in current list but not in new)
      const brandsToRemove = currentBrandIds.filter(id => !newBrandIdsSet.has(id));
      
      console.log('Brand sync - Current:', currentBrandIds);
      console.log('Brand sync - New:', brandIds);
      console.log('Brand sync - To Add:', brandsToAdd);
      console.log('Brand sync - To Remove:', brandsToRemove);
      
      // Remove brands that are no longer in the list
      for (const brandId of brandsToRemove) {
        await removeCMSUserBrandEntry(userId, brandId);
      }
      
      // Add new brands
      for (const brandId of brandsToAdd) {
        await createCMSUserBrandEntry(userId, brandId, requestingUserEmail || 'System');
      }
      
      finalBrandIds = brandIds || [];
    } else {
      // If brandIds not provided, keep existing brands
      const currentBrands = await getUserBrands(userId);
      finalBrandIds = currentBrands.map(b => b.brandUserId);
    }

    // Step 6: Return success response with updated user data
    return {
      statusCode: 200,
      success: true,
      message: 'User updated successfully',
      updatedUser: {
        id: userId,
        email: email || targetUser.email,
        role: role || targetUser.role,
        isActive: isActive !== undefined ? isActive : targetUser.isActive,
        brands: finalBrandIds
      }
    };

  } catch (error) {
    console.error('Error in UpdateCMSUser:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to update CMS user',
      updatedUser: null
    };
  }
};

// ---------------------------------------------------------------------------
// WHI-112: Admin password reset + user access removal
// These operations are backed by this same Lambda and dispatched on fieldName,
// so no new function/CFN stack or IAM role is introduced.
// ---------------------------------------------------------------------------

/**
 * Generates a Cognito-policy-compliant temporary password (lower/upper/number/symbol).
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
 * Resolves the CMS base URL for login links (mirrors CreateCMSUser).
 */
const getCmsBaseUrl = () => {
  if (process.env.CMS_URL) {
    return process.env.CMS_URL;
  }
  if (process.env.ENV === 'prod') {
    return 'https://cms-prod.d1qp1ad0zi25cp.amplifyapp.com';
  }
  return 'https://main.d1qp1ad0zi25cp.amplifyapp.com';
};

let postmarkClient = null;

const getPostmarkClient = async () => {
  if (!postmarkClient) {
    const parameterName = `/amplify/${process.env.ENV}/POSTMARK_SERVER_TOKEN`;
    const parameter = await ssm
      .getParameter({ Name: parameterName, WithDecryption: true })
      .promise();
    postmarkClient = new postmark.ServerClient(parameter.Parameter.Value);
  }
  return postmarkClient;
};

/**
 * Emails a user their newly re-issued temporary password.
 */
const sendPasswordResetEmail = async (email, temporaryPassword) => {
  const loginUrl = `${getCmsBaseUrl()}/login`;

  const emailBodyText = `Whiskey Social CMS - Password Reset

An administrator has reset your Whiskey Social CMS password.

Sign in here: ${loginUrl}

Your account details:
Email: ${email}
Temporary Password: ${temporaryPassword}

You will be prompted to set a new password when you sign in. This temporary password is for one-time use.

If you didn't expect this, please contact your administrator.`;

  const htmlBody = `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #1a1a1a; line-height: 1.6;">
    <div style="max-width: 560px; margin: 0 auto; padding: 24px;">
      <h2 style="margin-bottom: 8px;">Whiskey Social CMS</h2>
      <p>An administrator has reset your Whiskey Social CMS password.</p>
      <p style="margin: 24px 0;">
        <a href="${loginUrl}" style="background:#8b5a2b;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;">Sign in to the CMS</a>
      </p>
      <p><strong>Email:</strong> ${email}<br />
         <strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
      <p>You will be prompted to set a new password when you sign in. This temporary password is for one-time use.</p>
      <p style="color:#888;font-size:12px;">If you didn't expect this, please contact your administrator.</p>
    </div>
  </body>
</html>`;

  const message = {
    From: 'Whiskey Social <pours@whiskeysocial.app>',
    To: email,
    Subject: '[WS CMS] Your password has been reset',
    TextBody: emailBodyText,
    HtmlBody: htmlBody,
    MessageStream: 'outbound',
  };

  const client = await getPostmarkClient();
  return client.sendEmail(message);
};

/**
 * True if the requesting user shares at least one brand with the target user.
 */
const sharesBrandWith = async (requestingUserSub, targetUserId) => {
  const [requestingBrands, targetBrands] = await Promise.all([
    getUserBrands(requestingUserSub),
    getUserBrands(targetUserId),
  ]);
  const targetBrandIds = new Set(targetBrands.map((b) => b.brandUserId));
  return requestingBrands.some((b) => targetBrandIds.has(b.brandUserId));
};

/**
 * Deletes every CMSUserBrand association for a given CMS user.
 * @returns {number} count of associations removed
 */
const deleteAllUserBrandEntries = async (cmsUserId) => {
  const brands = await getUserBrands(cmsUserId);
  for (const brand of brands) {
    await dynamodb
      .delete({ TableName: CMS_USER_BRAND_TABLE, Key: { id: brand.id } })
      .promise();
  }
  return brands.length;
};

/**
 * Handles the resetCMSUserPassword mutation.
 * Re-issues a temporary password (Permanent: false forces a change on next login),
 * which also clears the "temporary password has expired" lockout, then emails it.
 */
const handleResetPassword = async (event) => {
  const iss = event.identity?.issuer || event.identity?.claims?.iss;
  const userPoolId = iss?.split('/').pop();
  const requestingUserSub = event.identity?.sub;
  const cognitoGroups = event.identity?.claims?.['cognito:groups'] || [];
  const { userId } = event.arguments;

  try {
    if (!userId) {
      return { statusCode: 400, success: false, message: 'User ID is required' };
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return { statusCode: 404, success: false, message: 'User not found' };
    }

    // Permission: Admins may reset anyone; BrandOwners only users on a shared brand.
    const isAdmin = cognitoGroups.includes('Admin');
    const isBrandOwner = cognitoGroups.includes('BrandOwner');
    if (!isAdmin) {
      if (!isBrandOwner || !(await sharesBrandWith(requestingUserSub, userId))) {
        return {
          statusCode: 403,
          success: false,
          message: 'You do not have permission to reset this user\'s password',
        };
      }
    }

    const temporaryPassword = generateTemporaryPassword();
    await cognito
      .adminSetUserPassword({
        UserPoolId: userPoolId,
        Username: targetUser.email,
        Password: temporaryPassword,
        Permanent: false,
      })
      .promise();
    console.log(`Reset temporary password for ${targetUser.email}`);

    // Re-enable the account if it had been disabled, so the reset is actionable.
    try {
      await cognito
        .adminEnableUser({ UserPoolId: userPoolId, Username: targetUser.email })
        .promise();
    } catch (enableError) {
      console.log('adminEnableUser (non-fatal):', enableError.message);
    }

    let emailSent = true;
    try {
      await sendPasswordResetEmail(targetUser.email, temporaryPassword);
      console.log('Password reset email sent');
    } catch (emailError) {
      // Password was reset successfully; surface that the email failed so the
      // admin knows to relay it manually rather than silently succeeding.
      emailSent = false;
      console.error('Error sending password reset email:', emailError);
    }

    return {
      statusCode: 200,
      success: true,
      message: emailSent
        ? `A temporary password was emailed to ${targetUser.email}.`
        : `Password was reset, but the notification email to ${targetUser.email} failed to send. Please contact them directly.`,
    };
  } catch (error) {
    console.error('Error in resetCMSUserPassword:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to reset password',
    };
  }
};

/**
 * Handles the deleteCMSUserWithAuth mutation.
 * Removes the CMSUserBrand associations, the CMSUser record, and the Cognito
 * user — fully revoking CMS access.
 */
const handleDelete = async (event) => {
  const iss = event.identity?.issuer || event.identity?.claims?.iss;
  const userPoolId = iss?.split('/').pop();
  const requestingUserSub = event.identity?.sub;
  const cognitoGroups = event.identity?.claims?.['cognito:groups'] || [];
  const { userId } = event.arguments;

  try {
    if (!userId) {
      return { statusCode: 400, success: false, message: 'User ID is required' };
    }

    // Only Admins can delete/revoke access (destructive, security-sensitive).
    if (!cognitoGroups.includes('Admin')) {
      return {
        statusCode: 403,
        success: false,
        message: 'Only Admins can delete CMS users',
      };
    }

    // Guard against self-deletion (would lock the admin out mid-session).
    if (requestingUserSub === userId) {
      return {
        statusCode: 403,
        success: false,
        message: 'You cannot delete your own account',
      };
    }

    const targetUser = await getUserById(userId);
    if (!targetUser) {
      return { statusCode: 404, success: false, message: 'User not found' };
    }

    // 1) Remove brand associations.
    const removedBrands = await deleteAllUserBrandEntries(userId);
    console.log(`Removed ${removedBrands} brand association(s) for ${userId}`);

    // 2) Remove the CMSUser record.
    await dynamodb
      .delete({ TableName: CMS_USERS_TABLE, Key: { id: userId } })
      .promise();
    console.log(`Deleted CMSUser record ${userId}`);

    // 3) Remove the Cognito user (idempotent — tolerate an already-deleted user).
    try {
      await cognito
        .adminDeleteUser({ UserPoolId: userPoolId, Username: targetUser.email })
        .promise();
      console.log(`Deleted Cognito user ${targetUser.email}`);
    } catch (cognitoError) {
      if (cognitoError.code === 'UserNotFoundException') {
        console.log('Cognito user already absent, continuing.');
      } else {
        throw cognitoError;
      }
    }

    return {
      statusCode: 200,
      success: true,
      message: `User ${targetUser.email} was deleted and access revoked.`,
      deletedUserId: userId,
    };
  } catch (error) {
    console.error('Error in deleteCMSUserWithAuth:', error);
    return {
      statusCode: 500,
      success: false,
      message: error.message || 'Failed to delete CMS user',
      deletedUserId: null,
    };
  }
};

/**
 * Entry point. Routes to the correct handler based on the GraphQL field invoked.
 */
exports.handler = async (event) => {
  switch (event.fieldName) {
    case 'resetCMSUserPassword':
      return handleResetPassword(event);
    case 'deleteCMSUserWithAuth':
      return handleDelete(event);
    case 'updateCMSUserWithAuth':
    default:
      return handleUpdate(event);
  }
};