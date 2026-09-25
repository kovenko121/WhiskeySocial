/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');

const db = new AWS.DynamoDB.DocumentClient();

const { API_WHISKEYSOCIAL_USERTABLE_NAME, GOOGLE_MAPS_API_KEY, TOKEN } =
  process.env;

const updateUserDynamo = async (id, { geoPoint, ...props }) => {
  const user = {
    id,
    ...props,
    venueSearchName: props.venueName.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replaceAll('&', 'ëéèê')
    .toLowerCase()
    .trim(),
    venueAddressGeo: geoPoint,
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

    delete input.token;

    const venue = await checkIfIsAVenue(input.id);

    if (
      input.venueAddressStreet ||
      input.venueAddressNumber ||
      input.venueAddressCity ||
      input.venueAddressState
    ) {
      const geoPoint = await getGeoPoint(
        `${input.venueAddressStreet || venue.venueAddressStreet},${
          input.venueAddressNumber || venue.venueAddressNumber
        },${input.venueAddressCity || venue.venueAddressCity},${
          input.venueAddressState || venue.venueAddressState
        }`
      );
      console.log('GEOPOINT', geoPoint);

      input.geoPoint = geoPoint;
    }

    if (input.venuePhone && !input.venuePhone.startsWith('+1')) {
      input.venuePhone = `+1 ${input.venuePhone}`;
    }

    const user = await updateUserDynamo(input.id, { ...venue, ...input });
    return user;
  } catch (error) {
    console.log('ERROR', error);

    throw error;
  }
};
