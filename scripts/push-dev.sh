#!/bin/bash

set -u

# push-dev.sh
# Interactively commit and push to the dev branch, then return to the original branch.

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
  send_slack "[FAIL] $APP_NAME dev push failed: $msg"
  exit 1
}

CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD) || fail "Not a git repository."
ORIGINAL_BRANCH=$CURRENT_BRANCH
STASHED=false

if [ "$CURRENT_BRANCH" != "dev" ]; then
  if [ -n "$(git status --porcelain)" ]; then
    git stash push -u -m "auto-stash before dev push" || fail "Stash failed."
    STASHED=true
  fi
  git checkout dev || fail "Could not switch to dev branch."
  CURRENT_BRANCH="dev"
fi

run_with_spinner "Fetching origin" git fetch origin || fail "Fetch failed."
if git show-ref --verify --quiet refs/remotes/origin/dev; then
  run_with_spinner "Pulling origin dev" git pull origin dev || fail "Pull from origin dev failed."
else
  echo "Remote dev branch not found; will create it on first push."
fi
run_with_spinner "Building assets" npm run build || fail "npm run build failed."

list_files() {
  git ls-files -m -o --exclude-standard | while IFS= read -r f; do
    local mt
    if [ -e "$f" ]; then
      if [ "$(uname)" = "Darwin" ]; then
        mt=$(stat -f %m "$f")
      else
        mt=$(stat -c %Y "$f")
      fi
    else
      mt=0
    fi
    printf '%s\t%s\n' "$mt" "$f"
  done | sort -t$'\t' -k1,1nr | awk -F'\t' '!a[$2]++' | cut -f2-
}

refresh_files() {
  FILES=()
  while IFS= read -r f; do
    FILES+=("$f")
  done < <(list_files)
}

refresh_files

while [ ${#FILES[@]} -gt 0 ]; do
  echo ""
  echo "Changes to commit (latest first):"
  i=0
  while [ $i -lt ${#FILES[@]} ]; do
    printf '%2d) %s\n' $((i+1)) "${FILES[$i]}"
    i=$((i+1))
  done

  echo ""
  read -p "Select file number to stage, '.' for all, or 'done' to finish: " selection

  case "$selection" in
    done|"")
      break
      ;;
    .)
      git add -A || fail "Could not stage files"
      echo "All changes staged."
      break
      ;;
    *)
      if [[ "$selection" =~ ^[0-9]+$ ]] && [ "$selection" -ge 1 ] && [ "$selection" -le ${#FILES[@]} ]; then
        git add -A -- "${FILES[$((selection-1))]}" || fail "Could not stage file"
        echo "Staged: ${FILES[$((selection-1))]}"
      else
        echo "Invalid selection. Please try again."
      fi
      ;;
  esac

  refresh_files
done

if git diff --cached --quiet; then
  fail "No files staged to commit."
fi

echo ""
read -p "Ticket number (default blank): " ticket
read -p "Description: " description
[ -n "$description" ] || fail "Description is required."

if [ -n "$ticket" ]; then
  COMMIT_MSG="[$ticket] - $description"
else
  COMMIT_MSG="$description"
fi

git commit -F <(printf '%s\n' "$COMMIT_MSG") || fail "Commit failed."
DEV_COMMIT=$(git rev-parse --short HEAD)

run_with_spinner "Pushing to origin dev" git push -u origin dev || fail "Push to origin dev failed."

echo ""
echo "Returning to $ORIGINAL_BRANCH..."
if [ "$ORIGINAL_BRANCH" != "dev" ]; then
  git checkout "$ORIGINAL_BRANCH" || fail "Could not return to $ORIGINAL_BRANCH"
fi

if [ "$STASHED" = true ]; then
  git stash pop || fail "Could not re-apply stash"
fi

run_with_spinner "Clearing cache" php artisan cache:clear || fail "php artisan cache:clear failed"
run_with_spinner "Rebuilding assets" npm run build || fail "npm run build failed"

echo ""
echo "============================================"
echo "$APP_NAME - dev push complete"
echo "Branch pushed: dev"
echo "Commit: $DEV_COMMIT"
echo "Message: $COMMIT_MSG"
echo "Original branch restored: $ORIGINAL_BRANCH"
echo "============================================"

send_slack "[SUCCESS] $APP_NAME dev push complete. Commit $DEV_COMMIT: $COMMIT_MSG"
