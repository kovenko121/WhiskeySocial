/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_COMMENTTABLE_ARN
	API_WHISKEYSOCIAL_COMMENTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */const AWS = require('aws-sdk');

const fetchComments = async (docClient, postId) => {
  const fetchCommentsParams = {
    TableName: process.env.API_WHISKEYSOCIAL_COMMENTTABLE_NAME,
    IndexName: 'byPost',
    KeyConditionExpression: 'postId = :value',
    ExpressionAttributeValues: {
      ':value': postId,
    },
    ProjectionExpression: 'id',
  };
  const comments = await docClient.query(fetchCommentsParams).promise();
  return comments.Items;
};

const fetchLikes = async (docClient, postId) => {
  const fetchLikesParams = {
    TableName: process.env.API_WHISKEYSOCIAL_USERLIKESTABLE_NAME,
    IndexName: 'byPost',
    KeyConditionExpression: 'postId = :value',
    ExpressionAttributeValues: {
      ':value': postId,
    },
    ProjectionExpression: 'id',
  };
  const likes = await docClient.query(fetchLikesParams).promise();
  return likes.Items;
};

const cleanUp = async (docClient, comments, likes) => {
  const request = {
    RequestItems: {},
  };

  if (comments.length > 0) {
    request.RequestItems[process.env.API_WHISKEYSOCIAL_COMMENTTABLE_NAME] =
      comments.map((comment) => ({
        DeleteRequest: {
          Key: {
            id: comment.id,
          },
        },
      }));
  }

  if (likes.length > 0) {
    request.RequestItems[
      process.env.API_WHISKEYSOCIAL_USERLIKESTABLE_NAME
    ] = likes.map((like) => ({
      DeleteRequest: {
        Key: {
          id: like.id,
        },
      },
    }));
  }

  if (Object.keys(request.RequestItems).length === 0) {
    return Promise.resolve('No items to delete');
  }

  const batchReturn = await docClient.batchWrite(request).promise();
  console.log(batchReturn);

  return Promise.resolve('Successfully deleted items');
}


exports.handler = async (event) => {
  const docClient = new AWS.DynamoDB.DocumentClient({
    apiVersion: '2012-08-10',
  });
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    try {
      const postId = record.dynamodb.Keys.id.S;
      const comments = await fetchComments(docClient, postId);
      const likes = await fetchLikes(docClient, postId);
     
      return cleanUp(docClient, comments, likes); 
    } catch (err) {
      console.log(err);
      return Promise.resolve('An error occured');
    }
  }
};
