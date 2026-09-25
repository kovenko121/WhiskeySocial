const AWS = require('aws-sdk')
const randomstring = require('randomstring')
const docClient = new AWS.DynamoDB.DocumentClient()

const table = `2fa-whiskeysocial-${process.env.ENV}`
const ttlInSeconds = 300
const emailSender = 'noreply@whiskeysocial.app'
const emailSubject = 'confirmation code'
const emailBody = 'Your confirmation code is {code}'

const calculateTTL = () => new Date(new Date().getTime() + ttlInSeconds * 1000).getTime() / 1000

const sendEmail = async (email, code) => {
  const ses = new AWS.SES()

  const command = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Text: { Data: emailBody.replace('{code}', code) },
      },

      Subject: { Data: emailSubject },
    },
    Source: emailSender,
  }

  return ses.sendEmail(command).promise()
}
const saveCode = (email, operation, code) => {
  return new Promise((resolve, reject) => {
    const params = {
      TableName: table,
      Key: { email },
      UpdateExpression: 'SET  #code = :code, #operation = :operation, #ttl=:ttl',
      ExpressionAttributeNames: {
        '#code': 'code',
        '#ttl': 'ttl',
        '#operation': 'operation',
      },
      ExpressionAttributeValues: {
        ':code': code,
        ':ttl': calculateTTL(),
        ':operation': operation,
      },
    }

    docClient.update(params, (err) => {
      if (err) reject(err)
      else resolve(true)
    })
  })
}

exports.handler = async (event) => {
  const { email, operation } = event.arguments

  if (email === 'taylor+apple@devlandia.net') {
    return true
  }

  const code = randomstring.generate({
    length: 6,
    charset: 'numeric',
  })

  try {
    await saveCode(email, operation, code)
    await sendEmail(email, code)

    return true
  } catch (error) {
    return false
  }
}
