/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_REWARDTABLE_ARN
	API_WHISKEYSOCIAL_REWARDTABLE_NAME
	API_WHISKEYSOCIAL_USERREWARDTABLE_ARN
	API_WHISKEYSOCIAL_USERREWARDTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk')
const docClient = new AWS.DynamoDB.DocumentClient()

const { API_WHISKEYSOCIAL_USERREWARDTABLE_NAME, API_WHISKEYSOCIAL_REWARDTABLE_NAME } = process.env

const getNotCompletedUserRewards = async (userId) => {
  const thresholdDate = new Date()
  thresholdDate.setHours(0, 0, 0, 0)
  const thresholdTimestamp = thresholdDate.toISOString()

  const params = {
    TableName: API_WHISKEYSOCIAL_USERREWARDTABLE_NAME,
    IndexName: 'byUser',
    KeyConditionExpression: 'userId = :value',
    FilterExpression: 'isCompleted = :isCompleted AND lastScoreUpdate < :thresholdTimestamp',
    ExpressionAttributeValues: {
      ':value': userId,
      ':isCompleted': false,
      ':thresholdTimestamp': thresholdTimestamp,
    },
    ProjectionExpression: 'id, rewardId, score',
  }

  const { Items } = await docClient.query(params).promise()
  return Items
}

const getRewardConditions = async (rewardId) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_REWARDTABLE_NAME,
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ':id': rewardId,
    },
  }

  const { Items } = await docClient.query(params).promise()
  return Items[0]
}

const incrementUserRewardScore = async (id, isCompleted) => {
  const params = {
    TableName: API_WHISKEYSOCIAL_USERREWARDTABLE_NAME,
    Key: {
      id,
    },
    UpdateExpression:
      'set #score = if_not_exists(#score, :initial) + :increment, lastScoreUpdate = :currentDate, isCompleted = :isCompleted',
    ExpressionAttributeNames: {
      '#score': 'score',
    },
    ExpressionAttributeValues: {
      ':increment': 1,
      ':initial': 0,
      ':currentDate': new Date().toISOString(),
      ':isCompleted': isCompleted,
    },
  }

  return docClient.update(params).promise()
}

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  for (const record of event.Records) {
    if (!record.dynamodb.NewImage) {
      return Promise.resolve('No new image')
    }

    const type = record.dynamodb.NewImage.__typename.S.toLowerCase()
    const userId = type === 'post' ? record.dynamodb.NewImage.authorId.S : record.dynamodb.NewImage.userId.S
    const key = type === 'post' && record.dynamodb.NewImage?.locationId?.S ? 'checkin' : type

    const userRewards = await getNotCompletedUserRewards(userId)

    console.log(`Key: ${key}`)
    console.log(`User rewards: ${JSON.stringify(userRewards)}`)

    await Promise.all(
      userRewards.map(async (userReward) => {
        const reward = await getRewardConditions(userReward.rewardId)

        if (reward.isAvailable && reward.conditions[0].key === key) {
          const updatedUserRewardScore = Number(userReward.score) + 1
          const isCompleted = Number(reward.conditions[0].value) <= updatedUserRewardScore

          await incrementUserRewardScore(userReward.id, isCompleted)
        }
      })
    )
  }
  return Promise.resolve('Successfully processed DynamoDB record')
}
