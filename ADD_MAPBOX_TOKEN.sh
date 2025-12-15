#!/bin/bash

# Script to add Mapbox token to frontend .env file

cd "/Users/anuragpoudyal/Library/Mobile Documents/com~apple~CloudDocs/Architect/frontend"

echo "=========================================="
echo "Adding Mapbox Token to .env file"
echo "=========================================="
echo ""
echo "Please enter your Mapbox token (starts with pk.):"
read -r TOKEN

if [ -z "$TOKEN" ]; then
    echo "Error: No token provided"
    exit 1
fi

# Update .env file
cat > .env << EOF
VITE_API_URL=http://localhost:3001/api
VITE_MAPBOX_TOKEN=$TOKEN
EOF

echo ""
echo "✅ Token added to .env file!"
echo ""
echo "Current .env content:"
cat .env
echo ""
echo "⚠️  IMPORTANT: You must restart the frontend server for changes to take effect!"
echo ""
echo "To restart:"
echo "1. Stop the current server (Ctrl+C in the terminal running 'npm run dev')"
echo "2. Run: cd frontend && npm run dev"
echo ""

