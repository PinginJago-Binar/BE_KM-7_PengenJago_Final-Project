#!/bin/bash

echo "Running database migrations..."
npx prisma migrate deploy

echo "Clearing cache..."
npx some-clear-cache-tool

echo "Starting the application..."
node ./src/server.js