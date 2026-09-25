/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GUIDETAGSTABLE_ARN
	API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk');
const docClient = new AWS.DynamoDB.DocumentClient();

const {
  API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME,
  API_WHISKEYSOCIAL_USERFAVORITEGUIDESTABLE_NAME,
} = process.env;

const incrementGuidesTagsCount = async (id) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME,
    Key: {
      id,
    },
    UpdateExpression:
      'set #count = if_not_exists(#count, :initial) + :increment',
    ExpressionAttributeNames: {
      '#count': 'count',
    },
    ExpressionAttributeValues: {
      ':increment': 1,
      ':initial': 0,
    },
  };

  await docClient.update(params).promise();
};

const findGuidesTagsByName = async (name) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME,
    FilterExpression: '#name = :name',
    ExpressionAttributeNames: {
      '#name': 'name',
    },
    ExpressionAttributeValues: {
      ':name': name,
    },
  };

  const { Items } = await docClient.scan(params).promise();

  return Items;
};

const createGuidesTags = async (name) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME,
    Item: {
      id: name,
      name,
      count: 1,
    },
  };

  await docClient.put(params).promise();
};

const onCreateGuide = async (tagName) => {
  const foundGuidesTags = await findGuidesTagsByName(tagName);

  if (foundGuidesTags.length === 0) {
    await createGuidesTags(tagName);
  } else {
    await incrementGuidesTagsCount(foundGuidesTags[0].id);
  }
};

const deleteAllUserFavoritesGuides = async (guideId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERFAVORITEGUIDESTABLE_NAME,
    FilterExpression: '#guidesId = :guidesId',
    ExpressionAttributeNames: {
      '#guidesId': 'guidesId',
    },
    ExpressionAttributeValues: {
      ':guidesId': guideId,
    },
  };

  const { Items } = await docClient.scan(params).promise();

  if (Items.length !== 0) {
    const batchWriteParams = {
      RequestItems: {
        [API_WHISKEYSOCIAL_USERFAVORITEGUIDESTABLE_NAME]: Items.map(
          ({ id }) => ({
            DeleteRequest: {
              Key: {
                id,
              },
            },
          })
        ),
      },
    };

    await docClient.batchWrite(batchWriteParams).promise();
  }
};

const onDeleteGuide = async (tagName) => {
  const foundGuidesTags = await findGuidesTagsByName(tagName);

  if (foundGuidesTags.length === 0) {
    return;
  } else {
    await decrementGuidesTagsCount(foundGuidesTags[0].id);
  }
};

const decrementGuidesTagsCount = async (id) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_GUIDETAGSTABLE_NAME,
    Key: {
      id,
    },
    UpdateExpression:
      'set #count = if_not_exists(#count, :initial) - :decrement',
    ExpressionAttributeNames: {
      '#count': 'count',
    },
    ExpressionAttributeValues: {
      ':decrement': 1,
      ':initial': 0,
    },
  };

  await docClient.update(params).promise();
};

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`);
  for (const record of event.Records) {
    const oldTagName = record.dynamodb.OldImage?.tag?.S.toLowerCase() || '';
    const newTagName = record.dynamodb.NewImage?.tag?.S.toLowerCase() || '';
    const guideId = record.dynamodb.Keys.id.S;

    switch (record.eventName) {
      case 'INSERT':
        newTagName && (await onCreateGuide(newTagName));
        break;
      case 'REMOVE':
        oldTagName && (await onDeleteGuide(oldTagName));
        await deleteAllUserFavoritesGuides(guideId);
        break;
      case 'MODIFY':
        if (oldTagName !== newTagName) {
          oldTagName && (await onDeleteGuide(oldTagName));
          newTagName && (await onCreateGuide(newTagName));
        }
        break;
      default:
        break;
    }
  }
  return Promise.resolve('Successfully processed DynamoDB record');
};
