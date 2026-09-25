const AWS = require('aws-sdk')
const randomstring = require('randomstring')
const postmark = require('postmark')
const fs = require('fs')
const path = require('path')

const docClient = new AWS.DynamoDB.DocumentClient()
const ssm = new AWS.SSM()
const table = `2fa-whiskeysocial-${process.env.ENV}`
const ttlInSeconds = 300
const emailSender = 'Whiskey Social <pours@whiskeysocial.app>'
const emailSubject = '[WS] Login Confirmation Code'
const emailBodyText = 'Your confirmation code is {code}'
const emailBodyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>Verification Code</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    
    @media (prefers-color-scheme: dark) {
      .darkmode-bg {
        background-color: transparent !important;
      }
      .darkmode-secondary-bg {
        background-color: #1a2332 !important;
      }
    }
  </style>
</head>
<body class="darkmode-bg" style="margin: 0; padding: 0; background-color: #141c29; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" class="darkmode-bg" style="background-color: #141c29;">
    <tr>
      <td align="center" style="padding: 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width: 600px; width: 100%;">
          <!-- Header Image -->
          <tr>
            <td align="center" style="padding: 40px 20px 30px 20px;">
              <img src="{headerImageUrl}" alt="Whiskey Social" style="display: block; max-width: 100%; height: auto;" width="300">
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td align="center" style="padding: 0 40px 40px 40px;">
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <p style="margin: 0; color: #a69e6d; font-size: 18px; line-height: 1.5;">
                      Your confirmation code is:
                    </p>
                  </td>
                </tr>
                
                <!-- Verification Code -->
                <tr>
                  <td align="center" style="padding: 0 0 30px 0;">
                    <table role="presentation" cellpadding="0" cellspacing="0" class="darkmode-secondary-bg" style="background-color: #1a2332; border-radius: 8px; padding: 20px 40px;">
                      <tr>
                        <td align="center">
                          <span style="color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                            {code}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Additional Info -->
                <tr>
                  <td align="center" style="padding: 0;">
                    <p style="margin: 0; color: #a69e6d; font-size: 14px; line-height: 1.5;">
                      This code will expire in 5 minutes.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px 40px 40px 40px; border-top: 1px solid #2a3544;">
              <p style="margin: 0; color: #6b7280; font-size: 12px; line-height: 1.5;">
                If you didn't request this code, please ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`

// Initialize Postmark client variable
let postmarkClient = null

// Function to get Postmark client with SSM parameter
const getPostmarkClient = async () => {
  if (!postmarkClient) {
    try {
      const parameterName = `/amplify/${process.env.ENV}/POSTMARK_SERVER_TOKEN`
      const parameter = await ssm.getParameter({
        Name: parameterName,
        WithDecryption: true
      }).promise()
      const apiToken = parameter.Parameter.Value
      postmarkClient = new postmark.ServerClient(apiToken)
    } catch (error) {
      console.error('Error initializing Postmark client:', error)
      throw error
    }
  }
  return postmarkClient
}

// Base64 encoded ws-logo.png image loaded from file
const WS_LOGO_BASE64 = fs.readFileSync(path.join(__dirname, 'logo-base64.txt'), 'utf8').trim()

const calculateTTL = () => new Date(new Date().getTime() + ttlInSeconds * 1000).getTime() / 1000

const sendEmail = async (email, code) => {
  const message = {
    From: emailSender,
    To: email,
    Subject: emailSubject,
    TextBody: emailBodyText.replace('{code}', code),
    HtmlBody: emailBodyHtml
      .replace('{code}', code)
      .replace('{headerImageUrl}', 'cid:ws-logo'),
    MessageStream: 'outbound',
    Attachments: [{
      Name: 'ws-logo.png',
      Content: WS_LOGO_BASE64,
      ContentType: 'image/png',
      ContentID: 'ws-logo',
      ContentDisposition: 'inline'
    }]
  }

  const client = await getPostmarkClient()
  return client.sendEmail(message)
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
    console.error('Error in 2FA process:', error)
    return false
  }
}