# Deploy Admin Session Fix - Automated Build & Package Script
# This script rebuilds the Next.js app and creates a deployment package

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║       ERSA TRAINING - ADMIN SESSION FIX DEPLOYMENT           ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📁 Working Directory: $scriptPath" -ForegroundColor Green
Write-Host ""

# Step 1: Verify files exist
Write-Host "Step 1: Verifying changed files..." -ForegroundColor Yellow
Write-Host ""

$requiredFiles = @(
    "hooks\useAdminSession.ts",
    "app\[locale]\admin\layout.tsx"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ Found: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Missing: $file" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "❌ ERROR: Required files are missing!" -ForegroundColor Red
    Write-Host "Please ensure all files were created properly." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Clean old build
Write-Host "Step 2: Cleaning old build..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Path ".next" -Recurse -Force
    Write-Host "  ✓ Removed old .next folder" -ForegroundColor Green
} else {
    Write-Host "  ℹ No old .next folder found" -ForegroundColor Gray
}
Write-Host ""

# Step 3: Rebuild application
Write-Host "Step 3: Building Next.js application..." -ForegroundColor Yellow
Write-Host "  ⏳ This may take 2-3 minutes..." -ForegroundColor Gray
Write-Host ""

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Please fix the build errors and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  ✓ Build completed successfully!" -ForegroundColor Green
Write-Host ""

# Step 4: Create deployment package
Write-Host "Step 4: Creating deployment package..." -ForegroundColor Yellow

$deploymentFolder = "deployment-session-fix"
if (Test-Path $deploymentFolder) {
    Remove-Item -Path $deploymentFolder -Recurse -Force
}
New-Item -Path $deploymentFolder -ItemType Directory | Out-Null

Write-Host "  📦 Copying files..." -ForegroundColor Gray

# Copy essential folders and files
$itemsToCopy = @(
    @{Source=".next"; Dest="$deploymentFolder\.next"; IsFolder=$true},
    @{Source="hooks"; Dest="$deploymentFolder\hooks"; IsFolder=$true},
    @{Source="app"; Dest="$deploymentFolder\app"; IsFolder=$true},
    @{Source="public"; Dest="$deploymentFolder\public"; IsFolder=$true},
    @{Source="messages"; Dest="$deploymentFolder\messages"; IsFolder=$true},
    @{Source="locales"; Dest="$deploymentFolder\locales"; IsFolder=$true},
    @{Source="lib"; Dest="$deploymentFolder\lib"; IsFolder=$true},
    @{Source="components"; Dest="$deploymentFolder\components"; IsFolder=$true},
    @{Source="next.config.js"; Dest="$deploymentFolder\next.config.js"; IsFolder=$false},
    @{Source="start.js"; Dest="$deploymentFolder\start.js"; IsFolder=$false},
    @{Source="web.config"; Dest="$deploymentFolder\web.config"; IsFolder=$false},
    @{Source="package.json"; Dest="$deploymentFolder\package.json"; IsFolder=$false},
    @{Source="package-lock.json"; Dest="$deploymentFolder\package-lock.json"; IsFolder=$false}
)

foreach ($item in $itemsToCopy) {
    if (Test-Path $item.Source) {
        if ($item.IsFolder) {
            Copy-Item -Path $item.Source -Destination $item.Dest -Recurse -Force
            Write-Host "    ✓ Copied: $($item.Source)" -ForegroundColor Green
        } else {
            Copy-Item -Path $item.Source -Destination $item.Dest -Force
            Write-Host "    ✓ Copied: $($item.Source)" -ForegroundColor Green
        }
    } else {
        Write-Host "    ⚠ Skipped (not found): $($item.Source)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 5: Create ZIP file
Write-Host "Step 5: Creating ZIP archive..." -ForegroundColor Yellow

$zipPath = "ersa-session-fix.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$deploymentFolder\*" -DestinationPath $zipPath -Force
Write-Host "  ✓ Created: $zipPath" -ForegroundColor Green
Write-Host ""

# Step 6: Create upload instructions
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$uploadInstructions = @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           DEPLOYMENT PACKAGE READY FOR UPLOAD                 ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 PACKAGE CREATED: $zipPath
📁 SIZE: $((Get-Item $zipPath).Length / 1MB | Format-Number -DecimalDigits 2) MB
🕐 CREATED: $timestamp

╔═══════════════════════════════════════════════════════════════╗
║                    UPLOAD INSTRUCTIONS                        ║
╚═══════════════════════════════════════════════════════════════╝

OPTION A - UPLOAD COMPLETE PACKAGE (Recommended):
════════════════════════════════════════════════════════════════
1. Login to SmarterASP.NET Control Panel
2. Open File Manager
3. Navigate to your site root directory
4. BACKUP: Download current site as backup (optional but recommended)
5. DELETE old files:
   - .next folder
   - hooks folder (if exists)
   - app folder
6. UPLOAD: $zipPath
7. EXTRACT the ZIP file in place
8. DELETE the ZIP file after extraction
9. RESTART Node.js application in control panel
10. TEST the site

OPTION B - UPLOAD ONLY CHANGED FILES (Faster):
════════════════════════════════════════════════════════════════
1. Login to SmarterASP.NET Control Panel
2. Open File Manager
3. Navigate to your site root directory
4. DELETE: .next folder (IMPORTANT!)
5. UPLOAD from $deploymentFolder folder:
   - .next folder (NEW - contains updated code)
   - hooks folder (contains new useAdminSession.ts)
   - app/[locale]/admin/layout.tsx (updated file)
6. RESTART Node.js application
7. TEST the site

╔═══════════════════════════════════════════════════════════════╗
║                    TESTING CHECKLIST                          ║
╚═══════════════════════════════════════════════════════════════╝

After deployment, verify:

□ Clear browser cache (Ctrl + Shift + Delete)
□ Visit: https://yourdomain/en/admin-login
□ Login successfully
□ Navigate to any admin page
□ Check browser console (F12) - no errors
□ Leave page idle for 25 minutes - warning should appear
□ Move mouse - timer resets
□ Session stays active with activity
□ Session logs out after 30 min of complete inactivity

╔═══════════════════════════════════════════════════════════════╗
║                      FILES CHANGED                            ║
╚═══════════════════════════════════════════════════════════════╝

✨ NEW:
   - hooks/useAdminSession.ts

🔄 UPDATED:
   - app/[locale]/admin/layout.tsx
   - .next/* (rebuilt with new code)

╔═══════════════════════════════════════════════════════════════╗
║                    TROUBLESHOOTING                            ║
╚═══════════════════════════════════════════════════════════════╝

Issue: "Module not found: useAdminSession"
Solution: Ensure hooks folder was uploaded correctly

Issue: Still logging out quickly
Solution: 
  1. Verify .next folder was rebuilt (check timestamp)
  2. Clear browser cache completely
  3. Check Node.js error logs on server

Issue: Site not loading
Solution:
  1. Check Node.js is running in control panel
  2. Verify start.js exists
  3. Check error logs

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✅ DEPLOYMENT PACKAGE IS READY!                              ║
║                                                               ║
║  Next step: Upload to your server using the instructions     ║
║  above, then restart the Node.js application.                ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@

$uploadInstructions | Out-File -FilePath "UPLOAD_INSTRUCTIONS.txt" -Encoding UTF8
Write-Host $uploadInstructions
Write-Host ""

# Summary
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║                    ✅ BUILD SUCCESSFUL!                        ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package Location: $scriptPath\$zipPath" -ForegroundColor Cyan
Write-Host "📄 Instructions: $scriptPath\UPLOAD_INSTRUCTIONS.txt" -ForegroundColor Cyan
Write-Host "📁 Files Directory: $scriptPath\$deploymentFolder\" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Read UPLOAD_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "  2. Upload $zipPath to your server" -ForegroundColor White
Write-Host "  3. Extract and restart Node.js" -ForegroundColor White
Write-Host "  4. Test the admin session timeout" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

