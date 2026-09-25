#!/bin/bash
# Run eas update with env vars sourced from the matching build profile in eas.json.
# Usage: ./scripts/eas-update.sh <profile> [platform] [message]
#   profile:  staging | production | preview  (default: staging)
#   platform: ios | android | all            (default: all)
#   message:  update message                 (default: last git commit subject)

set -e

PROFILE="${1:-staging}"
PLATFORM="${2:-all}"
MESSAGE="${3:-$(git log -1 --pretty=%s)}"

ENV_EXPORTS=$(node -e "
const eas = require('./eas.json');
const env = (eas.build['$PROFILE'] || {}).env || {};
Object.entries(env).forEach(([k, v]) => process.stdout.write('export ' + k + '=' + JSON.stringify(v) + '\n'));
")

if [ -z "$ENV_EXPORTS" ]; then
  echo "No build profile '$PROFILE' found in eas.json" >&2
  exit 1
fi

eval "$ENV_EXPORTS"

# NOTE: .env is intentionally left in place during the bundle step. Vars not
# exposed via eas.json (e.g. SECRETKEY, which react-native-dotenv inlines from
# .env at build time) must be present, or they resolve to undefined in the device
# bundle and break flows like password-derived sign-in. Set .env to the correct
# values for $PROFILE before running this script.
echo "Publishing OTA update: channel=$PROFILE platform=$PLATFORM"
eas update --channel "$PROFILE" --platform "$PLATFORM" --message "$MESSAGE" --json