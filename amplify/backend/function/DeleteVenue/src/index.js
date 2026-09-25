/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

const {
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
  TOKEN,
} = process.env;

const deleteUserCognito = async (id) => {
  const data = await cognito
    .adminDeleteUser({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: id,
    })
    .promise();

  return data;
};

const deleteUserDynamo = async (id) => {
  await db
    .delete({
      TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
      Key: { id },
    })
    .promise();

  return;
};

const checkIfIsAVenue = async (id) => {
  const { Item } = await db
    .get({
      TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
      Key: { id },
    })
    .promise();

  if (!Item) throw new Error('User not exists');
  if (Item.userType !== 'VENUE') throw new Error('User is not a venue');

  return Item;
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);

  try {
    if (!event.arguments.input) throw new Error('No arguments provided');

    const input = event.arguments.input;

    if (input.token !== TOKEN) throw new Error('Unauthorized request');

    const user = await checkIfIsAVenue(input.id);

    await deleteUserCognito(input.id);
    await deleteUserDynamo(input.id);

    return user;
  } catch (error) {
    console.log('ERROR', error);

    throw error;
  }
};
