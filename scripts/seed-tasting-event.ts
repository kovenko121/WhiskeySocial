#!/usr/bin/env ts-node
/**
 * Seed the Tasting Passport event roster into an environment's tables.
 *
 * Why: the app only renders a PUBLISHED event fetched from the backend. A freshly
 * deployed environment has the tables but no rows, so the app silently falls back
 * to its built-in sample and attendees would see nothing real. This writes the
 * same roster the mockup was built from, so a new environment matches the mockup
 * on day one and content can then be edited in the CMS.
 *
 * Run it AFTER `./scripts/deploy-backend.sh <env>` — the tables must exist first.
 *
 * Usage:
 *   yarn seed:tasting-event -- --env dev --dry-run
 *   yarn seed:tasting-event -- --env prod
 *
 *   --env dev|prod   Target environment. Default: dev.
 *   --dry-run        Print what would be written, touch nothing.
 *   --status <s>     DRAFT | SCHEDULED | PUBLISHED | ARCHIVED. Default: PUBLISHED.
 *   --publish-at <t> Go-live time for a SCHEDULED event (any date the JS Date
 *                    parser accepts; an ISO string with an offset is safest).
 *                    Required with --status SCHEDULED, ignored otherwise.
 *   --event-id <id>  Override the event id. Default: the mockup's id.
 *
 * Idempotent: ids are derived from the event id, so re-running updates the same
 * rows rather than creating duplicates, and preserves each row's original
 * createdAt. Safe to run after every backend deploy.
 *
 * Note this seeds the event and its booths only. The mockup carries no per-booth
 * pours, so pours are left for the CMS to author; booths with none fall back to
 * the app's sample pour list.
 */

import { DynamoDB } from 'aws-sdk';

import {
  EVENT_BOOTHS,
  EVENT_META,
  MOCK_EVENT_ID,
} from '../src/domains/TastingPassport/mock/eventSource';

type Env = 'dev' | 'prod';

// AppSync API id per environment — table names are `<Model>-<apiId>-<env>`.
const API_ID: Record<Env, string> = {
  dev: 'igiagvfkdndzfk6lxzlbtcvaue',
  prod: 'rthmlq6fi5gl3ph3ceq6qe2azq',
};

const REGION = 'us-east-2';

const arg = (flag: string): string | undefined => {
  const i = process.argv.indexOf(flag);
  return i === -1 ? undefined : process.argv[i + 1];
};

const env = (arg('--env') ?? 'dev') as Env;
const dryRun = process.argv.includes('--dry-run');
const status = arg('--status') ?? 'PUBLISHED';
const publishAtArg = arg('--publish-at');
const eventId = arg('--event-id') ?? MOCK_EVENT_ID;

if (!API_ID[env]) {
  console.error(`Invalid --env "${env}" (expected dev|prod)`);
  process.exit(1);
}

const VALID_STATUS = ['DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED'];
if (!VALID_STATUS.includes(status)) {
  console.error(`Invalid --status "${status}" (expected ${VALID_STATUS.join('|')})`);
  process.exit(1);
}

// A SCHEDULED event with no go-live time never goes live: the app reads publishAt as
// the moment it appears, and treats a missing one as "not due yet", forever.
if (publishAtArg && Number.isNaN(Date.parse(publishAtArg))) {
  console.error(`Invalid --publish-at "${publishAtArg}" (expected a parseable date)`);
  process.exit(1);
}
if (status === 'SCHEDULED' && !publishAtArg) {
  console.error('--status SCHEDULED needs --publish-at, or the event never appears');
  process.exit(1);
}

const publishAt = publishAtArg
  ? new Date(publishAtArg).toISOString()
  : undefined;
const EVENT_OPEN_HOURS = 24;

const table = (model: string) => `${model}-${API_ID[env]}-${env}`;
const EVENT_TABLE = table('TastingEvent');
const BOOTH_TABLE = table('TastingBooth');

const db = new DynamoDB.DocumentClient({ region: REGION });

/** Preserve the original createdAt on re-runs so seeding stays non-destructive. */
const existingCreatedAt = async (
  tableName: string,
  id: string
): Promise<string | undefined> => {
  const res = await db.get({ TableName: tableName, Key: { id } }).promise();
  return res.Item?.createdAt as string | undefined;
};

const boothId = (index: number) => `${eventId}-booth-${index}`;

const seed = async () => {
  const now = new Date().toISOString();

  // The mockup keeps date, time and venue in the same free-text line the CMS
  // writes, so the seeded event reads identically to a CMS-authored one.
  const description = [EVENT_META.dateLabel, EVENT_META.timeLabel, EVENT_META.venue]
    .filter(Boolean)
    .join(' · ');

  console.log(`Seeding "${EVENT_META.name}" into ${env}`);
  console.log(`  event table : ${EVENT_TABLE}`);
  console.log(`  booth table : ${BOOTH_TABLE}`);
  console.log(`  event id    : ${eventId}`);
  console.log(`  status      : ${status}`);
  if (publishAt) console.log(`  publish at  : ${publishAt}`);
  console.log(`  booths      : ${EVENT_BOOTHS.length}`);
  if (dryRun) console.log('  DRY RUN — nothing will be written\n');

  const eventItem = {
    __typename: 'TastingEvent',
    id: eventId,
    title: EVENT_META.name,
    description,
    status,
    ...(publishAt ? { publishAt } : {}),
    createdAt: (!dryRun && (await existingCreatedAt(EVENT_TABLE, eventId))) || now,
    updatedAt: now,
  };

  if (!dryRun) {
    await db.put({ TableName: EVENT_TABLE, Item: eventItem }).promise();
  }
  console.log(`\n${dryRun ? 'would write' : 'wrote'} event: ${eventItem.title}`);

  let linked = 0;
  for (let index = 0; index < EVENT_BOOTHS.length; index += 1) {
    const { name, brandUserId } = EVENT_BOOTHS[index];
    const id = boothId(index);

    const boothItem: Record<string, unknown> = {
      __typename: 'TastingBooth',
      id,
      eventId,
      name,
      order: index,
      createdAt: (!dryRun && (await existingCreatedAt(BOOTH_TABLE, id))) || now,
      updatedAt: now,
    };
    // Omit rather than write null — `brandRefId` backs a GSI, and a null would
    // be an index write for a booth that has no brand to link to.
    if (brandUserId) {
      boothItem.brandRefId = brandUserId;
      linked += 1;
    }

    if (!dryRun) {
      await db.put({ TableName: BOOTH_TABLE, Item: boothItem }).promise();
    }
    console.log(
      `  [${String(index).padStart(2, '0')}] ${name}${brandUserId ? '' : '  (no brand link)'}`
    );
  }

  console.log(
    `\n${dryRun ? 'would write' : 'wrote'} ${EVENT_BOOTHS.length} booths ` +
      `(${linked} brand-linked, ${EVENT_BOOTHS.length - linked} standalone)`
  );

  if (status === 'PUBLISHED') {
    console.log(
      '\nEvent is PUBLISHED, so the app shows it now regardless of any publish time —\n' +
        'but the `tastingPassport` feature flag still gates whether the entry point\n' +
        'renders at all.'
    );
  } else if (status === 'SCHEDULED' && publishAt) {
    const closesAt = new Date(
      Date.parse(publishAt) + EVENT_OPEN_HOURS * 60 * 60 * 1000
    ).toISOString();
    console.log(
      `\nEvent is SCHEDULED: the app shows it from ${publishAt} and stops showing it\n` +
        `at ${closesAt}, ${EVENT_OPEN_HOURS} hours later. The \`tastingPassport\` feature\n` +
        'flag still gates whether the entry point renders at all.'
    );
  } else {
    console.log(`\nEvent is ${status}; the app reads PUBLISHED and SCHEDULED events only.`);
  }
};

seed().catch((error) => {
  console.error('\nSeed failed:', error?.message ?? error);
  process.exit(1);
});
