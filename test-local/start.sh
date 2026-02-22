#!/bin/bash

echo "================================================"
echo "Video Looper - Local Test Server (Linux/Mac)"
echo "================================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

# Create videos directory if it doesn't exist
if [ ! -d "videos" ]; then
    echo "Creating videos directory..."
    mkdir -p videos
    echo ""
    echo "Please add some video files to: $(pwd)/videos"
    echo ""
fi

# Start the server
echo "Starting server..."
echo ""
node local-server.js
