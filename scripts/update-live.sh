#!/bin/bash

set -u

# update-live.sh
# SSH into the live server, pull the latest main branch, install dependencies,
# run migrations if needed, clear the cache, and notify Slack.

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

SERVER="u271690695@45.13.255.131"
SSH_PORT="65002"
REMOTE_DIR='domains/rankbeacon.authoritylighthouse.com/public_html'
COMPOSER_FLAGS="--no-interaction --no-dev --optimize-autoloader"

SPINNER=('/' '-' "\\" '|')

dotenv_get() {
  local key="$1"
  local file="${2:-$REPO_ROOT/.env}"
  grep "^${key}=" "$file" 2>/dev/null | sed "s/^${key}=//" | sed 's/^"//;s/"$//'
}

APP_NAME=$(dotenv_get APP_NAME)
: "${APP_NAME:=RankBeacon}"
SLACK_WEBHOOK_URL=$(dotenv_get SLACK_WEBHOOK_URL)

send_slack() {
  local msg="$1"
  [ -n "$SLACK_WEBHOOK_URL" ] || return 0
  msg=$(printf '%s' "$msg" | sed 's/\\/\\\\/g; s/"/\\"/g' | tr '\n\r\t' '   ')
  curl -s -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"$msg\"}" \
    "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
}

fail() {
  local msg="$1"
  echo "ERROR: $msg" >&2
  send_slack "[FAIL] $APP_NAME live update failed: $msg"
  exit 1
}

REMOTE_OUTPUT=""
ISSUES=()

record_issue() {
  local label="$1"
  local detail
  detail=$(printf '%s' "$REMOTE_OUTPUT" | LC_ALL=C tr -cd '\11\12\15\40-\176' | tail -c 1500)
  ISSUES+=("$label${detail:+: $detail}")
  echo "WARNING: $label; continuing with remaining steps." >&2
}

remote_with_spinner() {
  local label="$1"
  local cmd="$2"
  local full_cmd="cd ~/\"$REMOTE_DIR\" && $cmd"
  local out pid i
  out=$(mktemp)
  i=0

  (
    while true; do
      printf '\r%s %s' "$label" "${SPINNER[$((i % ${#SPINNER[@]}))]}" >&2
      i=$((i + 1))
      sleep 0.1
    done
  ) &
  pid=$!

  ssh -p "$SSH_PORT" "$SERVER" "$full_cmd" >"$out" 2>&1
  local code=$?

  kill "$pid" >/dev/null 2>&1
  wait "$pid" 2>/dev/null

  if [ $code -eq 0 ]; then
    printf '\r%s [done]\n' "$label" >&2
    REMOTE_OUTPUT=$(cat "$out")
    rm -f "$out"
    return 0
  else
    printf '\r%s [failed]\n' "$label" >&2
    cat "$out" >&2
    REMOTE_OUTPUT=$(cat "$out")
    rm -f "$out"
    return 1
  fi
}

run_remote() {
  local label="$1"
  local cmd="$2"
  echo ""
  echo ">>> $label"
  if ! remote_with_spinner "$label" "$cmd"; then
    record_issue "$label failed on live server"
    return 1
  fi
}

remote_capture() {
  local label="$1"
  local cmd="$2"
  echo ""
  echo ">>> $label"
  if remote_with_spinner "$label" "$cmd"; then
    echo "$REMOTE_OUTPUT"
    return 0
  else
    record_issue "$label failed on live server"
    return 1
  fi
}

echo "Starting $APP_NAME live update..."
echo "Server: $SERVER:$SSH_PORT"
echo "Path: ~/$REMOTE_DIR"

BRANCH="unknown"
if remote_capture "Checking remote branch" "git rev-parse --abbrev-ref HEAD"; then
  BRANCH=$REMOTE_OUTPUT
fi

if [ "$BRANCH" != "main" ] && [ "$BRANCH" != "unknown" ]; then
  echo ""
  echo "WARNING: remote branch is '$BRANCH', not 'main'."
  switch=""
  read -p "Switch to main and continue? (y/n) " switch
  if [[ ! "$switch" =~ ^[Yy] ]]; then
    fail "Aborted: remote branch is $BRANCH, not main"
  fi
  if run_remote "Switching to main" "git checkout main"; then
    BRANCH="main"
  fi
fi

run_remote "Fetching origin" "git fetch"
run_remote "Pulling origin main" "git pull origin main"

PULL_COMMIT="unknown"
if remote_capture "Getting current commit" "git rev-parse --short HEAD"; then
  PULL_COMMIT=$REMOTE_OUTPUT
fi

COMPOSER_STATUS="failed (continued)"
if remote_capture "Running composer install" "composer install $COMPOSER_FLAGS"; then
  COMPOSER_STATUS="completed"
fi
COMPOSER_OUTPUT=$REMOTE_OUTPUT

if [ "$COMPOSER_STATUS" = "failed (continued)" ]; then
  :
elif echo "$COMPOSER_OUTPUT" | grep -qE 'Nothing to (install|update|remove)'; then
  COMPOSER_STATUS="no changes"
elif echo "$COMPOSER_OUTPUT" | grep -q 'Package operations:'; then
  COMPOSER_STATUS="packages installed/updated"
else
  COMPOSER_STATUS="completed"
fi

PENDING=0
MIGRATION_STATUS="unknown (status check failed)"
if remote_capture "Checking migration status" "php artisan migrate:status"; then
  MIGRATE_STATUS=$REMOTE_OUTPUT
  PENDING=$(echo "$MIGRATE_STATUS" | grep -cE '^\|\s+No\s+\||Pending' || true)
  PENDING=${PENDING:-0}
  MIGRATION_STATUS="no pending migrations"
fi
if [ "$PENDING" -gt 0 ]; then
  echo ""
  echo "$PENDING pending migration(s) found."
  run_migrations=""
  read -t 10 -p "Run pending migrations? (y/n, auto-skip in 10s) " run_migrations || true
  if [[ "$run_migrations" =~ ^[Yy] ]]; then
    MIGRATION_STATUS="failed (continued)"
    if run_remote "Running migrations" "php artisan migrate --force"; then
      MIGRATION_STATUS="ran $PENDING migration(s)"
    fi
  else
    MIGRATION_STATUS="skipped $PENDING pending migration(s)"
  fi
fi

CACHE_STATUS="failed (continued)"
if run_remote "Clearing cache" "php artisan cache:clear"; then
  CACHE_STATUS="cleared"
fi

RESULT="SUCCESS"
ISSUE_SUMMARY="none"
if [ ${#ISSUES[@]} -gt 0 ]; then
  RESULT="WARNING"
  ISSUE_SUMMARY=$(printf '%s\n' "${ISSUES[@]}")
fi

echo ""
echo "============================================"
echo "$APP_NAME - live update finished [$RESULT]"
echo "Server: $SERVER:$SSH_PORT"
echo "Path: ~/$REMOTE_DIR"
echo "Branch: $BRANCH"
echo "Commit: $PULL_COMMIT"
echo "Composer: $COMPOSER_STATUS"
echo "Migrations: $MIGRATION_STATUS"
echo "Cache: $CACHE_STATUS"
echo "Issues: $ISSUE_SUMMARY"
echo "============================================"

send_slack "[$RESULT] $APP_NAME live update finished on $SERVER:$SSH_PORT. Branch: $BRANCH, Commit: $PULL_COMMIT, Composer: $COMPOSER_STATUS, Migrations: $MIGRATION_STATUS, Cache: $CACHE_STATUS. Issues (${#ISSUES[@]}): $ISSUE_SUMMARY"
