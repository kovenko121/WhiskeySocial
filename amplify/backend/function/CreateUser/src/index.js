/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_USERTABLE_ARN
	API_WHISKEYSOCIAL_USERTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const checkUsernameUniqueness = async (username) => {
  const paramsUsername = {
    TableName: process.env.API_WHISKEYSOCIAL_USERTABLE_NAME,
    IndexName: 'byUsername',
    KeyConditionExpression: 'username = :username',
    ExpressionAttributeValues: {
      ':username': username,
    },
  };

  const result = await docClient.query(paramsUsername).promise();
  return result.Count === 0;
};

const MIN_USERNAME_LENGTH = 3;
const MAX_USERNAME_LENGTH = 20;
const MAX_SEQUENTIAL_USERNAME_ATTEMPTS = 99;
const MAX_RANDOM_USERNAME_ATTEMPTS = 5;

const normalizeNamePart = (value) =>
  (value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const composeUsername = (first, last, budget) => {
  if (!first) return last.slice(0, budget);
  if (!last) return first.slice(0, budget);

  if (first.length + 1 + last.length <= budget) return `${first}.${last}`;

  const lastBudget = budget - first.length - 1;
  if (lastBudget >= 1) return `${first}.${last.slice(0, lastBudget)}`;

  const firstBudget = budget - 2;
  if (firstBudget >= 1) return `${first.slice(0, firstBudget)}.${last.slice(0, 1)}`;

  return first.slice(0, budget);
};

const buildUsernameCandidate = (firstName, lastName, suffix) => {
  const budget = MAX_USERNAME_LENGTH - suffix.length;
  const base = composeUsername(
    normalizeNamePart(firstName),
    normalizeNamePart(lastName),
    budget
  );
  const usable = base.length >= MIN_USERNAME_LENGTH ? base : `${base}user`;

  return `${usable.slice(0, budget)}${suffix}`;
};

const generateUsername = async (firstName, lastName) => {
  for (let attempt = 0; attempt <= MAX_SEQUENTIAL_USERNAME_ATTEMPTS; attempt += 1) {
    const candidate = buildUsernameCandidate(
      firstName,
      lastName,
      attempt === 0 ? '' : String(attempt)
    );

    if (await checkUsernameUniqueness(candidate)) return candidate;
  }

  for (let attempt = 0; attempt < MAX_RANDOM_USERNAME_ATTEMPTS; attempt += 1) {
    const candidate = buildUsernameCandidate(
      firstName,
      lastName,
      String(Math.floor(Math.random() * 9000) + 1000)
    );

    if (await checkUsernameUniqueness(candidate)) return candidate;
  }

  throw new Error('could not assign a username');
};

const saveUser = async (args) => {
  const {
    id,
    username: rawUsername,
    firstName,
    lastName,
    venueName,
    phone,
    street,
    city,
    state,
    number,
    userType,
    geoPoint,
    venueMenu,
    brandName,
    brandDescription,
    brandWebsite,
    brandCountry,
    brandFoundedYear,
    brandStory,
  } = args;

  // Normalize so the uniqueness check and the stored value are always
  // case-insensitive and trimmed. The byUsername GSI is case-sensitive, so
  // without this "Aaron" and "aaron" would be treated as different usernames.
  const providedUsername = (rawUsername || '').trim().toLowerCase();

  if (providedUsername) {
    const isUnique = await checkUsernameUniqueness(providedUsername);
    if (!isUnique) {
      throw new Error('username already taken');
    }
  }

  const username =
    providedUsername || (await generateUsername(firstName, lastName));

  let typeSpecificFields = {};
  
  if (userType === 'PERSON') {
    typeSpecificFields = {
      personFirstName: firstName?.trim() || '',
      personLastName: lastName?.trim() || '',
      personFullName: `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replaceAll('&', 'ëéèê')
        .toLowerCase()
        .trim(),
    };
  } else if (userType === 'VENUE') {
    typeSpecificFields = {
      venueAddressGeo: geoPoint,
      venueName: venueName?.trim() || '',
      venueSearchName: (venueName || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replaceAll('&', 'ëéèê')
        .toLowerCase()
        .trim(),
      venuePhone: phone?.trim() || '',
      venueAddressStreet: street?.trim() || '',
      venueAddressCity: city?.trim() || '',
      venueAddressState: state?.trim() || '',
      venueAddressNumber: number?.trim() || '',
      venueMenu,
    };
  } else if (userType === 'BRAND') {
    // Handle BRAND type with proper brand fields
    const name = brandName || venueName || username; // Fallback for compatibility
    typeSpecificFields = {
      brandName: name?.trim() || '',
      brandSearchName: (name || '')
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .replaceAll('&', 'ëéèê')
        .toLowerCase()
        .trim(),
      ...(brandDescription && { brandDescription: brandDescription.trim() }),
      ...(brandWebsite && { brandWebsite: brandWebsite.trim() }),
      ...(brandCountry && { brandCountry: brandCountry.trim() }),
      ...(brandFoundedYear && { brandFoundedYear }),
      ...(brandStory && { brandStory: brandStory.trim() }),
    };
  }

  const params = {
    Item: {
      id,
      username,
      userType,
      deleted: false,
      owner: id,
      ...typeSpecificFields,
      isMyCollectionPublic: true,
      profilePicture: {
        bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
        region: 'us-east-2',
        key: userType === 'PERSON' ? 'new_user.png' : userType === 'VENUE' ? 'new_venue.png' : 'new_brand.png',
      },
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
    },
    TableName: process.env.API_WHISKEYSOCIAL_USERTABLE_NAME,
  };

  return docClient.put(params).promise();
};

exports.handler = async (event) => {
  console.log(event.arguments);
  try {
    await saveUser(event.arguments);
    return event.arguments.id;
  } catch (err) {
    console.log(err);
    throw new Error(err.message);
  }
};
