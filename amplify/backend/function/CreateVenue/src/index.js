/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const db = new AWS.DynamoDB.DocumentClient();
const cognito = new AWS.CognitoIdentityServiceProvider();

const {
  STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
  API_WHISKEYSOCIAL_USERTABLE_NAME,
  AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
  GOOGLE_MAPS_API_KEY,
  TOKEN,
} = process.env;

const createUserCognito = async () => {
  const id = uuidv4();

  const data = await cognito
    .adminCreateUser({
      UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
      Username: `${id}@whiskeysocial.app`,
      UserAttributes: [
        {
          Name: 'email',
          Value: `${id}@whiskeysocial.app`,
        },
        {
          Name: 'custom:onboarding',
          Value: 'true',
        },
      ],
    })
    .promise();

  console.log(data.User);

  await updateUserEmail(data.User.Username);

  return data.User;
};

const updateUserEmail = async (id) => {
  try {
    await cognito
      .adminUpdateUserAttributes({
        UserPoolId: AUTH_WHISKEYSOCIAL1F41304E_USERPOOLID,
        Username: id,
        UserAttributes: [
          {
            Name: 'email',
            Value: `${id}@whiskeysocial.app`,
          },
          {
            Name: 'email_verified',
            Value: 'true',
          },
        ],
      })
      .promise();
  } catch (error) {
    console.error('ERROR', error);
  }
};

const createUserDynamo = async (
  id,
  {
    geoPoint,
    username,
    venueName,
    venuePhone,
    venueAddressStreet,
    venueAddressCity,
    venueAddressState,
    venueAddressNumber,
    venueAddressCountry,
    venueWebsite,
    bio,
    profilePicture,
    coverPicture,
    externalId,
  }
) => {
  const user = {
    id,
    username: username.toLowerCase().trim(),
    venueName: venueName.trim(),
    venueSearchName: venueName.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('&', 'ëéèê')
    .toLowerCase()
    .trim(),
    venueAddressGeo: geoPoint,
    venuePhone: `+1 ${venuePhone.trim()}`,
    venueAddressStreet,
    venueAddressCountry,
    venueAddressCity,
    venueAddressState,
    venueAddressNumber,
    ...(venueWebsite && { venueWebsite }),
    externalId,
    bio,
    deleted: false,
    archived: false,
    toBeRedeemed: true,
    userType: 'VENUE',
    owner: id,
    isMyCollectionPublic: true,
    profilePicture: profilePicture || {
      bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
      region: 'us-east-2',
      key: 'new_venue.png',
    },
    coverPicture,
    securitySettings: [
      {
        name: 'seePosts',
        description: '',
        value: 'Public',
      },
      {
        name: 'commentPosts',
        description: '',
        value: 'Public',
      },
      {
        name: 'commentPhotos',
        description: '',
        value: 'Public',
      },
      {
        name: 'location',
        description: '',
        value: 'true',
      },
      {
        name: 'seeLocation',
        description: '',
        value: 'Public',
      },
    ],
    notificationSettings: [
      {
        name: 'friends',
        description:
          'Allows you to customize how you receive notifications when someone follows you.',
        value: 'true',
      },
      {
        name: 'activities',
        description:
          'Allows you to receive notifications when a new activity is available on your feed.',
        value: 'true',
      },
      {
        name: 'clubs',
        description:
          'Allows you to receive notifications for club activity and updates.',
        value: 'true',
      },
    ],
    _typename: 'User',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db
    .put({
      TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
      Item: user,
    })
    .promise();

  return user;
};

const getGeoPoint = async (address) => {
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${address}&key=${GOOGLE_MAPS_API_KEY}`
  );
  const data = await response.json();

  if (data.status !== 'OK') throw new Error('Invalid address', data);

  const { lat, lng: lon } = data.results[0].geometry.location;

  return {
    lat,
    lon,
  };
};

const checkUsernameUniqueness = async (username) => {
  if (!username) throw new Error('Username is required');

  const paramsUsername = {
    TableName: API_WHISKEYSOCIAL_USERTABLE_NAME,
    IndexName: 'byUsername',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': username,
    },
  };

  const result = await db.query(paramsUsername).promise();

  if (result.Count > 0) throw new Error('Username already exists');

  return result.Count === 0;
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

    await checkUsernameUniqueness(input.username.toLowerCase().trim());

    const geoPoint = await getGeoPoint(
      `${input.venueAddressStreet},${input.venueAddressNumber},${input.venueAddressCity},${input.venueAddressState}`
    );

    console.log('GEOPOINT', geoPoint);

    const { Username: id } = await createUserCognito();

    const user = await createUserDynamo(id, { ...input, geoPoint });
    return user;
  } catch (error) {
    console.log('ERROR', error);

    throw error;
  }
};
