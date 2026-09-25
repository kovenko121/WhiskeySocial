/* Amplify Params - DO NOT EDIT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

const {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminLinkProviderForUserCommand,
} = require('@aws-sdk/client-cognito-identity-provider');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');

const cognito = new CognitoIdentityProviderClient({});
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const PENDING_LINK_TABLE = `signin-pendinglink-whiskeysocial-${process.env.ENV}`;
const PENDING_LINK_TTL_MS = 30 * 60 * 1000;

const REVIEW_ACCOUNT_EMAIL = 'taylor+apple@devlandia.net';

const PROVIDERS = [
  { prefix: 'google_', method: 'GOOGLE', providerName: 'Google' },
  { prefix: 'signinwithapple_', method: 'APPLE', providerName: 'SignInWithApple' },
];

const providerFor = (username) => {
  const lower = String(username || '').toLowerCase();
  return PROVIDERS.find(({ prefix }) => lower.startsWith(prefix)) || null;
};

const subjectFor = (username) => {
  const separator = String(username || '').indexOf('_');
  return separator === -1 ? '' : String(username).slice(separator + 1);
};

const emailFor = (event) =>
  String(event.request?.userAttributes?.email || '').trim().toLowerCase();

const providerVouchesForEmail = (event) =>
  String(event.request?.userAttributes?.email_verified || '').toLowerCase() === 'true';

const listUsersByEmail = async (userPoolId, email) => {
  const result = await cognito.send(
    new ListUsersCommand({
      UserPoolId: userPoolId,
      Filter: `email = "${email}"`,
      Limit: 60,
    })
  );

  return result.Users || [];
};

const destinationFor = (user) => {
  const provider = providerFor(user.Username);

  if (!provider) {
    return {
      ProviderName: 'Cognito',
      ProviderAttributeValue: user.Username,
    };
  }

  return {
    ProviderName: provider.providerName,
    ProviderAttributeName: 'Cognito_Subject',
    ProviderAttributeValue: subjectFor(user.Username),
  };
};

const linkProviderToUser = async (userPoolId, destinationUser, provider, subject) => {
  await cognito.send(
    new AdminLinkProviderForUserCommand({
      UserPoolId: userPoolId,
      DestinationUser: destinationFor(destinationUser),
      SourceUser: {
        ProviderName: provider.providerName,
        ProviderAttributeName: 'Cognito_Subject',
        ProviderAttributeValue: subject,
      },
    })
  );
};

const pickDestination = (users) => {
  const native = users.find((user) => !providerFor(user.Username));

  if (native) {
    return native;
  }

  return users
    .slice()
    .sort((a, b) => new Date(a.UserCreateDate) - new Date(b.UserCreateDate))[0];
};

const storePendingLink = async (email, provider, subject) => {
  try {
    await docClient.send(
      new PutCommand({
        TableName: PENDING_LINK_TABLE,
        Item: {
          email,
          providerName: provider.providerName,
          providerSubject: subject,
          ttl: Math.floor((Date.now() + PENDING_LINK_TTL_MS) / 1000),
        },
      })
    );
  } catch (error) {
    console.error('Pending link store failed:', error);
  }
};

const handleFederated = async (event) => {
  const email = emailFor(event);
  const provider = providerFor(event.userName);
  const subject = subjectFor(event.userName);

  if (!email || !provider || !subject) {
    console.log('metric=skipped reason=incomplete-identity');
    return event;
  }

  const users = await listUsersByEmail(event.userPoolId, email);

  const alreadyHasThisProvider = users.some(
    (user) => providerFor(user.Username)?.method === provider.method
  );

  if (alreadyHasThisProvider) {
    console.log(`metric=allowed reason=repeat-login provider=${provider.method}`);
    return event;
  }

  const destination = pickDestination(users);

  if (!destination) {
    console.log(`metric=allowed reason=new-person provider=${provider.method}`);
    return event;
  }

  const destinationIsNative = !providerFor(destination.Username);

  if (!providerVouchesForEmail(event)) {
    if (!destinationIsNative) {
      console.log(`metric=allowed reason=unverified-no-native provider=${provider.method}`);
      return event;
    }

    await storePendingLink(email, provider, subject);
    console.log(`metric=bounced reason=email-unverified provider=${provider.method}`);
    throw new Error(`WHI259_VERIFY_EMAIL:${provider.method}`);
  }

  await linkProviderToUser(event.userPoolId, destination, provider, subject);

  const direction = destinationIsNative ? 'native-first' : 'provider-first';
  console.log(`metric=linked direction=${direction} provider=${provider.method}`);

  event.response.autoConfirmUser = true;
  event.response.autoVerifyEmail = true;

  return event;
};

const handleNative = async (event) => {
  const email = emailFor(event);

  if (!email) {
    return event;
  }

  const users = await listUsersByEmail(event.userPoolId, email);
  const existingProvider = users
    .map((user) => providerFor(user.Username))
    .find(Boolean);

  if (!existingProvider) {
    console.log('metric=allowed reason=new-person direction=native');
    return event;
  }

  console.log(`metric=blocked direction=provider-first provider=${existingProvider.method}`);

  throw new Error(`WHI259_USE_PROVIDER:${existingProvider.method}`);
};

const DELIBERATE_REJECTION = /^WHI259_/;

exports.handler = async (event) => {
  if (event.triggerSource === 'PreSignUp_AdminCreateUser') {
    return event;
  }

  if (emailFor(event) === REVIEW_ACCOUNT_EMAIL) {
    return event;
  }

  try {
    if (event.triggerSource === 'PreSignUp_ExternalProvider') {
      return await handleFederated(event);
    }

    if (event.triggerSource === 'PreSignUp_SignUp') {
      return await handleNative(event);
    }
  } catch (error) {
    if (DELIBERATE_REJECTION.test(error.message || '')) {
      throw error;
    }

    console.error('metric=failed-open reason=unexpected-error', error);
    return event;
  }

  return event;
};
