/* Amplify Params - DO NOT EDIT
API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
API_WHISKEYSOCIAL_USERTABLE_ARN
API_WHISKEYSOCIAL_USERTABLE_NAME
AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
ENV
REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const crypto = require('crypto');
const cognito = new AWS.CognitoIdentityServiceProvider();

const {
  SECRET,
  AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  TOKEN,
} = process.env;

const changeCognitoEmail = async ({ id, email }) => {
  const data = await cognito
    .adminUpdateUserAttributes({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: `${id}@whiskeysocial.app`,
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

  return data.User;
};

const updateCognitoPassword = async ({ email }) => {
  const hash = crypto.createHash('sha512');
  hash.update(`${SECRET} ${email}`);
  const password = hash.digest('hex').slice(98);

  const data = await cognito
    .adminSetUserPassword({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: email,
      Password: password,
      Permanent: true,
    })
    .promise();

  return data.User;
};

const updateUserTable = async (id) => {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
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

const checkIfEmailAlreadyExists = async(email) => {
  const data = await cognito
    .listUsers({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Filter: `email = "${email}"`,
    })
    .promise();

  if (data.Users.length > 0)
    throw new Error('Email already exists');
}

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  try {
    if (event.arguments.token !== TOKEN)
      throw new Error('Unauthorized request');

    await checkIfEmailAlreadyExists(event.arguments.email);
    await changeCognitoEmail(event.arguments);
    await updateCognitoPassword(event.arguments);
    await updateUserTable(event.arguments.id);
  } catch (error) {
    console.error('ERROR', error);

    throw error;
  }
};
