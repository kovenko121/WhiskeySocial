/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_ARN
	API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_NAME
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_ARN
	API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();
const { v4: uuidv4 } = require('uuid');

const {
  API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_NAME,
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME,
} = process.env;

const createTrendingWhiskey = async (userId, whiskeyId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_NAME,
    Item: {
      id: uuidv4(),
      userId,
      whiskeyId,
      count: 1,
    },
  };

  return docClient.put(params).promise();
};

const incrementTrendingWhiskey = async (id) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_NAME,
    Key: {
      id,
    },
    UpdateExpression:
      'SET #count = if_not_exists(#count, :initial) + :increment',
    ExpressionAttributeNames: {
      '#count': 'count',
    },
    ExpressionAttributeValues: {
      ':increment': 1,
      ':initial': 0,
    },
  };

  return docClient.update(params).promise();
};

const fetchTrendingWhiskey = async (userId, whiskeyId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTRENDINGWHISKEYSTABLE_NAME,
    FilterExpression: 'userId = :userId AND whiskeyId = :whiskeyId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':whiskeyId': whiskeyId,
    },
  };

  const result = await docClient.scan(params).promise();
  return result.Items[0] || null;
};

const createOrUpdateTrendingWhiskey = async (userId, whiskeyId) => {
  const trendingWhiskey = await fetchTrendingWhiskey(userId, whiskeyId);
  if (trendingWhiskey) {
    return incrementTrendingWhiskey(trendingWhiskey.id);
  }
  return createTrendingWhiskey(userId, whiskeyId);
};

const updateCheckinsCount = async (userId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: {
      id: userId,
    },
    UpdateExpression:
      'set #venueCheckinsCount = if_not_exists(#venueCheckinsCount, :initial) + :increment',
    ExpressionAttributeNames: {
      '#venueCheckinsCount': 'venueCheckinsCount',
    },
    ExpressionAttributeValues: {
      ':increment': 1,
      ':initial': 0,
    },
  };

  return docClient.update(params).promise();
};

const updateTrendingWhiskeyCountByPost = async (locationId, references) => {
  await updateCheckinsCount(locationId);

  const whiskeyReference = references.find(
    (reference) => reference.type === 'WHISKEY'
  );

  if (whiskeyReference) {
    await createOrUpdateTrendingWhiskey(locationId, whiskeyReference.id);
  }

  return Promise.resolve('Successfully updated items');
};

const getUser = async (userId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    Key: {
      id: userId,
    },
  };

  const result = await docClient.get(params).promise();
  return result.Item || null;
};

const getUsers = async (userIds) => {
  if (!userIds || userIds.length === 0) {
    return [];
  }

  // DynamoDB BatchGetItem has a limit of 100 items per request
  const batchSize = 100;
  const allUsers = [];

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const params = {
      RequestItems: {
        [API_WHISKEYSOCIAL_USERTABLE_NAME]: {
          Keys: batch.map((id) => ({ id })),
        },
      },
    };

    const result = await docClient.batchGet(params).promise();
    const users = result.Responses?.[API_WHISKEYSOCIAL_USERTABLE_NAME] || [];
    allUsers.push(...users);
  }

  return allUsers;
};

const getAuthorDisplayName = (author) => {
  if (author.userType === 'VENUE') {
    return author.venueName || 'A venue';
  }
  if (author.userType === 'BRAND') {
    return author.brandName || 'A brand';
  }
  if (author.personFirstName && author.personLastName) {
    return `${author.personFirstName} ${author.personLastName}`;
  }
  return author.username || 'Someone';
};

const createNotification = async (notification) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_NOTIFICATIONTABLE_NAME,
    Item: {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __typename: 'Notification',
      ...notification,
      owner: notification.userId,
    },
  };

  return docClient.put(params).promise();
};

const handleInlineTagNotifications = async (postId, authorId, inlineTags) => {
  if (!inlineTags || inlineTags.length === 0) {
    return;
  }

  console.log(`Processing ${inlineTags.length} inline tags for post ${postId}`);

  // Get unique entity IDs (avoid duplicate notifications)
  const uniqueEntityIds = [...new Set(inlineTags.map((tag) => tag.entityId))];

  // Filter out the author (don't notify if they tag themselves)
  const entityIdsToNotify = uniqueEntityIds.filter((id) => id !== authorId);

  if (entityIdsToNotify.length === 0) {
    return;
  }

  // Batch fetch author and all tagged users in one call
  const allUserIds = [authorId, ...entityIdsToNotify];
  const users = await getUsers(allUserIds);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const author = usersById.get(authorId);
  if (!author) {
    console.log('Author not found');
    return;
  }

  const authorName = getAuthorDisplayName(author);
  const message = `${authorName} tagged you in a post`;

  for (const entityId of entityIdsToNotify) {
    try {
      const taggedEntity = usersById.get(entityId);
      if (!taggedEntity) {
        console.log(`Tagged entity ${entityId} not found`);
        continue;
      }

      await createNotification({
        userId: entityId,
        message,
        link: `whiskeysocial://post/${postId}`,
        relatedUserId: authorId,
        type: 'ACTIVITY',
      });

      console.log(`Created notification for tagged entity ${entityId}`);
    } catch (error) {
      console.log(`Error creating notification for entity ${entityId}:`, error);
    }
  }
};

const handleReferenceTagNotifications = async (postId, authorId, references, inlineTagEntityIds = []) => {
  // Filter for USER type references only (Tag People)
  const userReferences = references.filter((ref) => ref.type === 'USER');

  if (!userReferences || userReferences.length === 0) {
    return;
  }

  console.log(`Processing ${userReferences.length} reference tags for post ${postId}`);

  // Get unique user IDs from references
  const uniqueUserIds = [...new Set(userReferences.map((ref) => ref.id))];

  // Filter out the author and any users already notified via inline tags
  const userIdsToNotify = uniqueUserIds.filter(
    (id) => id !== authorId && !inlineTagEntityIds.includes(id)
  );

  if (userIdsToNotify.length === 0) {
    return;
  }

  // Batch fetch author and all tagged users in one call
  const allUserIds = [authorId, ...userIdsToNotify];
  const users = await getUsers(allUserIds);
  const usersById = new Map(users.map((user) => [user.id, user]));

  const author = usersById.get(authorId);
  if (!author) {
    console.log('Author not found');
    return;
  }

  const authorName = getAuthorDisplayName(author);
  const message = `${authorName} tagged you in a post`;

  for (const userId of userIdsToNotify) {
    try {
      const taggedUser = usersById.get(userId);
      if (!taggedUser) {
        console.log(`Tagged user ${userId} not found`);
        continue;
      }

      await createNotification({
        userId,
        message,
        link: `whiskeysocial://post/${postId}`,
        relatedUserId: authorId,
        type: 'ACTIVITY',
      });

      console.log(`Created notification for reference-tagged user ${userId}`);
    } catch (error) {
      console.log(`Error creating notification for user ${userId}:`, error);
    }
  }
};

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    try {
      const newImage = record.dynamodb.NewImage;
      const locationId = newImage.locationId?.S;
      const postId = newImage.id?.S;
      const authorId = newImage.authorId?.S;

      const references = newImage.references?.L?.map((item) => ({
        id: item.M?.id?.S,
        type: item.M?.type?.S,
      })).filter((ref) => ref.id && ref.type) || [];

      // Handle trending whiskey updates
      if (locationId) {
        await updateTrendingWhiskeyCountByPost(locationId, references);
      }

      // Handle inline tag notifications
      let inlineTagEntityIds = [];
      if (postId && authorId && newImage.inlineTags?.L) {
        const inlineTags = newImage.inlineTags.L
          .map((tag) => {
            // Extract values from DynamoDB format
            const id = tag.M.id?.S;
            const type = tag.M.type?.S;
            const entityId = tag.M.entityId?.S;
            const text = tag.M.text?.S;
            const startIndex = tag.M.startIndex?.N ? parseInt(tag.M.startIndex.N, 10) : null;
            const endIndex = tag.M.endIndex?.N ? parseInt(tag.M.endIndex.N, 10) : null;

            // Validate required fields
            if (!id || !type || !entityId || !text || startIndex === null || endIndex === null) {
              console.log('Skipping malformed inline tag:', {
                id,
                type,
                entityId,
                text,
                startIndex,
                endIndex,
              });
              return null;
            }

            return {
              id,
              type,
              entityId,
              text,
              startIndex,
              endIndex,
            };
          })
          .filter((tag) => tag !== null);

        if (inlineTags.length > 0) {
          await handleInlineTagNotifications(postId, authorId, inlineTags);
          // Collect USER entity IDs to avoid duplicate notifications from reference tags
          inlineTagEntityIds = inlineTags
            .filter((tag) => tag.type === 'USER')
            .map((tag) => tag.entityId);
        }
      }

      // Handle reference tag notifications (Tag People button)
      if (postId && authorId && references.length > 0) {
        await handleReferenceTagNotifications(postId, authorId, references, inlineTagEntityIds);
      }
    } catch (err) {
      console.error('Error processing record:', err);
      throw err;
    }
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
