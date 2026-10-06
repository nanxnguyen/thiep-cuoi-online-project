#!/usr/bin/env bash
# Restore a dump made by db-backup.sh. Usage: [DB_URL=...] scripts/db-restore.sh backup/<file>.dump
# DESTRUCTIVE: drops and recreates objects in the target DB. Type the host to confirm.
set -euo pipefail
FILE="${1:?usage: db-restore.sh <file.dump>}"
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
HOST="$(echo "$DB_URL" | sed -E 's#.*@([^:/]+).*#\1#')"
read -r -p "Restore $FILE into host '$HOST' (overwrites data). Type host to confirm: " ans
[ "$ans" = "$HOST" ] || { echo "Aborted."; exit 1; }
pg_restore --clean --if-exists --no-owner --no-privileges -d "$DB_URL" "$FILE"
echo "Restored $FILE -> $HOST"
