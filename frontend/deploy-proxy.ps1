# API Proxy Deployment Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  API PROXY DEPLOYMENT SCRIPT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$frontendPath = "d:\Data\work\Ersa\frontend"
$deploymentPath = "$frontendPath\deployment"

Write-Host "Step 1: Checking build..." -ForegroundColor Yellow

if (!(Test-Path "$frontendPath\.next")) {
    Write-Host "ERROR: Build not found!" -ForegroundColor Red
    Write-Host "Please run: npx next build" -ForegroundColor Yellow
    exit 1
}

Write-Host "Build found" -ForegroundColor Green

if (!(Test-Path "$frontendPath\.next\server\app\api\proxy\route.js")) {
    Write-Host "ERROR: Proxy route not built!" -ForegroundColor Red
    Write-Host "The proxy route might not have been included in the build." -ForegroundColor Yellow
    exit 1
}

Write-Host "Proxy route found in build" -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Copying files to deployment folder..." -ForegroundColor Yellow

if (Test-Path "$deploymentPath\.next") {
    Remove-Item "$deploymentPath\.next" -Recurse -Force
    Write-Host "Removed old .next folder" -ForegroundColor Green
}

Copy-Item "$frontendPath\.next" "$deploymentPath\.next" -Recurse -Force
Write-Host "Copied new .next folder" -ForegroundColor Green

Copy-Item "$frontendPath\.env.production" "$deploymentPath\.env.production" -Force
Write-Host "Copied .env.production" -ForegroundColor Green

Copy-Item "$frontendPath\package.json" "$deploymentPath\package.json" -Force
Copy-Item "$frontendPath\package-lock.json" "$deploymentPath\package-lock.json" -Force
Write-Host "Copied package files" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Verification..." -ForegroundColor Yellow

if (Test-Path "$deploymentPath\.next\server\app\api\proxy\route.js") {
    Write-Host "Proxy route exists in deployment" -ForegroundColor Green
} else {
    Write-Host "WARNING: Proxy route not found in deployment!" -ForegroundColor Red
}

$envContent = Get-Content "$deploymentPath\.env.production" -Raw
if ($envContent -match "/api/proxy") {
    Write-Host ".env.production configured for proxy" -ForegroundColor Green
} else {
    Write-Host "WARNING: .env.production not configured correctly!" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOYMENT FOLDER READY!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Compress the deployment folder to ZIP" -ForegroundColor White
Write-Host "2. Upload to SmarterASP.NET" -ForegroundColor White
Write-Host "3. Extract in wwwroot" -ForegroundColor White
Write-Host "4. Update .env.production on server if needed" -ForegroundColor White
Write-Host "5. Restart Node.js application" -ForegroundColor White
Write-Host "6. Test: https://ersa-training.com/api/proxy?endpoint=courses" -ForegroundColor White
Write-Host ""
Write-Host "Deployment folder: $deploymentPath" -ForegroundColor Cyan
Write-Host ""

$createZip = Read-Host "Create deployment ZIP now? (Y/N)"
if ($createZip -eq 'Y' -or $createZip -eq 'y') {
    Write-Host ""
    Write-Host "Creating ZIP..." -ForegroundColor Yellow
    
    $zipPath = "$frontendPath\deployment-with-proxy.zip"
    if (Test-Path $zipPath) {
        Remove-Item $zipPath -Force
    }
    
    Compress-Archive -Path "$deploymentPath\*" -DestinationPath $zipPath -Force
    
    if (Test-Path $zipPath) {
        $zipSize = (Get-Item $zipPath).Length / 1MB
        Write-Host "ZIP created successfully!" -ForegroundColor Green
        Write-Host "Location: $zipPath" -ForegroundColor Cyan
        Write-Host "Size: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
        Write-Host ""
        
        $openFolder = Read-Host "Open folder? (Y/N)"
        if ($openFolder -eq 'Y' -or $openFolder -eq 'y') {
            explorer.exe $frontendPath
        }
    } else {
        Write-Host "Failed to create ZIP" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done!" -ForegroundColor Green
