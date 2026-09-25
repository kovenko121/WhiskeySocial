/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const AWS = require('aws-sdk')
const csv = require('csv-parser')
const { v4: uuidv4 } = require('uuid')

const MAX_ROWS = 200
const MAX_FILE_SIZE = 1 * 1024 * 1024 // 1MB

const normalize = (str) =>
  (str || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeFullName = (brand, name) => normalize(`${brand} ${name}`)

const getCSVFromS3 = async (fileKey) => {
  const s3 = new AWS.S3()

  const headData = await s3
    .headObject({
      Bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
      Key: fileKey,
    })
    .promise()

  if (headData.ContentLength > MAX_FILE_SIZE) {
    throw new Error('File exceeds maximum size of 1MB')
  }

  const rows = []
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME,
      Key: fileKey,
    })
      .createReadStream()
      .pipe(csv())
      .on('data', (row) => {
        if (rows.length < MAX_ROWS) {
          rows.push(row)
        }
      })
      .on('end', () => resolve(rows))
      .on('error', reject)
  })
}

const scanWhiskeyTable = async (docClient) => {
  const whiskeyMap = new Map()
  let lastKey = undefined

  do {
    const params = {
      TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
      // `#name`/`#brand` are reserved words in DynamoDB, alias them.
      ProjectionExpression: 'id, fullName, #name, #brand',
      ExpressionAttributeNames: { '#name': 'name', '#brand': 'brand' },
    }
    if (lastKey) params.ExclusiveStartKey = lastKey

    const result = await docClient.scan(params).promise()
    result.Items.forEach((item) => {
      // Index by the stored fullName when present.
      if (item.fullName) {
        whiskeyMap.set(normalize(item.fullName), item)
      }
      // Also index by the brand+name composite so canonical CMS records remain
      // matchable even when `fullName` is empty — otherwise the importer mints a
      // thin duplicate that match exact-fullName-only could never find (WHI-114).
      if (item.brand && item.name) {
        const composite = normalizeFullName(item.brand, item.name)
        if (!whiskeyMap.has(composite)) {
          whiskeyMap.set(composite, item)
        }
      }
    })
    lastKey = result.LastEvaluatedKey
  } while (lastKey)

  return whiskeyMap
}

exports.handler = async (event) => {
  const userId = event.identity?.sub
  // Amplify @auth(allow: owner) stores the Cognito username as the `owner` field
  const owner = event.identity?.username || userId
  if (!userId) throw new Error('Unauthenticated')

  const { fileKey } = event.arguments
  const docClient = new AWS.DynamoDB.DocumentClient()

  let rows
  try {
    rows = await getCSVFromS3(fileKey)
  } catch (err) {
    throw new Error(`Failed to read file: ${err.message}`)
  }

  if (rows.length === 0) {
    return { successCount: 0, errors: [{ row: 0, message: 'File is empty or has no data rows' }] }
  }

  const whiskeyMap = await scanWhiskeyTable(docClient)

  const errors = []
  let successCount = 0
  const now = new Date().toISOString()

  for (let i = 0; i < rows.length; i++) {
    const rowNum = i + 1
    const row = rows[i]

    const brand = (row.brand || '').trim()
    const bottleName = (row.bottle_name || '').trim()

    if (!brand) {
      errors.push({ row: rowNum, message: 'Missing required field: brand' })
      continue
    }
    if (!bottleName) {
      errors.push({ row: rowNum, message: 'Missing required field: bottle_name' })
      continue
    }

    const yearStr = (row.year || '').trim()
    if (yearStr && isNaN(parseInt(yearStr, 10))) {
      errors.push({ row: rowNum, message: `Invalid year: "${yearStr}"` })
      continue
    }

    const proofStr = (row.proof || '').trim()
    const proof = proofStr ? parseFloat(proofStr) : undefined
    if (proofStr && isNaN(proof)) {
      errors.push({ row: rowNum, message: `Invalid proof: "${proofStr}"` })
      continue
    }

    const fullName = normalizeFullName(brand, bottleName)
    const matchedWhiskey = whiskeyMap.get(fullName)

    let whiskeyId

    if (matchedWhiskey) {
      whiskeyId = matchedWhiskey.id
    } else {
      const newWhiskeyId = uuidv4()
      const newWhiskey = {
        id: newWhiskeyId,
        name: bottleName,
        brand,
        fullName,
        userSubmitted: true,
        createdAt: now,
        updatedAt: now,
      }

      try {
        await docClient
          .put({
            TableName: process.env.API_WHISKEYSOCIAL_WHISKEYTABLE_NAME,
            Item: newWhiskey,
          })
          .promise()
      } catch (err) {
        errors.push({ row: rowNum, message: `Failed to create whiskey entry: ${err.message}` })
        continue
      }

      whiskeyId = newWhiskeyId
      // Add to map so duplicate rows in same import reuse it
      whiskeyMap.set(fullName, { id: newWhiskeyId, fullName })
    }

    const userWhiskeyItem = {
      id: uuidv4(),
      userId,
      owner,
      whiskeyId,
      whiskeyFullName: fullName,
      createdAt: now,
      updatedAt: now,
    }

    if ((row.notes || '').trim()) userWhiskeyItem.notes = row.notes.trim()
    if (yearStr) userWhiskeyItem.purchaseYear = yearStr
    if ((row.size || '').trim()) userWhiskeyItem.bottle = row.size.trim()
    if (proof !== undefined && !isNaN(proof)) userWhiskeyItem.proof = proof

    try {
      await docClient
        .put({
          TableName: process.env.API_WHISKEYSOCIAL_USERWHISKEYSTABLE_NAME,
          Item: userWhiskeyItem,
        })
        .promise()
      successCount++
    } catch (err) {
      errors.push({ row: rowNum, message: `Failed to add to collection: ${err.message}` })
    }
  }

  return { successCount, errors }
}
