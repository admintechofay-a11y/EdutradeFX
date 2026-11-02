#!/bin/sh
set -e

if [ "$SKIP_MIGRATIONS" != "true" ]; then
  echo "Executing database migrations (prisma migrate deploy)..."
  npx prisma migrate deploy || {
    echo "ERROR: Database migration failed!"
    exit 1
  }
fi

echo "Starting application with: $@"
exec "$@"

