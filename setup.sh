#!/bin/bash
# Setup script for Forsyth Games Portal
# This copies static files to the public directory for Next.js to serve

echo "Setting up static files for Next.js..."

# Create public directory if it doesn't exist
mkdir -p public

# Copy game files
echo "Copying games..."
cp -r games public/

# Copy utilities
echo "Copying utilities..."
cp -r utilities public/

# Copy assets
echo "Copying assets..."
cp -r assets public/

echo "✅ Setup complete! Static files are ready."
echo "Run 'npm run dev' to start the development server."
