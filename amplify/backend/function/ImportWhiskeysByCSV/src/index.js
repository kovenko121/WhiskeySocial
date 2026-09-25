/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */ const AWS = require('aws-sdk')
const csv = require('csv-parser')
const { v4: uuidv4 } = require('uuid')

const WhiskeyTypes = [
  'AMERICAN',
  'AUSTRALIAN',
  'BELGIAN',
  'BOURBON',
  'CANADIAN',
  'FLAVORED',
  'FRENCH',
  'IRISH',
  'JAPANESE',
  'LIQUEUR',
  'RYE',
  'SCOTCH',
  'SINGLE_MALT_AMERICAN',
  'FRENCH_SINGLE_MALT',
  'SINGLE_MALT_SCOTCH',
  'WHEAT',
  'WHITE',
  'WORLD',
  'TN_WHISKEY',
  'MALT',
]

const getCSVFromS3 = async (fileKey) => {
  const s3 = new AWS.S3()
  const items = []

  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
      Key: fileKey,
    })
      .createReadStream()
      .pipe(csv())
      .on('data', async (row) => {
        const id = uuidv4()

        const item = {
          id,
          name: row.name,
          description: row.description,
          distillery: row.distillery,
          origin: row.origin,
          brand: row.brand,
          picture: {
            key: id,
            bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
            region: 'us-east-2',
          },
          brandPicture: {
            key: id + '-brand',
            bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
            region: 'us-east-2',
          },
          type: [row.type.toUpperCase()],
          batch: row.batch,
          rick: row.rick,
          barrel: row.barrel,
          bottle: row.bottle,
          storePick: row.storePick,
          proof: parseFloat(row.proof || 0),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fullName: `${row.brand} ${row.name}`
            .normalize('NFD')
            .replace(/\p{Diacritic}/gu, '')
            .replaceAll('&', 'ëéèê')
            .toLowerCase()
            .trim(),
        }

        if (row.age && row.age !== 'NaN' && row.age !== 'N/A') {
          item.age = parseInt(row.age)
        }

        console.log(`Adding whiskey: ${item.fullName}`, !!row.type)

        if (!!row.type) {
          const isTypeValidArray = WhiskeyTypes.includes(row.type.toUpperCase())

          console.log('isTypeValidArray', row.type, isTypeValidArray)

          if (isTypeValidArray) {
            items.push(item)
          } else {
            console.log(`Wrong whiskey type for: ${item.fullName}`)
          }
        } else {
          console.log(`No whiskey type added for: ${item.fullName}`)
        }
      })
      .on('end', () => {
        resolve(items)
      })
      .on('error', (err) => {
        reject(err)
      })
  })
}

exports.handler = async (event) => {
  const docClient = new AWS.DynamoDB.DocumentClient()
  const s3 = new AWS.S3()

  const items = await getCSVFromS3(event.arguments.fileKey)

  await Promise.all(
    items.map(async (item) => {
      await s3
        .copyObject({
          Bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
          CopySource: `${process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME}/whiskey-placeholder.png`,
          Key: `public/${item.picture.key}`,
        })
        .promise()

      await s3
        .copyObject({
          Bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
          CopySource: `${process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME}/whiskey-brand-placeholder.png`,
          Key: `public/${item.brandPicture.key}`,
        })
        .promise()

      await docClient
        .put({
          TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
          Item: item,
        })
        .promise()
    })
  )
  return true
}
