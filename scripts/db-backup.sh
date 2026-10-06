#!/usr/bin/env bash
# Backup Postgres (Supabase local by default).
# Remote: DB_URL='postgresql://postgres.<ref>:<pw>@<pooler-host>:5432/postgres' scripts/db-backup.sh
# Output: backup/<timestamp>.dump (pg_dump custom format, gitignored). Storage files are NOT included.
set -euo pipefail
DB_URL="${DB_URL:-postgresql://postgres:postgres@127.0.0.1:54322/postgres}"
OUT="backup/$(date +%Y%m%d-%H%M%S).dump"
mkdir -p backup
pg_dump "$DB_URL" -Fc --no-owner --no-privileges \
  --schema=public --schema=auth --schema=storage -f "$OUT"
echo "Backup -> $OUT"
