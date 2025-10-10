# Production Deployment Script for Ersa Training Frontend
# This script helps deploy the Next.js application to IIS

param(
    [Parameter(Mandatory=$false)]
    [string]$DeployPath = "C:\inetpub\wwwroot\ersa-frontend",
    
    [Parameter(Mandatory=$false)]
    [string]$AppPoolName = "ErsaFrontendPool",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipRestart
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Ersa Training Frontend Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to check if running as administrator
function Test-Administrator {
    $currentUser = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentUser)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

# Check if running as admin
if (-not (Test-Administrator)) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some operations may fail without admin privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Build the application
if (-not $SkipBuild) {
    Write-Host "📦 Step 1: Building application..." -ForegroundColor Green
    
    # Check if we're in the frontend directory
    if (-not (Test-Path "package.json")) {
        Write-Host "❌ Error: package.json not found. Are you in the frontend directory?" -ForegroundColor Red
        exit 1
    }
    
    # Run build
    Write-Host "   Running: npm run build" -ForegroundColor Gray
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed! Please fix errors and try again." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "⏭️  Skipping build (--SkipBuild specified)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 2: Verify required files
Write-Host "🔍 Step 2: Verifying required files..." -ForegroundColor Green

$requiredFiles = @(
    "web.config",
    "start.js",
    "package.json",
    "next.config.js"
)

$requiredFolders = @(
    ".next",
    "public"
)

$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "   ❌ Missing: $file" -ForegroundColor Red
    } else {
        Write-Host "   ✅ Found: $file" -ForegroundColor Gray
    }
}

foreach ($folder in $requiredFolders) {
    if (-not (Test-Path $folder)) {
        $missingFiles += $folder
        Write-Host "   ❌ Missing: $folder" -ForegroundColor Red
    } else {
        Write-Host "   ✅ Found: $folder" -ForegroundColor Gray
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "❌ Missing required files/folders!" -ForegroundColor Red
    Write-Host "   Please ensure all files are present before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ All required files present" -ForegroundColor Green
Write-Host ""

# Step 3: Create backup (if deployment path exists)
if (Test-Path $DeployPath) {
    Write-Host "💾 Step 3: Creating backup..." -ForegroundColor Green
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupPath = "$DeployPath" + "_backup_$timestamp"
    
    try {
        Write-Host "   Backing up to: $backupPath" -ForegroundColor Gray
        Copy-Item -Path $DeployPath -Destination $backupPath -Recurse -Force
        Write-Host "✅ Backup created successfully" -ForegroundColor Green
        Write-Host "   Location: $backupPath" -ForegroundColor Gray
    } catch {
        Write-Host "⚠️  Warning: Could not create backup: $_" -ForegroundColor Yellow
        Write-Host "   Continuing anyway..." -ForegroundColor Yellow
    }
    Write-Host ""
} else {
    Write-Host "ℹ️  Step 3: No existing deployment found, skipping backup" -ForegroundColor Cyan
    Write-Host ""
}

# Step 4: Deploy files
Write-Host "📤 Step 4: Deploying files to $DeployPath..." -ForegroundColor Green

# Create deployment directory if it doesn't exist
if (-not (Test-Path $DeployPath)) {
    Write-Host "   Creating deployment directory..." -ForegroundColor Gray
    New-Item -ItemType Directory -Path $DeployPath -Force | Out-Null
}

# Files and folders to deploy
$itemsToDeploy = @(
    ".next",
    "public",
    "messages",
    "web.config",
    "start.js",
    "package.json",
    "package-lock.json",
    "next.config.js",
    "i18n.ts"
)

foreach ($item in $itemsToDeploy) {
    if (Test-Path $item) {
        Write-Host "   Copying: $item" -ForegroundColor Gray
        
        if (Test-Path $item -PathType Container) {
            # It's a directory
            $destPath = Join-Path $DeployPath $item
            if (Test-Path $destPath) {
                Remove-Item -Path $destPath -Recurse -Force
            }
            Copy-Item -Path $item -Destination $destPath -Recurse -Force
        } else {
            # It's a file
            Copy-Item -Path $item -Destination $DeployPath -Force
        }
    } else {
        Write-Host "   ⚠️  Skipping: $item (not found)" -ForegroundColor Yellow
    }
}

Write-Host "✅ Files deployed successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Install/Update dependencies on server
Write-Host "📦 Step 5: Installing production dependencies..." -ForegroundColor Green
Write-Host "   This may take a few minutes..." -ForegroundColor Gray

$currentPath = Get-Location
Set-Location $DeployPath

npm install --production --no-optional

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Warning: npm install had some issues" -ForegroundColor Yellow
    Write-Host "   You may need to run it manually on the server" -ForegroundColor Yellow
} else {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}

Set-Location $currentPath
Write-Host ""

# Step 6: Set permissions
Write-Host "🔒 Step 6: Setting permissions..." -ForegroundColor Green

try {
    # Grant read permissions to entire directory
    icacls $DeployPath /grant "IIS AppPool\$AppPoolName:(OI)(CI)R" /T /Q
    
    # Grant full control to .next directory
    $nextPath = Join-Path $DeployPath ".next"
    if (Test-Path $nextPath) {
        icacls $nextPath /grant "IIS AppPool\$AppPoolName:(OI)(CI)F" /T /Q
    }
    
    Write-Host "✅ Permissions set successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Warning: Could not set permissions: $_" -ForegroundColor Yellow
    Write-Host "   You may need to set them manually" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Restart IIS
if (-not $SkipRestart) {
    Write-Host "🔄 Step 7: Restarting IIS Application Pool..." -ForegroundColor Green
    
    try {
        # Try to restart the app pool
        Restart-WebAppPool -Name $AppPoolName -ErrorAction Stop
        Write-Host "✅ Application pool restarted successfully" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Warning: Could not restart app pool: $_" -ForegroundColor Yellow
        Write-Host "   Trying full IIS reset..." -ForegroundColor Yellow
        
        try {
            iisreset
            Write-Host "✅ IIS restarted successfully" -ForegroundColor Green
        } catch {
            Write-Host "❌ Could not restart IIS: $_" -ForegroundColor Red
            Write-Host "   Please restart manually" -ForegroundColor Red
        }
    }
} else {
    Write-Host "⏭️  Skipping restart (--SkipRestart specified)" -ForegroundColor Yellow
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📍 Deployment Path: $DeployPath" -ForegroundColor White
Write-Host "🔄 App Pool: $AppPoolName" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Test the site: https://ersa-training.com" -ForegroundColor Gray
Write-Host "2. Check for any errors in browser console" -ForegroundColor Gray
Write-Host "3. Verify static assets load correctly" -ForegroundColor Gray
Write-Host "4. Test admin panel and API connectivity" -ForegroundColor Gray
Write-Host ""
Write-Host "📋 Logs locations:" -ForegroundColor Yellow
Write-Host "   IIS: C:\inetpub\logs\LogFiles\" -ForegroundColor Gray
Write-Host "   iisnode: $DeployPath\iisnode\" -ForegroundColor Gray
Write-Host ""
Write-Host "If you encounter issues, check PRODUCTION_DEPLOYMENT_FIX.md" -ForegroundColor Cyan
Write-Host ""

