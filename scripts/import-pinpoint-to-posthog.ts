#!/usr/bin/env ts-node

/**
 * WHI-92: Pinpoint Jan–Apr historical data → PostHog
 *
 * Imports WS_Pinpoint_Combined_Jan-Mar2026.csv into PostHog as daily
 * aggregate snapshot events, labeled cohort "historical-pinpoint".
 *
 * Usage:
 *   POSTHOG_API_KEY=phc_xxx ts-node scripts/import-pinpoint-to-posthog.ts ./WS_Pinpoint_Combined_Jan-Mar2026.csv
 *
 * Optional env vars:
 *   POSTHOG_HOST  — defaults to app.posthog.com (EU: eu.posthog.com)
 *   DRY_RUN=true  — parse and log without sending to PostHog
 *
 * --- Schema mapping (Pinpoint column → PostHog property) ---
 *   Date                     → timestamp (UTC midnight)
 *   7-day retention rate     → retention_7day_pct
 *   Authentication failures  → auth_failures
 *   Daily active endpoints   → daily_active_endpoints
 *   Daily active users       → dau
 *   Monthly active endpoints → monthly_active_endpoints
 *   Monthly active users     → mau
 *   New endpoints            → new_endpoints
 *   New users                → new_users
 *   Sessions                 → sessions
 *   Sessions per endpoint    → sessions_per_endpoint
 *   Sessions per user        → sessions_per_user
 *   Sign-ins                 → sign_ins
 *   Sign-ups                 → sign_ups
 *   Sticky factor            → sticky_factor
 *
 * --- WHI-92 metric coverage ---
 *   ✓ DAU                  → dau
 *   ✓ MAU                  → mau
 *   ✓ New users / sign-ups → new_users, sign_ups
 *   ✓ Total sessions       → sessions (sum across range)
 *   ✓ Retention D7         → retention_7day_pct
 *   ✗ Total check-ins      → not in Pinpoint export (app-specific event)
 *   ✗ WAU                  → not exported by Pinpoint
 *   ✗ Push opt-in rate     → not in Pinpoint export
 *   ✗ Retention D30        → not in Pinpoint export
 *   ✗ Top 10 venues        → not in Pinpoint export
 *   ✗ Top 10 bottles       → not in Pinpoint export
 *   Missing metrics above require a separate DynamoDB/AppSync export.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const POSTHOG_API_KEY = process.env.POSTHOG_API_KEY ?? 'phc_RZUSQ8DUqrwlZIvjE7po5Ci35xonswG6qRKBgVj3fhU';
const POSTHOG_HOST = process.env.POSTHOG_HOST ?? 'app.posthog.com';
const DRY_RUN = process.env.DRY_RUN === 'true';
const BATCH_SIZE = 50;
const COHORT_LABEL = 'historical-pinpoint';
const EVENT_NAME = 'pinpoint_daily_snapshot';
const DISTINCT_ID = 'historical-pinpoint-import';

const SCHEMA_MAP: Record<string, string> = {
  '7-day retention rate': 'retention_7day_pct',
  'Authentication failures': 'auth_failures',
  'Daily active endpoints': 'daily_active_endpoints',
  'Daily active users': 'dau',
  'Monthly active endpoints': 'monthly_active_endpoints',
  'Monthly active users': 'mau',
  'New endpoints': 'new_endpoints',
  'New users': 'new_users',
  'Sessions': 'sessions',
  'Sessions per endpoint': 'sessions_per_endpoint',
  'Sessions per user': 'sessions_per_user',
  'Sign-ins': 'sign_ins',
  'Sign-ups': 'sign_ups',
  'Sticky factor': 'sticky_factor',
};

interface PostHogEvent {
  event: string;
  distinct_id: string;
  timestamp: string;
  properties: Record<string, string | number>;
}

function parseCSV(filePath: string): PostHogEvent[] {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());

  const events: PostHogEvent[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx]?.trim() ?? '';
    });

    const date = row.Date;
    if (!date) continue;

    const properties: Record<string, string | number> = {
      cohort: COHORT_LABEL,
      source: 'pinpoint',
      date,
    };

    for (const [csvCol, posthogKey] of Object.entries(SCHEMA_MAP)) {
      const raw = row[csvCol];
      if (raw !== undefined && raw !== '') {
        properties[posthogKey] = parseFloat(raw);
      }
    }

    events.push({
      event: EVENT_NAME,
      distinct_id: DISTINCT_ID,
      timestamp: `${date}T00:00:00Z`,
      properties,
    });
  }

  return events;
}

function postBatch(batch: PostHogEvent[]): void {
  const body = JSON.stringify({ api_key: POSTHOG_API_KEY, batch });
  const result = execSync(
    `curl -s -w "\\n%{http_code}" -X POST https://${POSTHOG_HOST}/batch/ -H "Content-Type: application/json" -d @-`,
    { input: body, encoding: 'utf-8' },
  );
  const lines = result.trim().split('\n');
  const status = parseInt(lines[lines.length - 1], 10);
  if (status >= 400) {
    throw new Error(`PostHog API error ${status}: ${lines.slice(0, -1).join('\n')}`);
  }
}

function printSummaryStats(events: PostHogEvent[]): void {
  const totalSignups = events.reduce(
    (sum, e) => sum + ((e.properties.sign_ups as number) ?? 0),
    0,
  );
  const totalSessions = events.reduce(
    (sum, e) => sum + ((e.properties.sessions as number) ?? 0),
    0,
  );
  const totalNewUsers = events.reduce(
    (sum, e) => sum + ((e.properties.new_users as number) ?? 0),
    0,
  );
  const avgDAU =
    events.reduce((sum, e) => sum + ((e.properties.dau as number) ?? 0), 0) /
    events.length;
  const lastMAU = events[events.length - 1]?.properties.mau as number;

  console.log('\nAggregate totals across import range:');
  console.log(`  Total sign-ups:  ${totalSignups}`);
  console.log(`  Total new users: ${totalNewUsers}`);
  console.log(`  Total sessions:  ${totalSessions}`);
  console.log(`  Avg DAU:         ${avgDAU.toFixed(0)}`);
  console.log(`  Final MAU:       ${lastMAU}`);
}

async function main() {
  if (!DRY_RUN && !POSTHOG_API_KEY) {
    console.error('Error: POSTHOG_API_KEY environment variable is required');
    console.error(
      'Usage: POSTHOG_API_KEY=phc_xxx ts-node scripts/import-pinpoint-to-posthog.ts <path-to-csv>',
    );
    process.exit(1);
  }

  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error(
      'Usage: POSTHOG_API_KEY=phc_xxx ts-node scripts/import-pinpoint-to-posthog.ts <path-to-csv>',
    );
    process.exit(1);
  }

  const absolutePath = path.resolve(csvPath);
  if (!fs.existsSync(absolutePath)) {
    console.error(`File not found: ${absolutePath}`);
    process.exit(1);
  }

  console.log(`Parsing ${absolutePath}...`);
  const events = parseCSV(absolutePath);

  const firstDate = events[0]?.timestamp?.slice(0, 10);
  const lastDate = events[events.length - 1]?.timestamp?.slice(0, 10);
  console.log(`Parsed ${events.length} daily snapshots (${firstDate} → ${lastDate})`);
  printSummaryStats(events);

  if (DRY_RUN) {
    console.log('\nDRY_RUN=true — skipping PostHog send. Sample event:');
    console.log(JSON.stringify(events[0], null, 2));
    return;
  }

  console.log(`\nSending to PostHog (${POSTHOG_HOST}) in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < events.length; i += BATCH_SIZE) {
    const batch = events.slice(i, i + BATCH_SIZE);
    postBatch(batch);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(events.length / BATCH_SIZE);
    console.log(
      `  ✓ Batch ${batchNum}/${totalBatches} — rows ${i + 1}–${Math.min(i + BATCH_SIZE, events.length)}`,
    );
  }

  console.log(`\n✅ Import complete — ${events.length} events sent to PostHog`);
  console.log(`   Event name:  "${EVENT_NAME}"`);
  console.log(`   Cohort tag:  properties.cohort = "${COHORT_LABEL}"`);
  console.log(`   To view: PostHog → Insights → filter by cohort = "${COHORT_LABEL}"`);
}

main().catch((err) => {
  console.error('\nImport failed:', err.message ?? err);
  console.error(err);
  process.exit(1);
});
