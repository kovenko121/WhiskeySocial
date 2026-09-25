const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamodb = new AWS.DynamoDB.DocumentClient();

const POST_TABLE = process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME;
const USERLIKES_TABLE = process.env.API_WHISKEYSOCIAL_USERLIKESTABLE_NAME;

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log('Event: ', JSON.stringify(event, null, 2));

  const { userId, postId, action } = event.arguments.input;

  if (!userId || !postId || !action) {
    throw new Error('Missing required fields: userId, postId, or action');
  }

  if (!['like', 'unlike', 'sync'].includes(action)) {
    throw new Error('Invalid action. Must be "like", "unlike", or "sync"');
  }

  try {
    // Use DynamoDB transactions to ensure atomicity
    if (action === 'like') {
      return await handleLike(userId, postId);
    } else if (action === 'unlike') {
      return await handleUnlike(userId, postId);
    } else if (action === 'sync') {
      return await handleSync(postId);
    }
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

async function handleLike(userId, postId) {
  const likeId = uuidv4();
  const now = new Date().toISOString();

  const transactParams = {
    TransactItems: [
      {
        // Create the UserLike record
        Put: {
          TableName: USERLIKES_TABLE,
          Item: {
            id: likeId,
            userId,
            postId,
            createdAt: now,
            updatedAt: now,
            __typename: 'UserLikes'
          },
          ConditionExpression: 'attribute_not_exists(id)'
        }
      },
      {
        // Atomically increment the likes count on the post
        Update: {
          TableName: POST_TABLE,
          Key: { id: postId },
          UpdateExpression: 'SET likesCount = if_not_exists(likesCount, :zero) + :inc, updatedAt = :now',
          ExpressionAttributeValues: {
            ':inc': 1,
            ':zero': 0,
            ':now': now
          },
          ConditionExpression: 'attribute_exists(id)', // Ensure post exists
          ReturnValues: 'ALL_NEW'
        }
      }
    ]
  };

  try {
    // First check if user already liked this post
    const existingLike = await checkExistingLike(userId, postId);
    if (existingLike) {
      return {
        id: uuidv4(),
        success: false,
        message: 'User has already liked this post',
        postId,
        userId,
        likesCount: existingLike.likesCount,
        createdAt: now,
        updatedAt: now,
        owner: userId
      };
    }

    // Execute the transaction
    await dynamodb.transactWrite(transactParams).promise();

    // Get the updated post to return the new likes count
    const updatedPost = await getPost(postId);

    return {
      id: uuidv4(),
      success: true,
      message: 'Post liked successfully',
      postId,
      userId,
      likeId,
      likesCount: updatedPost.likesCount,
      createdAt: now,
      updatedAt: now,
      owner: userId
    };
  } catch (error) {
    console.error('Transaction error:', error);
    
    // Handle specific errors
    if (error.code === 'TransactionCanceledException') {
      // Check which condition failed
      if (error.message.includes('ConditionalCheckFailed')) {
        const post = await getPost(postId);
        if (!post) {
          throw new Error('Post not found');
        }
        // Likely duplicate like attempt
        return {
          id: uuidv4(),
          success: false,
          message: 'User has already liked this post',
          postId,
          userId,
          likesCount: post.likesCount,
          createdAt: now,
          updatedAt: now,
          owner: userId
        };
      }
    }
    
    throw error;
  }
}

async function handleUnlike(userId, postId) {
  const now = new Date().toISOString();

  try {
    // First, find the existing like
    const existingLike = await checkExistingLike(userId, postId);
    
    if (!existingLike) {
      // Get current post data to return accurate count
      const post = await getPost(postId);
      return {
        id: uuidv4(),
        success: false,
        message: 'Like not found',
        postId,
        userId,
        likesCount: post ? post.likesCount : 0,
        createdAt: now,
        updatedAt: now,
        owner: userId
      };
    }

    const transactParams = {
      TransactItems: [
        {
          // Delete the UserLike record
          Delete: {
            TableName: USERLIKES_TABLE,
            Key: { id: existingLike.id },
            ConditionExpression: 'attribute_exists(id)'
          }
        },
        {
          // Atomically decrement the likes count on the post
          Update: {
            TableName: POST_TABLE,
            Key: { id: postId },
            UpdateExpression: 'SET likesCount = if_not_exists(likesCount, :zero) - :dec, updatedAt = :now',
            ExpressionAttributeValues: {
              ':dec': 1,
              ':zero': 0,
              ':now': now
            },
            ConditionExpression: 'attribute_exists(id) AND likesCount > :zero', // Ensure post exists and likesCount doesn't go negative
            ReturnValues: 'ALL_NEW'
          }
        }
      ]
    };

    // Execute the transaction
    await dynamodb.transactWrite(transactParams).promise();

    // Get the updated post to return the new likes count
    const updatedPost = await getPost(postId);

    return {
      id: uuidv4(),
      success: true,
      message: 'Post unliked successfully',
      postId,
      userId,
      likesCount: updatedPost.likesCount,
      createdAt: now,
      updatedAt: now,
      owner: userId
    };
  } catch (error) {
    console.error('Transaction error:', error);
    
    if (error.code === 'TransactionCanceledException') {
      if (error.message.includes('ConditionalCheckFailed')) {
        const post = await getPost(postId);
        if (!post) {
          throw new Error('Post not found');
        }
        // Like was already deleted
        return {
          id: uuidv4(),
          success: false,
          message: 'Like not found',
          postId,
          userId,
          likesCount: post.likesCount,
          createdAt: now,
          updatedAt: now,
          owner: userId
        };
      }
    }
    
    throw error;
  }
}

async function checkExistingLike(userId, postId) {
  // Query the UserLikes table using GSI if available, or scan with filter
  // This assumes there's a GSI on userId-postId or we need to scan
  const params = {
    TableName: USERLIKES_TABLE,
    IndexName: 'byPost', // Name of the GSI
    KeyConditionExpression: 'postId = :postId',
    FilterExpression: 'userId = :userId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':postId': postId
    }
  };

  const result = await dynamodb.query(params).promise();
  
  if (result.Items && result.Items.length > 0) {
    // Also get the current post likes count
    const post = await getPost(postId);
    return {
      ...result.Items[0],
      likesCount: post ? post.likesCount : 0
    };
  }
  
  return null;
}

async function getPost(postId) {
  const params = {
    TableName: POST_TABLE,
    Key: { id: postId }
  };

  const result = await dynamodb.get(params).promise();
  return result.Item;
}

async function handleSync(postId) {
  const now = new Date().toISOString();

  try {
    // First, get the post to check if it exists
    const post = await getPost(postId);
    if (!post) {
      throw new Error('Post not found');
    }

    // Count actual likes for this post
    const params = {
      TableName: USERLIKES_TABLE,
      IndexName: 'byPost', // Name of the GSI
      KeyConditionExpression: 'postId = :postId',
      ExpressionAttributeValues: {
        ':postId': postId
      }
    };
    const result = await dynamodb.query(params).promise();
    const actualLikesCount = result.Items ? result.Items.length : 0;

    // Update the post with the correct likes count
    const updateParams = {
      TableName: POST_TABLE,
      Key: { id: postId },
      UpdateExpression: 'SET likesCount = :count, updatedAt = :now',
      ExpressionAttributeValues: {
        ':count': actualLikesCount,
        ':now': now
      },
      ConditionExpression: 'attribute_exists(id)', // Ensure post exists
      ReturnValues: 'ALL_NEW'
    };

    await dynamodb.update(updateParams).promise();

    return {
      id: uuidv4(),
      success: true,
      message: `Post likes count synchronized successfully`,
      postId,
      userId: 'system-sync-user',
      likesCount: actualLikesCount,
      createdAt: now,
      updatedAt: now,
      owner: 'system-sync'
    };
  } catch (error) {
    console.error('Sync error:', error);
    
    if (error.message === 'Post not found') {
      return {
        id: uuidv4(),
        success: false,
        message: 'Post not found',
        postId,
        userId: 'system-sync-user',
        likesCount: 0,
        createdAt: now,
        updatedAt: now,
        owner: 'system-sync'
      };
    }
    
    throw error;
  }
}