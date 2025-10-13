# ==========================================
# Deploy Admin 500 Error Fix
# ==========================================

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host " ADMIN 500 ERROR FIX - DEPLOYMENT"        -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory
Set-Location $PSScriptRoot

# Check if we're in the correct directory
Write-Host "[1/5] Checking if we're in the correct directory..." -ForegroundColor Yellow
if (!(Test-Path "frontend\package.json")) {
    Write-Host "ERROR: frontend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "[2/5] Installing dependencies (if needed)..." -ForegroundColor Yellow
Set-Location frontend
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: npm install failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[3/5] Building production frontend..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "[4/5] Creating deployment package..." -ForegroundColor Yellow

$deploymentPath = "..\deployment"
if (!(Test-Path $deploymentPath)) {
    New-Item -ItemType Directory -Path $deploymentPath | Out-Null
}

Write-Host "  - Cleaning old .next folder..." -ForegroundColor Gray
if (Test-Path "$deploymentPath\.next") {
    Remove-Item "$deploymentPath\.next" -Recurse -Force
}

Write-Host "  - Copying new .next build..." -ForegroundColor Gray
Copy-Item ".next" "$deploymentPath\.next" -Recurse -Force

Write-Host "  - Copying environment files..." -ForegroundColor Gray
if (Test-Path ".env.production") {
    Copy-Item ".env.production" "$deploymentPath\.env.production" -Force
}

Write-Host "  - Copying package files..." -ForegroundColor Gray
Copy-Item "package.json" "$deploymentPath\package.json" -Force
if (Test-Path "package-lock.json") {
    Copy-Item "package-lock.json" "$deploymentPath\package-lock.json" -Force
}

Write-Host "  - Copying public files..." -ForegroundColor Gray
if (Test-Path "$deploymentPath\public") {
    Remove-Item "$deploymentPath\public" -Recurse -Force
}
Copy-Item "public" "$deploymentPath\public" -Recurse -Force

Write-Host "  - Copying configuration files..." -ForegroundColor Gray
if (Test-Path "next.config.js") {
    Copy-Item "next.config.js" "$deploymentPath\next.config.js" -Force
}

Write-Host ""
Write-Host "[5/5] Verifying build..." -ForegroundColor Yellow
if (Test-Path ".next\BUILD_ID") {
    $buildId = Get-Content ".next\BUILD_ID" -Raw
    Write-Host "  Build ID: $buildId" -ForegroundColor Green
} else {
    Write-Host "  WARNING: BUILD_ID not found!" -ForegroundColor Yellow
}

if (Test-Path "$deploymentPath\.next\server\app\api\proxy\route.js") {
    Write-Host "  ✓ Proxy route exists" -ForegroundColor Green
} else {
    Write-Host "  WARNING: Proxy route not found!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================"  -ForegroundColor Cyan
Write-Host " BUILD COMPLETE!"                         -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Check the 'deployment' folder" -ForegroundColor White
Write-Host "2. Upload contents to your production server" -ForegroundColor White
Write-Host "3. Make sure .env.production is configured:" -ForegroundColor White
Write-Host "   NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=" -ForegroundColor Gray
Write-Host "   BACKEND_API_URL=http://api.ersa-training.com/api" -ForegroundColor Gray
Write-Host ""
Write-Host "Files ready for deployment:" -ForegroundColor White
Write-Host "- deployment\.next\       (build output)" -ForegroundColor Gray
Write-Host "- deployment\public\      (static files)" -ForegroundColor Gray
Write-Host "- deployment\package.json" -ForegroundColor Gray
Write-Host "- deployment\.env.production" -ForegroundColor Gray
Write-Host ""
Write-Host "IMPORTANT: Clear browser cache after deployment!" -ForegroundColor Yellow
Write-Host ""

Set-Location ..
Read-Host "Press Enter to exit"

