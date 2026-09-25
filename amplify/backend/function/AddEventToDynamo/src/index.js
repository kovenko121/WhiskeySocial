/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_EVENTTABLE_ARN
	API_WHISKEYSOCIAL_EVENTTABLE_NAME
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	ENV
	REGION
Amplify Params - DO NOT EDIT */

import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb'

const { API_WHISKEYSOCIAL_EVENTTABLE_NAME, REGION } = process.env

const dynamoDBClient = new DynamoDBClient({ region: REGION })

const incrementImpressions = async (id, name) => {
  const updateParams = {
    TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
    Key: {
      id: { S: id },
    },
    UpdateExpression: 'SET #campaign = :campaign, #impressions = if_not_exists(#impressions, :initial) + :increment',
    ExpressionAttributeNames: {
      '#impressions': 'impressions',
      '#campaign': 'campaign',
    },
    ExpressionAttributeValues: {
      ':increment': { N: '1' },
      ':initial': { N: '0' },
      ':campaign': { S: name },
    },
    ReturnValues: 'UPDATED_NEW',
  }

  try {
    await dynamoDBClient.send(new UpdateItemCommand(updateParams))
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      const createParams = {
        TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
        Item: {
          id: { S: id },
          campaign: { S: name },
          impressions: { N: '1' },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }

      await dynamoDBClient.send(new PutItemCommand(createParams))
    }
  }
}

const incrementClicks = async (id, name) => {
  const updateParams = {
    TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
    Key: {
      id: { S: id },
    },
    UpdateExpression: 'SET #campaign = :campaign, #interactions = if_not_exists(#interactions, :initial) + :increment',
    ExpressionAttributeNames: {
      '#interactions': 'interactions',
      '#campaign': 'campaign',
    },
    ExpressionAttributeValues: {
      ':increment': { N: '1' },
      ':initial': { N: '0' },
      ':campaign': { S: name },
    },
    ReturnValues: 'UPDATED_NEW',
  }

  try {
    await dynamoDBClient.send(new UpdateItemCommand(updateParams))
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      const createParams = {
        TableName: API_WHISKEYSOCIAL_EVENTTABLE_NAME,
        Item: {
          id: { S: id },
          campaign: { S: name },
          interactions: { N: '1' },
        },
        ConditionExpression: 'attribute_not_exists(id)',
      }

      await dynamoDBClient.send(new PutItemCommand(createParams))
    }
  }
}

export const handler = async (rawEvents) => {
  console.log(rawEvents)
  for (const rawEvent of rawEvents) {
    const buffer = Buffer.from(rawEvent.data, 'base64')

    const event = JSON.parse(buffer.toString('ascii'))

    console.log('EVENT', event, event.event_type, event.event_type !== 'clickAd' && event.event_type !== 'viewAd')

    switch (event.event_type) {
      case 'viewAd':
        await incrementImpressions(event.attributes.adId, event.attributes.adName)
        break
      case 'clickAd':
        await incrementClicks(event.attributes.adId, event.attributes.adName)
        break
      default:
        continue
    }
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify('OK'),
  }
  return response
}
