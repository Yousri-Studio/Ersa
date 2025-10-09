# Ersa Training Frontend - Deployment Script (Windows)
# This script deploys the frontend to production on Windows

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Ersa Training Frontend - Deployment" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18.x or later." -ForegroundColor Red
    exit 1
}

# Check if .env.production exists
if (!(Test-Path ".env.production")) {
    Write-Host "❌ .env.production file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuration file found" -ForegroundColor Green
Write-Host ""
Write-Host "Current configuration:" -ForegroundColor Yellow
Get-Content .env.production
Write-Host ""

# Ask for confirmation
$confirmation = Read-Host "Do you want to proceed with deployment? (y/n)"
if ($confirmation -ne 'y') {
    Write-Host "Deployment cancelled." -ForegroundColor Yellow
    exit 0
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install --production

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Check if PM2 is installed
try {
    $pm2Version = pm2 --version
    Write-Host "🚀 Starting application with PM2..." -ForegroundColor Cyan
    pm2 delete ersa-frontend 2>$null
    pm2 start npm --name "ersa-frontend" -- start
    pm2 save
    Write-Host "✅ Application started with PM2" -ForegroundColor Green
    Write-Host ""
    Write-Host "To view logs: pm2 logs ersa-frontend" -ForegroundColor Yellow
    Write-Host "To stop: pm2 stop ersa-frontend" -ForegroundColor Yellow
    Write-Host "To restart: pm2 restart ersa-frontend" -ForegroundColor Yellow
} catch {
    Write-Host "⚠️  PM2 not found. Starting application with npm..." -ForegroundColor Yellow
    Write-Host "Tip: Install PM2 for better process management: npm install -g pm2" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting application..." -ForegroundColor Cyan
    Start-Process -NoNewWindow npm -ArgumentList "start"
    Write-Host "✅ Application started" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   ✅ Deployment Complete!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Application is running at: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Configure reverse proxy (IIS/Nginx)" -ForegroundColor White
Write-Host "2. Set up SSL certificate" -ForegroundColor White
Write-Host "3. Configure firewall rules" -ForegroundColor White
Write-Host ""
Write-Host "For detailed instructions, see DEPLOYMENT_INSTRUCTIONS.md" -ForegroundColor Yellow








