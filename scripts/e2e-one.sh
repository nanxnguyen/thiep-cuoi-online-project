#!/usr/bin/env bash
# Run ONE Playwright project against a throwaway `next start`, then always kill the server.
# Usage: npm run e2e:one -- chrome [extra playwright args]
# Needs a finished build (`npm run build:next`). One project at a time: parallel runs starved this machine.
set -euo pipefail

project="${1:?usage: npm run e2e:one -- <project> [playwright args]}"
shift || true
port="${E2E_PORT:-3100}"

if lsof -ti "tcp:$port" >/dev/null 2>&1; then
  echo "port $port already in use — stop the old server first (lsof -ti tcp:$port | xargs kill)" >&2
  exit 1
fi

npx next start -p "$port" >/dev/null 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null || true; lsof -ti "tcp:$port" | xargs kill 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  curl -sf "http://localhost:$port" >/dev/null 2>&1 && break
  sleep 1
done

E2E_PORT="$port" npx playwright test --project="$project" --workers=1 "$@"
