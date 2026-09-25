/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_ARN
	API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME
	API_WHISKEYSOCIAL_CLUBTABLE_ARN
	API_WHISKEYSOCIAL_CLUBTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_POSTTABLE_ARN
	API_WHISKEYSOCIAL_POSTTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * Lambda: DeleteClubPostsAdmin
 * Created: 2025-12-03
 * Purpose: Allow club admins to delete ANY post in their club
 * Trigger: GraphQL mutation deleteClubPostAdmin(postId: ID!)
 *
 * Authorization:
 * - Caller must be an admin (CLUBADMINROLE or CLUBOWNERROLE) of the club the post belongs to
 * - Post must exist and have a clubId
 *
 * Note: Authors deleting their OWN posts should use the standard deletePost mutation.
 * This Lambda is specifically for admins moderating other users' content.
 */

const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB.DocumentClient();

const POST_TABLE = process.env.API_WHISKEYSOCIAL_POSTTABLE_NAME;
const CLUB_TABLE = process.env.API_WHISKEYSOCIAL_CLUBTABLE_NAME;
const CLUBMEMBER_TABLE = process.env.API_WHISKEYSOCIAL_CLUBMEMBERTABLE_NAME;

/**
 * @type {import('@types/aws-lambda').AppSyncResolverHandler}
 */
exports.handler = async (event) => {
  console.log('=== DeleteClubPostsAdmin Lambda Triggered ===');
  console.log('Event:', JSON.stringify(event, null, 2));

  const { postId } = event.arguments;
  const callerId = event.identity?.sub || event.identity?.claims?.sub;

  if (!postId) {
    return {
      success: false,
      postId: null,
      message: 'postId is required',
    };
  }

  if (!callerId) {
    return {
      success: false,
      postId: null,
      message: 'Unauthorized: No caller identity',
    };
  }

  try {
    // 1. Fetch the post to get its clubId
    const postResult = await dynamodb
      .get({
        TableName: POST_TABLE,
        Key: { id: postId },
      })
      .promise();

    const post = postResult.Item;

    if (!post) {
      return {
        success: false,
        postId,
        message: 'Post not found',
      };
    }

    if (!post.clubId) {
      return {
        success: false,
        postId,
        message: 'This post does not belong to a club',
      };
    }

    const clubId = post.clubId;

    // 2. Check if caller is an admin of this club
    const memberResult = await dynamodb
      .query({
        TableName: CLUBMEMBER_TABLE,
        IndexName: 'byClubClubMember',
        KeyConditionExpression: 'clubId = :clubId AND userId = :userId',
        ExpressionAttributeValues: {
          ':clubId': clubId,
          ':userId': callerId,
        },
      })
      .promise();

    const membership = memberResult.Items?.[0];
    const isActiveAdmin =
      membership &&
      membership.status === 'ACTIVE' &&
      (membership.role === 'CLUBADMINROLE' || membership.role === 'CLUBOWNERROLE');

    if (!isActiveAdmin) {
      console.log(`User ${callerId} is not an active admin of club ${clubId}`);
      return {
        success: false,
        postId,
        message: 'Unauthorized: You must be an active club admin to delete this post',
      };
    }

    console.log(`User ${callerId} authorized as ${membership.role} of club ${clubId}`);

    // 3. Delete the post
    await dynamodb
      .delete({
        TableName: POST_TABLE,
        Key: { id: postId },
      })
      .promise();

    console.log(`Post ${postId} deleted successfully`);

    // 4. If this post was pinned, clear the pinnedPostId on the club
    const clubResult = await dynamodb
      .get({
        TableName: CLUB_TABLE,
        Key: { id: clubId },
      })
      .promise();

    if (clubResult.Item?.pinnedPostId === postId) {
      await dynamodb
        .update({
          TableName: CLUB_TABLE,
          Key: { id: clubId },
          UpdateExpression: 'REMOVE pinnedPostId',
        })
        .promise();
      console.log(`Cleared pinnedPostId on club ${clubId}`);
    }

    return {
      success: true,
      postId,
      message: 'Post deleted successfully',
    };
  } catch (error) {
    console.error('Error deleting post:', error);
    // Return generic message to client, detailed error is logged server-side
    return {
      success: false,
      postId,
      message: 'Failed to delete post. Please try again.',
    };
  }
};
