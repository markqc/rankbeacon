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
  msg=$(printf '%s' "$msg" | sed 's/"/\\"/g' | tr '\n' ' ')
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
  remote_with_spinner "$label" "$cmd" || return 1
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
    fail "$label failed on live server"
  fi
}

echo "Starting $APP_NAME live update..."
echo "Server: $SERVER:$SSH_PORT"
echo "Path: ~/$REMOTE_DIR"

remote_capture "Checking remote branch" "git rev-parse --abbrev-ref HEAD"
BRANCH=$REMOTE_OUTPUT

if [ "$BRANCH" != "main" ]; then
  echo ""
  echo "WARNING: remote branch is '$BRANCH', not 'main'."
  switch=""
  read -p "Switch to main and continue? (y/n) " switch
  if [[ ! "$switch" =~ ^[Yy] ]]; then
    fail "Aborted: remote branch is $BRANCH, not main"
  fi
  run_remote "Switching to main" "git checkout main" || fail "Could not switch to main"
fi

run_remote "Fetching origin" "git fetch" || fail "git fetch failed"
run_remote "Pulling origin main" "git pull origin main" || fail "git pull failed"

remote_capture "Getting current commit" "git rev-parse --short HEAD"
PULL_COMMIT=$REMOTE_OUTPUT

remote_capture "Running composer install" "composer install $COMPOSER_FLAGS"
COMPOSER_OUTPUT=$REMOTE_OUTPUT

if echo "$COMPOSER_OUTPUT" | grep -qE 'Nothing to (install|update|remove)'; then
  COMPOSER_STATUS="no changes"
elif echo "$COMPOSER_OUTPUT" | grep -q 'Package operations:'; then
  COMPOSER_STATUS="packages installed/updated"
else
  COMPOSER_STATUS="completed"
fi

remote_capture "Checking migration status" "php artisan migrate:status"
MIGRATE_STATUS=$REMOTE_OUTPUT
PENDING=$(echo "$MIGRATE_STATUS" | grep -cE '^\|\s+No\s+\|' || true)
PENDING=${PENDING:-0}

MIGRATION_STATUS="no pending migrations"
if [ "$PENDING" -gt 0 ]; then
  echo ""
  echo "$PENDING pending migration(s) found."
  run_migrations=""
  read -t 10 -p "Run pending migrations? (y/n, auto-skip in 10s) " run_migrations || true
  if [[ "$run_migrations" =~ ^[Yy] ]]; then
    run_remote "Running migrations" "php artisan migrate --force" || fail "Migration failed"
    MIGRATION_STATUS="ran $PENDING migration(s)"
  else
    MIGRATION_STATUS="skipped $PENDING pending migration(s)"
  fi
fi

run_remote "Clearing cache" "php artisan cache:clear" || fail "Cache clear failed"
CACHE_STATUS="cleared"

echo ""
echo "============================================"
echo "$APP_NAME - live update complete"
echo "Server: $SERVER:$SSH_PORT"
echo "Path: ~/$REMOTE_DIR"
echo "Branch: main"
echo "Commit: $PULL_COMMIT"
echo "Composer: $COMPOSER_STATUS"
echo "Migrations: $MIGRATION_STATUS"
echo "Cache: $CACHE_STATUS"
echo "============================================"

send_slack "[SUCCESS] $APP_NAME live update complete on $SERVER:$SSH_PORT. Branch: main, Commit: $PULL_COMMIT, Composer: $COMPOSER_STATUS, Migrations: $MIGRATION_STATUS, Cache: $CACHE_STATUS"
