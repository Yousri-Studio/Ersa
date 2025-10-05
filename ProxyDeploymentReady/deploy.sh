#!/bin/bash

# Ersa Training Frontend - Deployment Script
# This script deploys the frontend to production

echo "================================================"
echo "   Ersa Training Frontend - Deployment"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18.x or later."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18.x or later. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ .env.production file not found!"
    exit 1
fi

echo "✅ Configuration file found"
echo ""
echo "Current configuration:"
cat .env.production
echo ""

# Ask for confirmation
read -p "Do you want to proceed with deployment? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed"
echo ""

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    echo "🚀 Starting application with PM2..."
    pm2 delete ersa-frontend 2>/dev/null || true
    pm2 start npm --name "ersa-frontend" -- start
    pm2 save
    echo "✅ Application started with PM2"
    echo ""
    echo "To view logs: pm2 logs ersa-frontend"
    echo "To stop: pm2 stop ersa-frontend"
    echo "To restart: pm2 restart ersa-frontend"
else
    echo "⚠️  PM2 not found. Starting application with npm..."
    echo "Tip: Install PM2 for better process management: npm install -g pm2"
    echo ""
    echo "Starting application..."
    npm start &
    echo "✅ Application started"
fi

echo ""
echo "================================================"
echo "   ✅ Deployment Complete!"
echo "================================================"
echo ""
echo "Application is running at: http://localhost:3000"
echo ""
echo "Next steps:"
echo "1. Configure reverse proxy (Nginx/Apache)"
echo "2. Set up SSL certificate"
echo "3. Configure firewall rules"
echo ""
echo "For detailed instructions, see DEPLOYMENT_INSTRUCTIONS.md"

