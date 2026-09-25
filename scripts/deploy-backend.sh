#!/usr/bin/env bash
#
# Deploy the AppSync schema + resolvers without running `amplify push`.
#
# Why: `amplify push` on this project is broken — see
# scripts/deploy-backend.md for the full story. This script bypasses
# the Amplify CLI deploy pipeline and pushes the compiled api artifacts
# straight to CloudFormation.
#
# Usage:
#   ./scripts/deploy-backend.sh [dev|prod] [--dry-run] [--hash <hash>]
#
#   dev|prod   Environment to deploy to. Default: dev.
#   --dry-run  Compile + upload artifacts, but skip the CloudFormation update.
#   --seed     After a successful deploy, seed the tasting event roster into the
#              environment (idempotent). Without it the script only reminds you.
#   --hash     Deploy a specific previously-uploaded hash (skips compile + upload).
#              Useful for rollback: pass the hash from a known-good deploy.
#
# Requires: aws cli, amplify cli, python3, sha256sum (or shasum on macOS).

set -euo pipefail

ENV="dev"
DRY_RUN=0
SEED=0
HASH_OVERRIDE=""

while [ $# -gt 0 ]; do
  case "$1" in
    dev|prod)        ENV="$1"; shift ;;
    --dry-run)       DRY_RUN=1; shift ;;
    --seed)          SEED=1; shift ;;
    --hash)          HASH_OVERRIDE="$2"; shift 2 ;;
    -h|--help)       sed -n '3,18p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *)               echo "Unknown argument: $1" >&2; exit 1 ;;
  esac
done

# --- Environment config -------------------------------------------------------

case "$ENV" in
  dev)
    AWS_PROFILE="${AWS_PROFILE:-lawrence-amplify-dev}"
    AWS_REGION="us-east-2"
    ROOT_STACK="amplify-whiskeysocial-dev-111547"
    S3_BUCKET="amplify-whiskeysocial-dev-111547-deployment"
    API_LOGICAL_ID="apiwhiskeysocial"
    ;;
  prod)
    AWS_PROFILE="${PROD_AWS_PROFILE:-}"
    AWS_REGION="${PROD_AWS_REGION:-us-east-2}"
    ROOT_STACK="${PROD_ROOT_STACK:-}"
    S3_BUCKET="${PROD_S3_BUCKET:-}"
    API_LOGICAL_ID="apiwhiskeysocial"
    if [ -z "$AWS_PROFILE" ] || [ -z "$ROOT_STACK" ] || [ -z "$S3_BUCKET" ]; then
      echo "Error: prod requires PROD_AWS_PROFILE, PROD_ROOT_STACK, PROD_S3_BUCKET env vars" >&2
      exit 1
    fi
    ;;
  *)
    echo "Invalid env: $ENV (expected dev|prod)" >&2; exit 1 ;;
esac

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Use shasum if sha256sum isn't available (macOS).
if ! command -v sha256sum >/dev/null 2>&1; then
  sha256sum() { shasum -a 256 "$@"; }
fi

log()  { printf '\033[36m→\033[0m %s\n' "$*"; }
ok()   { printf '\033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '\033[33m⚠\033[0m %s\n' "$*" >&2; }
die()  { printf '\033[31m✗\033[0m %s\n' "$*" >&2; exit 1; }

# --- Preflight ----------------------------------------------------------------

log "Environment: $ENV  (profile=$AWS_PROFILE region=$AWS_REGION)"
log "Verifying AWS credentials..."
aws sts get-caller-identity --profile "$AWS_PROFILE" --region "$AWS_REGION" --output text >/dev/null \
  || die "AWS credentials invalid or profile '$AWS_PROFILE' not configured"

# --- Compile & upload (unless --hash given) -----------------------------------

if [ -n "$HASH_OVERRIDE" ]; then
  HASH="$HASH_OVERRIDE"
  log "Using existing S3 hash: $HASH (skipping compile + upload)"
  if ! aws s3api head-object \
       --bucket "$S3_BUCKET" \
       --key "amplify-appsync-files/${HASH}/cloudformation-template.json" \
       --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
    die "Hash $HASH not found in s3://$S3_BUCKET/amplify-appsync-files/"
  fi
else
  log "Compiling GraphQL schema..."
  amplify api gql-compile >/dev/null

  BUILD_DIR="amplify/backend/api/whiskeysocial/build"
  [ -f "$BUILD_DIR/cloudformation-template.json" ] || die "Compile produced no template — check schema syntax"

  log "Computing content hash..."
  HASH=$(find "$BUILD_DIR" -type f -print0 \
         | sort -z \
         | xargs -0 sha256sum \
         | sha256sum \
         | head -c 40)
  log "Hash: $HASH"

  S3_PREFIX="amplify-appsync-files/${HASH}"

  if aws s3api head-object \
       --bucket "$S3_BUCKET" \
       --key "${S3_PREFIX}/cloudformation-template.json" \
       --profile "$AWS_PROFILE" --region "$AWS_REGION" >/dev/null 2>&1; then
    log "Hash already exists in S3 — skipping upload"
  else
    log "Uploading api artifacts to s3://${S3_BUCKET}/${S3_PREFIX}/"
    aws s3 sync "$BUILD_DIR/" "s3://${S3_BUCKET}/${S3_PREFIX}/" \
      --profile "$AWS_PROFILE" --region "$AWS_REGION" \
      --only-show-errors
    ok "Artifacts uploaded"
  fi
fi

S3_PREFIX="amplify-appsync-files/${HASH}"

if [ "$DRY_RUN" -eq 1 ]; then
  ok "Dry run complete. Hash $HASH is ready in S3."
  log "To deploy:  ./scripts/deploy-backend.sh $ENV --hash $HASH"
  exit 0
fi

# --- Find the live api nested stack ------------------------------------------

log "Looking up api nested stack..."
API_STACK_ARN=$(aws cloudformation list-stack-resources \
  --stack-name "$ROOT_STACK" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" \
  --query "StackResourceSummaries[?LogicalResourceId=='${API_LOGICAL_ID}'].PhysicalResourceId" \
  --output text)
[ -n "$API_STACK_ARN" ] || die "Could not find ${API_LOGICAL_ID} nested stack under $ROOT_STACK"

# --- Build parameter overrides ------------------------------------------------

log "Reading current api stack parameters..."
CURRENT_PARAMS=$(aws cloudformation describe-stacks \
  --stack-name "$API_STACK_ARN" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" \
  --query "Stacks[0].Parameters" --output json)

PARAM_ARGS=$(python3 -c "
import json
params = json.loads('''$CURRENT_PARAMS''')
out = []
for p in params:
    if p['ParameterKey'] == 'S3DeploymentRootKey':
        out.append('ParameterKey=S3DeploymentRootKey,ParameterValue=${S3_PREFIX}')
    else:
        out.append(f\"ParameterKey={p['ParameterKey']},UsePreviousValue=true\")
print(' '.join(out))
")

# --- Clear stale iterative-deploy lock ---------------------------------------

log "Clearing stale deployment-state.json (if any)..."
aws s3 rm "s3://${S3_BUCKET}/deployment-state.json" \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" 2>/dev/null || true

# --- Trigger CloudFormation update --------------------------------------------

log "Submitting CloudFormation update..."
UPDATE_RESULT=$(aws cloudformation update-stack \
  --stack-name "$API_STACK_ARN" \
  --template-url "https://s3.amazonaws.com/${S3_BUCKET}/${S3_PREFIX}/cloudformation-template.json" \
  --parameters $PARAM_ARGS \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --profile "$AWS_PROFILE" --region "$AWS_REGION" 2>&1) || {
    if echo "$UPDATE_RESULT" | grep -q "No updates are to be performed"; then
      ok "No changes detected — nothing to deploy"; exit 0
    fi
    die "CloudFormation rejected the update:\n$UPDATE_RESULT"
  }
ok "Update submitted: $(echo "$UPDATE_RESULT" | python3 -c 'import json,sys;print(json.load(sys.stdin)["StackId"])')"

# --- Poll until done ----------------------------------------------------------

log "Waiting for stack update to complete (typically 1-5 minutes)..."
PREV_STATUS=""
while true; do
  STATUS=$(aws cloudformation describe-stacks \
    --stack-name "$API_STACK_ARN" \
    --profile "$AWS_PROFILE" --region "$AWS_REGION" \
    --query 'Stacks[0].StackStatus' --output text 2>/dev/null || echo "UNKNOWN")
  if [ "$STATUS" != "$PREV_STATUS" ]; then
    log "  status: $STATUS"
    PREV_STATUS="$STATUS"
  fi
  case "$STATUS" in
    UPDATE_COMPLETE)
      ok "Deploy complete: $HASH"
      log "Verify with: aws appsync get-introspection-schema --api-id <id> --format SDL --profile $AWS_PROFILE --region $AWS_REGION /tmp/live.graphql"
      # A deploy creates the tables but leaves them empty, and the app renders
      # nothing without a PUBLISHED event. Seed (idempotent) so a fresh
      # environment matches the mockup.
      if [ "$SEED" -eq 1 ]; then
        log "Seeding the tasting event roster into $ENV…"
        AWS_PROFILE="$AWS_PROFILE" yarn seed:tasting-event --env "$ENV" \
          || die "Schema deployed, but seeding failed — re-run: yarn seed:tasting-event --env $ENV"
        ok "Seed complete"
      else
        warn "Tables may be empty. Seed the tasting event roster with:"
        warn "    AWS_PROFILE=$AWS_PROFILE yarn seed:tasting-event --env $ENV --dry-run"
        warn "  (drop --dry-run to write; safe to re-run, or pass --seed to this script)"
      fi
      exit 0 ;;
    UPDATE_ROLLBACK_COMPLETE|UPDATE_FAILED|UPDATE_ROLLBACK_FAILED)
      warn "Stack ended in $STATUS — showing recent failure events:"
      aws cloudformation describe-stack-events \
        --stack-name "$API_STACK_ARN" \
        --profile "$AWS_PROFILE" --region "$AWS_REGION" \
        --max-items 30 --output json \
        | python3 -c "
import json, sys
data = json.load(sys.stdin)
for ev in data.get('StackEvents', [])[:30]:
    rs = ev.get('ResourceStatus', '')
    reason = ev.get('ResourceStatusReason', '') or ''
    if rs in ('UPDATE_FAILED', 'CREATE_FAILED') and 'cancelled' not in reason.lower() and reason:
        print(f'  {ev[\"LogicalResourceId\"]}: {reason[:200]}')
" >&2
      die "Deploy failed"
      ;;
  esac
  sleep 15
done
