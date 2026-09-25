# Backend deploy

One-command deploy for the AppSync schema + resolvers. Use this instead of `amplify push`.

## TL;DR

```bash
./scripts/deploy-backend.sh dev
```

That's it. Compiles your local schema, uploads the artifacts to S3, and updates the `apiwhiskeysocial` nested stack via direct CloudFormation. Takes 1–5 min.

## Why this script exists

`amplify push` is broken on this project — see the [project deployment memory](/Users/dev/workspace/notes/project_deployment.md) for the full diagnosis. Three independent Amplify CLI bugs combine to make it unsafe:

1. The root template generator strips `s3Key` parameters from unchanged function nested stacks, causing CloudFormation rollback.
2. The iterative-deploy step stops after applying only "state 01" (an intermediate schema without the new fields) and never advances, leaving the live API in a regressed state.
3. The Lambda packaging step's `yarn install` occasionally hangs on a corrupted local cache.

This script sidesteps all three by:
- Using `amplify api gql-compile` (which only **compiles**, never deploys) to generate templates locally
- Uploading them to S3 with a content hash
- Updating the `apiwhiskeysocial` nested stack directly via `aws cloudformation update-stack`, using `UsePreviousValue=true` for all parameters except `S3DeploymentRootKey`

The api nested stack is what holds the live AppSync schema. Updating it directly is safer than going through the root stack because we don't trigger the parameter-stripping bug.

## Commands

```bash
# Deploy to dev
./scripts/deploy-backend.sh dev

# Compile + upload but DON'T deploy — gives you a hash to inspect
./scripts/deploy-backend.sh dev --dry-run

# Deploy a specific previously-uploaded hash (useful for rollback)
./scripts/deploy-backend.sh dev --hash <40-char-hash>

# Deploy to prod (requires PROD_AWS_PROFILE, PROD_ROOT_STACK, PROD_S3_BUCKET env vars)
PROD_AWS_PROFILE=lawrence-amplify-prod \
PROD_ROOT_STACK=amplify-whiskeysocial-prod-... \
PROD_S3_BUCKET=amplify-whiskeysocial-prod-...-deployment \
  ./scripts/deploy-backend.sh prod

# Help
./scripts/deploy-backend.sh --help
```

## What it covers (and what it doesn't)

**Covers:**
- Schema additions / removals / renames (User, Whiskey, etc.)
- New `@hasMany` / `@belongsTo` / `@manyToMany` relations
- New `@index` (GSI) — see caveat below
- New `@auth` rules
- New `@function` resolvers (referencing existing Lambdas)
- VTL resolver changes
- AppSync data source changes

**Does NOT cover (yet):**
- New Lambda functions — still need `amplify push` (or manual zip + `aws lambda create-function`)
- Changes to existing Lambda function code — same
- Auth (Cognito) changes
- Storage (S3) changes
- Analytics (Pinpoint/Kinesis) changes

For those, you still need a fuller deploy (or manual AWS CLI). The script can be extended to handle them; for now those are rare enough to handle case by case.

## Required: keep `enableIterativeGsiUpdates` OFF (added 2026-07-26)

`amplify/cli.json` must have `features.graphqltransformer.enableiterativegsiupdates: false`
(committed). **Why it matters for this script:** with the flag ON, `gql-compile`
emits an *iterative, multi-state* build (a `.../states/initial-stack` layout) meant to
be applied step-by-step by `amplify push`. A single direct `update-stack` only applies
the first state, so a schema that adds `@model`s/GSIs deploys **incomplete** — and the
same iterative path throws `🛑 table name should be passed` under `amplify push`. With
the flag OFF, `gql-compile` emits one self-contained template this script deploys fully
in one shot. This is safe for **new** tables (a CREATE builds all its GSIs at once).

> Also: run amplify commands under **Node 20** (`nvm use 20`) — Amplify Gen1 is flaky on
> Node 22. The app itself still targets Node 22; this is only for CLI/deploy commands.

Confirmed 2026-07-26: deployed 8 new `@model`s (Tasting Passport) to dev in one run of
this script with the flag off.

## Adding a new GSI (the brandVenues case)

When you add a new `@index(name: "...")` to your schema, the underlying DynamoDB table needs a new Global Secondary Index. CloudFormation can only add one GSI per table per update **on an existing table** (new tables create all their GSIs at once). If your change adds multiple GSIs to an *existing* table, do them one at a time across separate deploys.

If the deploy fails with a CFN error mentioning the GSI, check the DynamoDB table directly:

```bash
aws dynamodb describe-table \
  --table-name User-<api-id>-dev \
  --profile lawrence-amplify-dev --region us-east-2 \
  --query "Table.GlobalSecondaryIndexes[].IndexName"
```

If the GSI is already there (created by a previous deploy that partially succeeded), the new attempt will succeed because CFN sees it as "no change."

## Required after deploying Tasting Passport to a NEW environment

A deploy creates the tables but leaves them **empty**. The app only renders a
`PUBLISHED` event fetched from the backend, so on an unseeded environment it
silently falls back to its built-in sample and attendees see nothing real.

Seed the event roster the mockup was built from:

```bash
# Always preview first — writes nothing
AWS_PROFILE=<profile> yarn seed:tasting-event --env prod --dry-run

# Then write
AWS_PROFILE=<profile> yarn seed:tasting-event --env prod
```

Or fold it into the deploy in one step:

```bash
./scripts/deploy-backend.sh prod --seed
```

Without `--seed` the deploy script prints a reminder rather than writing data —
schema deploys shouldn't quietly mutate production records.

Notes:

- **Idempotent.** Booth ids derive from the event id, so re-running updates the
  same rows instead of duplicating them, and preserves each row's original
  `createdAt`. Safe after every deploy.
- **One source of truth.** The script reads the same roster the app's sample
  content is built from (`src/domains/TastingPassport/mock/eventSource.ts`), so
  the seeded event and the mockup cannot drift apart. That file is kept free of
  imports so plain ts-node can read it — don't add imports to it.
- **Booths only.** The mockup carries no per-booth pours, so pours are left for
  the CMS to author. Booths without pours fall back to the app's sample list.
- **Brand ids are PRODUCTION `User` ids.** 33 of the 37 booths link to a real
  brand account; the other 4 are standalone. Seeding this roster into dev leaves
  those links dangling, which is expected — booths fall back to their own name
  and logo when the brand can't be resolved.
- **`PUBLISHED` by default.** The `tastingPassport` feature flag is the real
  gate on whether the entry point renders at all, so a published-but-unflagged
  event is invisible. Pass `--status DRAFT` if you want it staged instead.

## Verifying after a deploy

```bash
# Check the deployed schema for a specific field
curl -s -X POST \
  -H "Content-Type: application/json" \
  -H "x-api-key: <api-key-from-aws-exports.js>" \
  -d '{"query":"{ listUsers(limit:1) { items { id venueHours brandId } } }"}' \
  https://vxlixvxebza6harw6vj5zygkbq.appsync-api.us-east-2.amazonaws.com/graphql
```

If a field is missing, you'll get a `Field 'X' in type 'User' is undefined` error. If the deploy worked, you'll get `null` for missing values but no error.

## Rollback

Each deploy produces a content hash printed in the output. To roll back to a previous version:

```bash
./scripts/deploy-backend.sh dev --hash <previous-hash>
```

The script verifies the hash exists in S3 before submitting the CloudFormation update.

To find recent hashes:

```bash
aws s3 ls s3://amplify-whiskeysocial-dev-111547-deployment/amplify-appsync-files/ \
  --profile lawrence-amplify-dev --region us-east-2 \
  | tail -10
```

## Troubleshooting

**"AWS credentials invalid or profile not configured"**
Check `~/.aws/credentials` has a `[lawrence-amplify-dev]` section, or set `AWS_PROFILE` to a working profile.

**"No updates are to be performed"**
Your local schema matches what's already deployed. Nothing to do.

**Stack ends in `UPDATE_ROLLBACK_COMPLETE`**
The script prints the root-cause failure events. The most common cause is a CloudFormation parameter mismatch — re-run with `--dry-run` and inspect the uploaded template. If the failure is on a function nested stack with "must have values", that's the broader Amplify CLI bug — you may need to fall back to manual root-template patching (see the memory note linked above for the procedure).

**`amplify api gql-compile` fails**
Schema syntax error. Fix the schema file; the compiler points at the line.

**Deploy stuck in `UPDATE_IN_PROGRESS` for > 15 min**
GSI creation can take time on large tables. Check via:
```bash
aws cloudformation describe-stack-events \
  --stack-name amplify-whiskeysocial-dev-111547-apiwhiskeysocial-<id> \
  --profile lawrence-amplify-dev --region us-east-2 --max-items 10
```

## When to NOT use this script

- You added a new Lambda function — use `amplify push` for the function (it's the function-only push that's safe; the api push is what's broken), then run this script for the api/resolver part. Better yet, extend this script to handle functions.
- You're changing Cognito / S3 / Pinpoint config — use `amplify push` cautiously, or update via CDK / CloudFormation directly.
- You're doing the very first deploy in a new environment — use `amplify push` (or `amplify init`); this script assumes the root stack already exists.

## Future improvements (in priority order)

1. Add Lambda function deploy support (package + upload zip + update function CFN parameters)
2. Wire into a GitHub Actions workflow that runs on push to `dev` branch when `amplify/backend/**` changes
3. Add schema diff preview (show which fields are added/removed before deploying)
4. Detect new-GSI scenarios and warn explicitly
