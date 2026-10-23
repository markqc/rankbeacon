#!/bin/bash

set -eu

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
TEST_DIR=$(mktemp -d)
trap 'rm -rf "$TEST_DIR"' EXIT
export TEST_DIR

ssh() {
  local cmd="${*: -1}"
  printf '%s\n' "$cmd" >> "$TEST_DIR/commands"
  if [[ "$cmd" == *"$FAILED_COMMAND"* ]] && [ -n "$FAILED_COMMAND" ]; then
    printf '%s\n' 'The Process class relies on proc_open, which is not available. "quoted" C:\\php'
    return 1
  fi
  case "$cmd" in
    *'--abbrev-ref'*) echo "${TEST_BRANCH:-main}" ;;
    *'--short HEAD'*) echo abc123 ;;
    *'composer install'*) echo 'Nothing to install, update or remove' ;;
    *'migrate:status'*) echo "${TEST_MIGRATIONS:-All migrations have run}" ;;
  esac
}

curl() {
  while [ "$#" -gt 0 ]; do
    if [ "$1" = '--data' ]; then
      printf '%s' "$2" > "$TEST_DIR/slack.json"
      return 0
    fi
    shift
  done
}

grep() {
  case "$1" in
    '^APP_NAME=') echo 'APP_NAME=TestApp' ;;
    '^SLACK_WEBHOOK_URL=') echo 'SLACK_WEBHOOK_URL=mock-webhook' ;;
    *) command grep "$@" ;;
  esac
}

export -f ssh curl grep

run_case() {
  export FAILED_COMMAND="$1"
  : > "$TEST_DIR/commands"
  printf 'y\ny\n' | bash "$SCRIPT_DIR/update-live.sh" > "$TEST_DIR/output" 2>&1
  command grep -q 'php artisan cache:clear' "$TEST_DIR/commands"
  command grep -Fq "$2" "$TEST_DIR/slack.json"
  python3 -c 'import json,sys; json.load(open(sys.argv[1]))' "$TEST_DIR/slack.json"
}

run_case '' '[SUCCESS]'
command grep -q 'Composer: no changes' "$TEST_DIR/output"

for failed in 'composer install' 'git fetch' 'git pull' '--abbrev-ref' '--short HEAD' 'migrate:status' 'cache:clear'; do
  run_case "$failed" '[WARNING]'
  command grep -q 'proc_open' "$TEST_DIR/slack.json"
done

export TEST_MIGRATIONS='2026_01_01_create_example Pending'
run_case 'migrate --force' 'Migrations: failed (continued)'

export TEST_BRANCH=dev
run_case 'git checkout main' 'Branch: dev'

: > "$TEST_DIR/commands"
if printf 'n\n' | bash "$SCRIPT_DIR/update-live.sh" > "$TEST_DIR/output" 2>&1; then
  echo 'Expected explicit cancellation to fail' >&2
  exit 1
fi
command grep -q '\[FAIL\]' "$TEST_DIR/slack.json"
if command grep -q 'composer install' "$TEST_DIR/commands"; then
  echo 'Deployment continued after cancellation' >&2
  exit 1
fi

printf 'All mocked deployment tests passed.\n'
