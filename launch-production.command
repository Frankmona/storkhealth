#!/bin/bash
# Get the directory of the script and cd into it
cd "$(dirname "$0")"

echo "Building the Next.js app for production..."
npm run build

echo "Starting the production server..."
npm run start
