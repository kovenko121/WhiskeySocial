/* Amplify Params - DO NOT EDIT
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
} = require('@aws-sdk/lib-dynamodb');

const cognito = new CognitoIdentityProviderClient({});
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const USER_POOL_ID = process.env.AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID;
const RATE_LIMIT_TABLE = `signin-lookup-ratelimit-whiskeysocial-${process.env.ENV}`;
const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;

const EMAIL_PATTERN = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

const PROVIDER_PREFIXES = [
  ['google_', 'GOOGLE'],
  ['signinwithapple_', 'APPLE'],
];

const providerFor = (username) => {
  const lower = String(username || '').toLowerCase();
  const match = PROVIDER_PREFIXES.find(([prefix]) => lower.startsWith(prefix));
  return match ? match[1] : null;
};

const callerFor = (event, email) => {
  const headers = event.request?.headers || {};
  const forwarded = headers['x-forwarded-for'] || headers['X-Forwarded-For'] || '';
  const ip = String(forwarded).split(',')[0].trim();
  return ip || `email:${email}`;
};

const isRateLimited = async (caller) => {
  const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;

  try {
    const result = await docClient.send(
      new GetCommand({ TableName: RATE_LIMIT_TABLE, Key: { caller } })
    );

    const record = result.Item;
    return Boolean(record && record.windowStart > windowStart && record.count >= RATE_LIMIT_MAX);
  } catch (error) {
    console.error('Rate limit check failed, allowing request:', error);
    return false;
  }
};

const recordLookup = async (caller) => {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  try {
    await docClient.send(
      new UpdateCommand({
        TableName: RATE_LIMIT_TABLE,
        Key: { caller },
        UpdateExpression: 'ADD #count :one',
        ConditionExpression: 'attribute_exists(caller) AND windowStart > :windowStart',
        ExpressionAttributeNames: { '#count': 'count' },
        ExpressionAttributeValues: { ':one': 1, ':windowStart': windowStart },
      })
    );
  } catch (error) {
    if (error.name !== 'ConditionalCheckFailedException') {
      console.error('Rate limit record failed:', error);
      return;
    }

    try {
      await docClient.send(
        new PutCommand({
          TableName: RATE_LIMIT_TABLE,
          Item: {
            caller,
            count: 1,
            windowStart: now,
            ttl: Math.floor((now + RATE_LIMIT_WINDOW_MS) / 1000),
          },
        })
      );
    } catch (putError) {
      console.error('Rate limit reset failed:', putError);
    }
  }
};

const listUsersByEmail = async (email) => {
  const result = await cognito.send(
    new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Filter: `email = "${email}"`,
      Limit: 60,
    })
  );

  return result.Users || [];
};

exports.handler = async (event) => {
  const email = String(event.arguments?.email || '').trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    throw new Error('A valid email address is required');
  }

  const caller = callerFor(event, email);

  if (await isRateLimited(caller)) {
    throw new Error('RATE_LIMITED');
  }

  await recordLookup(caller);

  const users = await listUsersByEmail(email);

  const methods = [];
  let nativeUser = null;

  users.forEach((user) => {
    const provider = providerFor(user.Username);

    if (provider) {
      if (!methods.includes(provider)) {
        methods.push(provider);
      }
      return;
    }

    if (!methods.includes('EMAIL')) {
      methods.push('EMAIL');
    }
    nativeUser = user;
  });

  return {
    email,
    methods,
    hasNativeAccount: Boolean(nativeUser),
    nativeStatus: nativeUser ? nativeUser.UserStatus : null,
  };
};
