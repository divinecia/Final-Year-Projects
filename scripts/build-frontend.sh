#!/bin/bash

# Frontend-only build script for Firebase Hosting
# This script temporarily moves API routes during build

echo "🔥 Building Frontend-only version for Firebase Hosting..."

# Create backup directory
mkdir -p .api-backup

# Move API routes temporarily
if [ -d "app/api" ]; then
    echo "📦 Backing up API routes..."
    mv app/api .api-backup/api
fi

# Set build target for static export
export BUILD_TARGET=static

# Run the build
echo "🏗️ Building static export..."
next build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    
    # Restore API routes
    if [ -d ".api-backup/api" ]; then
        echo "🔄 Restoring API routes..."
        mv .api-backup/api app/api
        rmdir .api-backup
    fi
    
    echo "🚀 Static build complete! Files are in the 'out' directory."
    echo "📁 You can now deploy the 'out' directory to Firebase Hosting."
else
    echo "❌ Build failed!"
    
    # Restore API routes even if build failed
    if [ -d ".api-backup/api" ]; then
        echo "🔄 Restoring API routes..."
        mv .api-backup/api app/api
        rmdir .api-backup
    fi
    
    exit 1
fi
