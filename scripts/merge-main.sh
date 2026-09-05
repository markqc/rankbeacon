#!/bin/bash

set -u

# merge-main.sh
# Merge dev into main, tag a new version, push, then return to the original branch.

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
cd "$REPO_ROOT"

SPINNER=('/' '-' "\\" '|')

run_with_spinner() {
  local msg="$1"; shift
  local out pid i
  out=$(mktemp)
  i=0

  (
    while true; do
      printf '\r%s %s' "$msg" "${SPINNER[$((i % ${#SPINNER[@]}))]}" >&2
      i=$((i + 1))
      sleep 0.1
    done
  ) &
  pid=$!

  "$@" >"$out" 2>&1
  local code=$?

  kill "$pid" >/dev/null 2>&1
  wait "$pid" 2>/dev/null

  if [ $code -eq 0 ]; then
    printf '\r%s [done]\n' "$msg" >&2
  else
    printf '\r%s [failed]\n' "$msg" >&2
    cat "$out"
  fi

  rm -f "$out"
  return $code
}

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
  send_slack "[FAIL] $APP_NAME main merge failed: $msg"
  exit 1
}

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD) || fail "Not a git repository."
ORIGINAL_BRANCH=$CURRENT_BRANCH
STASHED=false

if [ "$CURRENT_BRANCH" != "main" ]; then
  if [ -n "$(git status --porcelain)" ]; then
    git stash push -u -m "auto-stash before main merge" || fail "Stash failed."
    STASHED=true
  fi
  git checkout main || fail "Could not switch to main branch."
  CURRENT_BRANCH="main"
fi

run_with_spinner "Fetching origin" git fetch origin || fail "Fetch failed."

BEFORE_HEAD=$(git rev-parse HEAD)
run_with_spinner "Pulling origin main" git pull origin main || fail "Pull from origin main failed."
AFTER_HEAD=$(git rev-parse HEAD)

if [ "$BEFORE_HEAD" != "$AFTER_HEAD" ]; then
  run_with_spinner "Building assets" npm run build || fail "npm run build failed."
  git add -A || true
  if ! git diff --cached --quiet; then
    git commit -m "Build assets for latest main" || fail "Build commit failed."
  fi
fi

if git show-ref --verify --quiet refs/remotes/origin/dev; then
  DEV_BRANCH="origin/dev"
else
  DEV_BRANCH="dev"
fi

DEV_MSG=$(git log -1 --format=%s "$DEV_BRANCH") || fail "Could not read dev branch message."

run_with_spinner "Merging dev into main" git merge -F <(printf '%s\n' "$DEV_MSG") "$DEV_BRANCH" || fail "Merge from dev failed."

echo ""
echo "Computing version based on previous tags..."

LATEST_TAG=$(git for-each-ref --sort=-creatordate --format='%(refname:short)' 'refs/tags/main-*-v-*' | head -n1)

if [ -n "$LATEST_TAG" ]; then
  BASE_VERSION=${LATEST_TAG##*-v-}
else
  BASE_VERSION="1.0.0"
fi

MAJOR=$(echo "$BASE_VERSION" | cut -d. -f1)
MINOR=$(echo "$BASE_VERSION" | cut -d. -f2)
PATCH=$(echo "$BASE_VERSION" | cut -d. -f3)

if echo "$DEV_MSG" | grep -qiE '\bmajor\b'; then
  MAJOR=$((MAJOR + 1))
  MINOR=0
  PATCH=0
elif echo "$DEV_MSG" | grep -qiE '\bminor\b'; then
  MINOR=$((MINOR + 1))
  PATCH=0
else
  PATCH=$((PATCH + 1))
fi

NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
DATE=$(date +%m%d%Y)
TS=$(date +%s)
TAG="main-${DATE}-${TS}-v-${NEW_VERSION}"

echo "New version: $NEW_VERSION"
echo "New tag: $TAG"

git tag -a "$TAG" -m "$TAG" || fail "Tag creation failed."

run_with_spinner "Pushing main to origin" git push origin main || fail "Push to origin main failed."
run_with_spinner "Pushing tag to origin" git push origin "$TAG" || fail "Push tag to origin failed."

echo ""
echo "Returning to $ORIGINAL_BRANCH..."
if [ "$ORIGINAL_BRANCH" != "main" ]; then
  git checkout "$ORIGINAL_BRANCH" || fail "Could not return to $ORIGINAL_BRANCH"
fi

if [ "$STASHED" = true ]; then
  git stash pop || fail "Could not re-apply stash"
fi

run_with_spinner "Clearing cache" php artisan cache:clear || fail "php artisan cache:clear failed"
run_with_spinner "Rebuilding assets" npm run build || fail "npm run build failed"

MAIN_COMMIT=$(git rev-parse --short HEAD)

echo ""
echo "============================================"
echo "$APP_NAME - main merge complete"
echo "Branch: main"
echo "Merge commit: $MAIN_COMMIT"
echo "Dev message: $DEV_MSG"
echo "New tag: $TAG"
echo "Original branch restored: $ORIGINAL_BRANCH"
echo "============================================"

send_slack "[SUCCESS] $APP_NAME main merge complete. Commit $MAIN_COMMIT: $DEV_MSG | Tag $TAG"
