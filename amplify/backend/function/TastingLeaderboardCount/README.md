# TastingLeaderboardCount

Real-time leaderboard aggregation for the Tasting Passport.

## What it does

Consumes the **DynamoDB stream on the `TastingPourState` table** and maintains
the `TastingLeaderboardCounter` table. Each attendee "Tasted" toggle becomes a
`+1` / `-1` delta on the counter row keyed `${eventId}:${bottleKey}`. The app
reads that counter and subscribes to its `onUpdate` for a live board.

- `INSERT` with `tasted = true` → +1
- `MODIFY` flipping `tasted` false→true → +1, true→false → −1
- `REMOVE` of a `tasted = true` row → −1
- Any change that doesn't cross the tasted boundary → ignored

`bottleKey` is the identity (catalogue `whiskeyRefId`, else normalized
`brand + name`), copied onto each state row, so the same bottle at two booths
sums into one row. Display fields (`bottleName`, `brand`, `whiskeyRefId`) are
read best-effort from the `TastingPour` row.

## Deployed state (2026-07-28)

Wired and verified end-to-end in **both dev and prod**. A single `INSERT` with
`tasted = true` produced `count = 1` on the matching counter row in each
environment; the probe rows were removed afterwards.

Resources created by hand (NOT managed by CloudFormation — this function is
deliberately absent from `backend-config.json`, so Amplify will not try to
create or clobber it):

| Resource | dev | prod |
| --- | --- | --- |
| Lambda | `TastingLeaderboardCount-dev` | `TastingLeaderboardCount-prod` |
| Role | `TastingLeaderboardCountRole-dev` | `TastingLeaderboardCountRole-prod` |
| Inline policy | `TastingLeaderboardCountPolicy` | same |
| Event-source mapping | on the `TastingPourState` stream, `LATEST`, batch 10 | same |

Two gotchas worth keeping:

- **`aws-sdk` v2 is NOT present in the `nodejs20.x` runtime** (it was dropped
  after `nodejs16`). The zip must bundle `node_modules/aws-sdk`, or the function
  dies at init with `Runtime.ImportModuleError: Cannot find module 'aws-sdk'`.
- A freshly created event-source mapping on `LATEST` can miss writes made in the
  first moments after it reports `Enabled`, while shard iterators are still being
  established. If a probe shows `No records processed`, write another row rather
  than assuming the wiring is wrong.

The `TastingPourState` stream already had `NEW_AND_OLD_IMAGES` enabled — Amplify
turns streams on for `@model` tables by default, so step 4 below needed no work.

## Wiring required at deploy (kept for rebuilding an environment from scratch)

`amplify push` is stale on this machine — deploy direct, mirroring `CountPours`:

1. **Package & deploy the function** — zip `src/` **including `node_modules`**,
   `lambda create-function` (Node 20, handler `index.handler`).
2. **Env vars** — inject the Amplify Params in the header:
   `API_WHISKEYSOCIAL_TASTINGLEADERBOARDCOUNTERTABLE_NAME`,
   `API_WHISKEYSOCIAL_TASTINGPOURTABLE_NAME`, `ENV`, `REGION`.
   Table names follow `TastingLeaderboardCounter-<apiId>-<env>` etc.
3. **IAM** — allow `dynamodb:UpdateItem` on the counter table and
   `dynamodb:GetItem` on the pour table, plus the stream-read actions
   (`GetRecords`, `GetShardIterator`, `DescribeStream`, `ListStreams`) on the
   `TastingPourState` stream (copy `CountPours` custom-policies.json).
4. **Enable the stream** on `TastingPourState` (`NEW_AND_OLD_IMAGES`) and add an
   **event-source mapping** to this function (batch size ~10, bisect-on-error on).

Idempotency/ordering: last-write-wins per counter is acceptable here (spec says
"near real-time is fine"). Errors re-throw so the stream retries.
