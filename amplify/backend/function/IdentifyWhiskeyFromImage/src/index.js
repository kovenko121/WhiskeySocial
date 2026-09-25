/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIENDPOINTOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_GRAPHQLAPIKEYOUTPUT
	API_WHISKEYSOCIAL_WHISKEYTABLE_ARN
	API_WHISKEYSOCIAL_WHISKEYTABLE_NAME
	ENV
	REGION
	STORAGE_WHISKEYSOCIALS3_BUCKETNAME
Amplify Params - DO NOT EDIT */

const { S3Client, HeadObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { SSMClient, GetParameterCommand } = require('@aws-sdk/client-ssm');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const OpenAI = require('openai');

const s3 = new S3Client({});
const ssm = new SSMClient({});
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const BUCKET_NAME = process.env.STORAGE_WHISKEYSOCIALS3_BUCKETNAME;
const RATE_LIMIT_TABLE = `scan-ratelimit-whiskeysocial-${process.env.ENV}`;

let cachedOpenAIKey = null;

const HOUR_WINDOW_MS = 60 * 60 * 1000;
const DAY_WINDOW_MS = 24 * 60 * 60 * 1000;
const DEFAULT_HOURLY_LIMIT = 200;
const DEFAULT_DAILY_LIMIT = 500;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const MINI_CONFIDENCE_THRESHOLD = 0.7;

const WHISKEY_TYPES = [
  'BOURBON', 'RYE', 'AMERICAN', 'CANADIAN', 'IRISH', 'FLAVORED', 'JAPANESE',
  'SINGLE_MALT_SCOTCH', 'SINGLE_MALT_AMERICAN', 'BLENDED_SCOTCH_AND_WO',
  'TN_WHISKEY', 'WORLD', 'MALT', 'SCOTCH',
];

const failure = (error, message) => ({
  isWhiskeyDetected: false,
  extractedInfo: null,
  matches: [],
  rateLimitExceeded: false,
  error,
  message,
});

/**
 * @type {import('@types/aws-lambda').Handler}
 */
exports.handler = async (event) => {
  try {
    const imageKey = event?.arguments?.input?.imageKey;
    const userId = event?.identity?.sub;

    if (!userId) {
      return failure('UNAUTHENTICATED', 'Please sign in and try again.');
    }

    if (!imageKey || !imageKey.startsWith('whiskey_')) {
      return failure('INVALID_IMAGE_KEY', 'Invalid image key.');
    }

    const timings = {};
    const totalStart = Date.now();

    const rateLimits = getRateLimits();

    let stepStart = Date.now();
    const [rateLimitRecord, imageData] = await Promise.all([
      getRateLimitRecord(userId),
      fetchImageFromS3(imageKey),
    ]);
    timings.rateLimitAndS3 = Date.now() - stepStart;

    if (isRateLimitExceeded(rateLimitRecord, rateLimits)) {
      return {
        isWhiskeyDetected: false,
        extractedInfo: null,
        matches: [],
        rateLimitExceeded: true,
        error: null,
        message: "You've reached your scan limit for now. Try again in a little while.",
      };
    }

    if (imageData.error) {
      return failure(imageData.error, imageData.message);
    }

    stepStart = Date.now();
    const visionResult = await analyzeWithVision(imageData.base64, imageData.contentType);
    timings.vision = Date.now() - stepStart;

    if (visionResult.error) {
      return failure(visionResult.error, visionResult.message);
    }

    await recordScan(userId);

    timings.total = Date.now() - totalStart;

    if (!visionResult.isWhiskey) {
      console.log('TIMING:', JSON.stringify({ ...timings, model: visionResult.model || 'unknown' }));
      return {
        isWhiskeyDetected: false,
        extractedInfo: null,
        matches: [],
        rateLimitExceeded: false,
        error: null,
        message: "We couldn't detect a whiskey bottle. Try again with a clearer photo of the label.",
      };
    }

    console.log('TIMING:', JSON.stringify({ ...timings, model: visionResult.model || 'unknown' }));

    return {
      isWhiskeyDetected: true,
      extractedInfo: visionResult.extracted,
      matches: [],
      rateLimitExceeded: false,
      error: null,
      message: null,
    };
  } catch (error) {
    console.error('IdentifyWhiskeyFromImage error:', error);
    return failure(
      'UNEXPECTED_ERROR',
      'Scan temporarily unavailable — please try searching by name instead.'
    );
  }
};

// --- Rate Limiting ---

function getRateLimits() {
  return {
    hourly: asPositiveInt(process.env.SCAN_RATE_LIMIT_HOURLY_MAX) ?? DEFAULT_HOURLY_LIMIT,
    daily: asPositiveInt(process.env.SCAN_RATE_LIMIT_DAILY_MAX) ?? DEFAULT_DAILY_LIMIT,
  };
}

function asPositiveInt(value) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

async function getRateLimitRecord(userId) {
  try {
    const result = await docClient.send(
      new GetCommand({ TableName: RATE_LIMIT_TABLE, Key: { userId } })
    );
    return result.Item || null;
  } catch (error) {
    console.error('Rate limit read error:', error);
    return null;
  }
}

function isRateLimitExceeded(record, limits) {
  if (!record) return false;

  const now = Date.now();
  const hourWithin = Boolean(record.windowStart && now - record.windowStart < HOUR_WINDOW_MS);
  const dayWithin = Boolean(record.dayWindowStart && now - record.dayWindowStart < DAY_WINDOW_MS);

  return Boolean(
    (hourWithin && record.scanCount >= limits.hourly) ||
      (dayWithin && record.dayScanCount >= limits.daily)
  );
}

async function recordScan(userId) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const record = await getRateLimitRecord(userId);
    const now = Date.now();

    const hourWithin = Boolean(record && record.windowStart && now - record.windowStart < HOUR_WINDOW_MS);
    const dayWithin = Boolean(record && record.dayWindowStart && now - record.dayWindowStart < DAY_WINDOW_MS);

    const windowStart = hourWithin ? record.windowStart : now;
    const scanCount = (hourWithin ? record.scanCount : 0) + 1;
    const dayWindowStart = dayWithin ? record.dayWindowStart : now;
    const dayScanCount = (dayWithin ? record.dayScanCount : 0) + 1;
    const ttl = Math.floor(Math.max(windowStart + HOUR_WINDOW_MS, dayWindowStart + DAY_WINDOW_MS) / 1000);

    try {
      if (record) {
        await docClient.send(
          new UpdateCommand({
            TableName: RATE_LIMIT_TABLE,
            Key: { userId },
            UpdateExpression:
              'SET windowStart = :windowStart, scanCount = :scanCount, dayWindowStart = :dayWindowStart, dayScanCount = :dayScanCount, #ttl = :ttl',
            ConditionExpression:
              '(attribute_not_exists(scanCount) OR scanCount = :prevScanCount) AND (attribute_not_exists(dayScanCount) OR dayScanCount = :prevDayScanCount)',
            ExpressionAttributeNames: { '#ttl': 'ttl' },
            ExpressionAttributeValues: {
              ':windowStart': windowStart,
              ':scanCount': scanCount,
              ':dayWindowStart': dayWindowStart,
              ':dayScanCount': dayScanCount,
              ':ttl': ttl,
              ':prevScanCount': record.scanCount ?? 0,
              ':prevDayScanCount': record.dayScanCount ?? 0,
            },
          })
        );
      } else {
        await docClient.send(
          new PutCommand({
            TableName: RATE_LIMIT_TABLE,
            Item: { userId, windowStart, scanCount, dayWindowStart, dayScanCount, ttl },
            ConditionExpression: 'attribute_not_exists(userId)',
          })
        );
      }
      return;
    } catch (error) {
      if (error.name === 'ConditionalCheckFailedException' && attempt === 0) continue;
      console.error('Rate limit record error:', error);
      return;
    }
  }
}

// --- S3 Image Fetching ---

function getContentType(imageKey, s3ContentType) {
  const ext = (imageKey.split('.').pop() || '').toLowerCase();
  const mimeMap = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif' };
  return mimeMap[ext] || (s3ContentType && s3ContentType.startsWith('image/') ? s3ContentType : 'image/jpeg');
}

async function fetchImageFromS3(imageKey) {
  const Key = `public/${imageKey}`;

  try {
    const headResult = await s3.send(new HeadObjectCommand({ Bucket: BUCKET_NAME, Key }));

    if (headResult.ContentLength > MAX_IMAGE_SIZE_BYTES) {
      return {
        error: 'IMAGE_TOO_LARGE',
        message: 'Image is too large. Please use a smaller photo (under 5MB).',
      };
    }

    const getResult = await s3.send(new GetObjectCommand({ Bucket: BUCKET_NAME, Key }));
    const base64 = await getResult.Body.transformToString('base64');

    return { base64, contentType: getContentType(imageKey, getResult.ContentType), error: null };
  } catch (error) {
    console.error('S3 fetch error:', error);
    const code = error.name || error.Code;
    if (code === 'NoSuchKey' || code === 'NotFound') {
      return {
        error: 'IMAGE_NOT_FOUND',
        message: 'The uploaded image could not be found. Please try again.',
      };
    }
    return { error: 'S3_ERROR', message: 'Failed to retrieve image. Please try again.' };
  }
}

// --- OpenAI Vision ---

async function getOpenAIKey() {
  if (cachedOpenAIKey) return cachedOpenAIKey;

  const result = await ssm.send(
    new GetParameterCommand({
      Name: `/amplify/${process.env.ENV}/OPENAI_API_KEY`,
      WithDecryption: true,
    })
  );

  cachedOpenAIKey = result.Parameter.Value;
  return cachedOpenAIKey;
}

const VISION_SYSTEM_PROMPT = `You are a whiskey identification expert. You analyze bottle label images and extract structured information.

Field definitions:
- "isWhiskey": true if this is a whiskey bottle, false otherwise
- "brand": the short brand name (e.g. "Jack Daniel's", not "Jack Daniel's Distillery")
- "name": the specific product or expression name, without the brand (e.g. "Single Barrel Select", not "Jack Daniel's Single Barrel Select"). If the label only shows a brand with no distinct product name, use the spirit type (e.g., "Bourbon", "Rye Whiskey").
- "fullLabelText": all readable text from the label
- "age": age statement in whole years as a number, or null if no age statement
- "proof": proof as a number. If only ABV% is shown, multiply by 2 (e.g., 45% ABV = 90 proof).
- "type": the closest matching category, or null
- "distillery": the distillery or producer name, or null
- "origin": geographic origin (e.g., "Kentucky", "Vail, Colorado"), or null
- "confidence": how certain you are of this whole response, as a float between 0.0 and 1.0 — including the isWhiskey verdict. An image that plainly contains no whiskey bottle is a CONFIDENT answer, so report high confidence with isWhiskey false. Reserve low confidence for images you genuinely cannot read.

Important:
- If the image does not contain a whiskey bottle, return {"isWhiskey": false} with all other fields null
- "brand" and "name" must be DIFFERENT values. Do not repeat the brand in the name field.
- Write "brand" exactly as printed on the label, including any apostrophe
- If multiple bottles are visible, focus on the most prominent one`;

const LABEL_RESPONSE_FORMAT = {
  type: 'json_schema',
  json_schema: {
    name: 'whiskey_label',
    strict: true,
    schema: {
      type: 'object',
      additionalProperties: false,
      required: [
        'isWhiskey', 'brand', 'name', 'fullLabelText', 'age',
        'proof', 'type', 'distillery', 'origin', 'confidence',
      ],
      properties: {
        isWhiskey: { type: 'boolean' },
        brand: { type: ['string', 'null'] },
        name: { type: ['string', 'null'] },
        fullLabelText: { type: ['string', 'null'] },
        age: { type: ['integer', 'null'] },
        proof: { type: ['number', 'null'] },
        type: { type: ['string', 'null'], enum: [...WHISKEY_TYPES, null] },
        distillery: { type: ['string', 'null'] },
        origin: { type: ['string', 'null'] },
        confidence: { type: 'number' },
      },
    },
  },
};

async function analyzeWithVision(base64Image, contentType) {
  try {
    const apiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey, timeout: 30000, maxRetries: 0 });

    const miniResult = await callVisionModel(openai, 'gpt-4o-mini', base64Image, contentType);
    if (miniResult.error) return miniResult;

    if (miniResult.isWhiskey && miniResult.extracted.visionConfidence >= MINI_CONFIDENCE_THRESHOLD) {
      return { ...miniResult, model: 'gpt-4o-mini' };
    }

    if (!miniResult.isWhiskey && miniResult.confidence >= MINI_CONFIDENCE_THRESHOLD) {
      return { ...miniResult, model: 'gpt-4o-mini' };
    }

    console.log('ESCALATING to gpt-4o:', JSON.stringify({
      isWhiskey: !!miniResult.isWhiskey,
      confidence: miniResult.isWhiskey
        ? miniResult.extracted.visionConfidence
        : miniResult.confidence,
    }));

    const fullResult = await callVisionModel(openai, 'gpt-4o', base64Image, contentType);
    return { ...fullResult, model: 'gpt-4o' };
  } catch (error) {
    console.error('Vision API error:', error);
    return {
      error: 'VISION_API_ERROR',
      message: 'Scan temporarily unavailable — please try searching by name instead.',
    };
  }
}

async function callVisionModel(openai, model, base64Image, contentType) {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: VISION_SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Identify the whiskey in this bottle label image.' },
            { type: 'image_url', image_url: { url: `data:${contentType};base64,${base64Image}` } },
          ],
        },
      ],
      response_format: LABEL_RESPONSE_FORMAT,
      max_tokens: 500,
      temperature: 0.1,
    });

    if (response.choices?.[0]?.finish_reason === 'length') {
      return { error: 'VISION_API_TRUNCATED', message: 'Could not read the whole label. Please try again.' };
    }

    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      return { error: 'VISION_API_EMPTY', message: 'No response from image analysis.' };
    }

    const parsed = JSON.parse(content);

    if (!parsed || parsed.isWhiskey !== true) {
      const confidence = asNumber(parsed && parsed.confidence);
      return {
        isWhiskey: false,
        confidence: confidence === null ? 0 : Math.min(Math.max(confidence, 0), 1),
        error: null,
      };
    }

    return { isWhiskey: true, extracted: sanitizeExtracted(parsed), error: null };
  } catch (error) {
    console.error(`Vision model error (${model}):`, error);
    return {
      error: 'VISION_API_ERROR',
      message: 'Scan temporarily unavailable — please try searching by name instead.',
    };
  }
}

function asText(value) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function asNumber(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function asInteger(value) {
  const parsed = asNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function inRange(value, min, max) {
  return value === null || value < min || value > max ? null : value;
}

function sanitizeExtracted(parsed) {
  const type = asText(parsed.type);
  const confidence = asNumber(parsed.confidence);

  return {
    brand: asText(parsed.brand),
    name: asText(parsed.name),
    fullLabelText: asText(parsed.fullLabelText),
    age: inRange(asInteger(parsed.age), 1, 100),
    proof: inRange(asNumber(parsed.proof), 1, 200),
    type: type && WHISKEY_TYPES.includes(type) ? type : null,
    distillery: asText(parsed.distillery),
    origin: asText(parsed.origin),
    visionConfidence: confidence === null ? 0 : Math.min(Math.max(confidence, 0), 1),
  };
}
