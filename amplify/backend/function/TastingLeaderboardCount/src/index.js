/* Amplify Params - DO NOT EDIT
	API_WHISKEYSOCIAL_GRAPHQLAPIIDOUTPUT
	API_WHISKEYSOCIAL_TASTINGPOURSTATETABLE_ARN
	API_WHISKEYSOCIAL_TASTINGPOURSTATETABLE_NAME
	API_WHISKEYSOCIAL_TASTINGPOURTABLE_NAME
	API_WHISKEYSOCIAL_TASTINGLEADERBOARDCOUNTERTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * Real-time leaderboard aggregation.
 *
 * Triggered by the DynamoDB stream on the TastingPourState table. Each attendee
 * "Tasted" toggle is a stream record; we translate it into a +1 / -1 delta on
 * the event-scoped counter keyed by `${eventId}:${bottleKey}` in the
 * TastingLeaderboardCounter table. The app reads that counter (and subscribes to
 * its onUpdate) for a live "Trending Bottles Tonight" board.
 *
 * bottleKey is set on the pour at curation time (catalogue whiskeyRefId, else a
 * normalized brand+name slug) and copied onto each TastingPourState row, so the
 * same bottle poured at two booths aggregates into ONE counter row. Booth is not
 * part of the key — attribution stays on the state rows.
 */

const AWS = require('aws-sdk');

const docClient = new AWS.DynamoDB.DocumentClient();

const COUNTER_TABLE =
  process.env.API_WHISKEYSOCIAL_TASTINGLEADERBOARDCOUNTERTABLE_NAME;
const POUR_TABLE = process.env.API_WHISKEYSOCIAL_TASTINGPOURTABLE_NAME;

const isTasted = (image) => !!(image && image.tasted === true);

// Pull display fields from the pour (best-effort; the leaderboard still counts
// even if this lookup fails — name/brand just stay whatever they were).
const fetchPourDisplay = async (pourId) => {
  if (!pourId || !POUR_TABLE) return {};
  try {
    const res = await docClient
      .get({ TableName: POUR_TABLE, Key: { id: pourId } })
      .promise();
    if (!res.Item) return {};
    return {
      bottleName: res.Item.name,
      brand: res.Item.brand,
      whiskeyRefId: res.Item.whiskeyRefId,
    };
  } catch (err) {
    console.error('Pour lookup failed', pourId, err);
    return {};
  }
};

exports.handler = async (event) => {
  for (const record of event.Records) {
    const oldImage = record.dynamodb.OldImage
      ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.OldImage)
      : null;
    const newImage = record.dynamodb.NewImage
      ? AWS.DynamoDB.Converter.unmarshall(record.dynamodb.NewImage)
      : null;

    const before = isTasted(oldImage);
    const after = isTasted(newImage);

    let delta = 0;
    if (!before && after) delta = 1;
    else if (before && !after) delta = -1;
    if (delta === 0) continue; // no tasted transition — nothing to count

    const source = newImage || oldImage;
    const eventId = source.eventId;
    const bottleKey = source.bottleKey;
    if (!eventId || !bottleKey) {
      console.warn('State row missing eventId/bottleKey', source);
      continue;
    }

    const counterId = `${eventId}:${bottleKey}`;
    const display = await fetchPourDisplay(source.pourId);
    const now = new Date().toISOString();

    const names = { '#count': 'count', '#updatedAt': 'updatedAt' };
    const values = {
      ':delta': delta,
      ':zero': 0,
      ':updatedAt': now,
      ':eventId': eventId,
      ':bottleKey': bottleKey,
    };
    let setExpr =
      '#count = if_not_exists(#count, :zero) + :delta, #updatedAt = :updatedAt, eventId = :eventId, bottleKey = :bottleKey';

    if (display.bottleName !== undefined) {
      setExpr += ', bottleName = :bottleName';
      values[':bottleName'] = display.bottleName;
    }
    if (display.brand !== undefined) {
      setExpr += ', brand = :brand';
      values[':brand'] = display.brand;
    }
    if (display.whiskeyRefId !== undefined) {
      setExpr += ', whiskeyRefId = :whiskeyRefId';
      values[':whiskeyRefId'] = display.whiskeyRefId;
    }

    try {
      await docClient
        .update({
          TableName: COUNTER_TABLE,
          Key: { id: counterId },
          UpdateExpression: `SET ${setExpr}`,
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
        })
        .promise();
    } catch (err) {
      console.error('Counter update failed', counterId, err);
      throw err; // let the stream retry
    }
  }

  return { statusCode: 200, body: 'ok' };
};
