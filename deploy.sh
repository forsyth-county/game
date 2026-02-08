#!/bin/bash

# GitHub Pages Deployment Script for Forsyth Portal

echo "🚀 Starting GitHub Pages deployment..."

# Clean previous build
echo "🧹 Cleaning previous build..."
rm -rf .next
rm -rf out

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Navigate to output directory
cd out

# Create .nojekyll file to bypass Jekyll processing
touch .nojekyll

# Copy index.html to 404.html for SPA routing
cp index.html 404.html

# Initialize git if not already done
if [ ! -d ".git" ]; then
  git init
  git branch -M main
fi

# Configure git
git config user.name "GitHub Actions"
git config user.email "actions@github.com"

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Deploy to GitHub Pages - $(date)"

# Push to gh-pages branch (or main based on your repo settings)
echo "📤 Pushing to GitHub Pages..."
git push -f https://github.com/forsyth-county/portal.git main:gh-pages

echo "✅ Deployment complete!"
echo "🌐 Site will be available at: https://forsyth-county.github.io/portal/"
