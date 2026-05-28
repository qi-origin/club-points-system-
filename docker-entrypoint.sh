#!/bin/sh
set -e

echo "Running database migrations..."
cd /app/server
npx prisma migrate deploy

echo "Seeding database (if empty)..."
npx tsx prisma/seed.ts

echo "Starting server..."
export NODE_ENV=production
exec node dist/app.js
