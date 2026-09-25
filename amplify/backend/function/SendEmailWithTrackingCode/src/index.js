/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_REWARDTABLE_ARN
	API_WHISKEYSOCIAL_REWARDTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

const AWS = require('aws-sdk')
const ses = new AWS.SES()
const docClient = new AWS.DynamoDB.DocumentClient()

const emailSender = 'noreply@whiskeysocial.app'
const emailSubject = 'Exciting Update: Your Reward Has Been Shipped!'
const emailBody = `Hello {name},\n\nHere's the good stuff  – your prize: {description} is on its way to your doorstep! We're thrilled to inform you that your package has been shipped, and you can keep an eye on the horizon using the following tracking code: {trackingCode}\n\nCheers to you, and enjoy the reward once it lands. If you need anything, don't hesitate to raise a glass and give us a shout.\n\nBest regards,\n\nWhiskey Social Team`

const sendEmail = async (email, trackingCode, name, description) => {
  const command = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: {
          Data: emailBody
            .replace('{trackingCode}', trackingCode)
            .replace('{description}', description)
            .replace('{name}', name),
        },
      },

      Subject: { Data: emailSubject },
    },
    Source: emailSender,
  }

  return ses.sendEmail(command).promise()
}

const getReward = async (rewardId) => {
  const params = {
    TableName: process.env.API_WHISKEYSOCIAL_REWARDTABLE_NAME,
    Key: {
      id: rewardId,
    },
    projectionExpression: 'description',
  }

  const { Item } = await docClient.get(params).promise()

  return Item
}

exports.handler = async (event) => {
  console.log(`EVENT: ${JSON.stringify(event)}`)
  for (const record of event.Records) {
    const { fullName, email, trackingCode, rewardId } = AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)

    if (email && trackingCode) {
      console.log(`Sending email to ${email} with tracking code ${trackingCode}`)
      const { description } = await getReward(rewardId)

      await sendEmail(email, trackingCode, fullName, description)
    }
  }
  return Promise.resolve('Successfully processed DynamoDB record')
}
