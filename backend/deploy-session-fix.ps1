# Backend Session Fix - Build and Package Script

Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "║     ERSA TRAINING - BACKEND SESSION FIX DEPLOYMENT           ║" -ForegroundColor Cyan
Write-Host "║                                                               ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Get the script directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location "$scriptPath\src"

Write-Host "📁 Working Directory: $scriptPath\src" -ForegroundColor Green
Write-Host ""

# Step 1: Display changes
Write-Host "Step 1: Changes made to fix session timeout..." -ForegroundColor Yellow
Write-Host ""
Write-Host "  📝 Modified Files:" -ForegroundColor White
Write-Host "     • appsettings.json - Added ClockSkewMinutes and AdminExpirationInHours" -ForegroundColor Gray
Write-Host "     • Program.cs - Changed ClockSkew from Zero to configurable" -ForegroundColor Gray
Write-Host "     • Services/JwtService.cs - Added admin-specific token expiration" -ForegroundColor Gray
Write-Host ""
Write-Host "  🎯 What This Fixes:" -ForegroundColor White
Write-Host "     • Admin sessions lasting only seconds/minutes" -ForegroundColor Gray
Write-Host "     • Immediate logout due to time sync issues" -ForegroundColor Gray
Write-Host "     • No separate admin vs regular user session duration" -ForegroundColor Gray
Write-Host ""

# Step 2: Clean old build
Write-Host "Step 2: Cleaning old build..." -ForegroundColor Yellow
if (Test-Path "bin") {
    Remove-Item -Path "bin" -Recurse -Force
    Write-Host "  ✓ Removed old bin folder" -ForegroundColor Green
}
if (Test-Path "obj") {
    Remove-Item -Path "obj" -Recurse -Force
    Write-Host "  ✓ Removed old obj folder" -ForegroundColor Green
}
if (Test-Path "publish") {
    Remove-Item -Path "publish" -Recurse -Force
    Write-Host "  ✓ Removed old publish folder" -ForegroundColor Green
}
Write-Host ""

# Step 3: Restore packages
Write-Host "Step 3: Restoring NuGet packages..." -ForegroundColor Yellow
dotnet restore
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Package restore failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Packages restored successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Build
Write-Host "Step 4: Building project..." -ForegroundColor Yellow
dotnet build --configuration Release
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Build failed!" -ForegroundColor Red
    Write-Host "Please fix the build errors and try again." -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Build completed successfully" -ForegroundColor Green
Write-Host ""

# Step 5: Publish
Write-Host "Step 5: Publishing for deployment..." -ForegroundColor Yellow
dotnet publish --configuration Release --output "publish"
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERROR: Publish failed!" -ForegroundColor Red
    exit 1
}
Write-Host "  ✓ Published successfully to ./publish folder" -ForegroundColor Green
Write-Host ""

# Step 6: Create deployment package
Write-Host "Step 6: Creating deployment package..." -ForegroundColor Yellow

Set-Location $scriptPath

$deploymentFolder = "deployment-session-fix"
if (Test-Path $deploymentFolder) {
    Remove-Item -Path $deploymentFolder -Recurse -Force
}
New-Item -Path $deploymentFolder -ItemType Directory | Out-Null

# Copy published files
Copy-Item -Path "src\publish\*" -Destination $deploymentFolder -Recurse -Force
Write-Host "  ✓ Copied published files" -ForegroundColor Green

# Ensure appsettings.json has the new settings
$appsettingsPath = "$deploymentFolder\appsettings.json"
if (Test-Path $appsettingsPath) {
    $appsettings = Get-Content $appsettingsPath -Raw | ConvertFrom-Json
    if ($appsettings.Jwt.PSObject.Properties.Name -contains "ClockSkewMinutes") {
        Write-Host "  ✓ Verified appsettings.json has new JWT settings" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ WARNING: appsettings.json may be missing new settings!" -ForegroundColor Yellow
    }
}

# Create ZIP
$zipPath = "backend-session-fix.zip"
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

Compress-Archive -Path "$deploymentFolder\*" -DestinationPath $zipPath -Force
Write-Host "  ✓ Created: $zipPath" -ForegroundColor Green
Write-Host ""

# Step 7: Create upload instructions
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$instructions = @"
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║        BACKEND DEPLOYMENT PACKAGE READY FOR UPLOAD            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝

📦 PACKAGE: $zipPath
📁 SIZE: $((Get-Item $zipPath).Length / 1MB | ForEach-Object { "{0:N2}" -f $_ }) MB
🕐 CREATED: $timestamp

╔═══════════════════════════════════════════════════════════════╗
║                   DEPLOYMENT INSTRUCTIONS                     ║
╚═══════════════════════════════════════════════════════════════╝

OPTION A - Complete Backend Replacement (Safest):
════════════════════════════════════════════════════════════════
1. BACKUP current backend files on server (IMPORTANT!)
2. Login to your hosting control panel
3. Navigate to backend API folder
4. Upload: $zipPath
5. Extract all files (replace existing)
6. Delete the ZIP file
7. Verify appsettings.json has:
   - ClockSkewMinutes: 5
   - AdminExpirationInHours: 8
8. Restart IIS / Backend service
9. Test API: http://yourapi.com/api/health

OPTION B - Update Only Changed Files (Advanced):
════════════════════════════════════════════════════════════════
1. From the $deploymentFolder folder, upload:
   - appsettings.json (NEW settings)
   - ErsaTraining.API.dll (recompiled)
   - All other DLL files in the folder
2. Restart IIS / Backend service
3. Test API

╔═══════════════════════════════════════════════════════════════╗
║                    CRITICAL SETTINGS                          ║
╚═══════════════════════════════════════════════════════════════╝

In appsettings.json, verify these settings exist:

{
  "Jwt": {
    "SecretKey": "...",
    "Issuer": "ErsaTraining.API",
    "Audience": "ErsaTraining.Web",
    "ExpirationInDays": 7,
    "AdminExpirationInHours": 8,      ← NEW
    "ClockSkewMinutes": 5              ← NEW
  }
}

╔═══════════════════════════════════════════════════════════════╗
║                      TESTING                                  ║
╚═══════════════════════════════════════════════════════════════╝

After deployment:

1. Test API is running:
   GET http://yourapi.com/api/health

2. Test admin login:
   POST http://yourapi.com/api/auth/login
   Body: { "email": "admin@example.com", "password": "..." }

3. Verify token expiration:
   - Copy the token from login response
   - Go to https://jwt.io
   - Paste token and check 'exp' claim
   - Should be ~8 hours from now for admin users

4. Test in frontend:
   - Login to admin panel
   - Should stay logged in much longer
   - No immediate unexpected logouts

╔═══════════════════════════════════════════════════════════════╗
║                     WHAT WAS FIXED                            ║
╚═══════════════════════════════════════════════════════════════╝

❌ BEFORE:
   • ClockSkew = TimeSpan.Zero (too strict)
   • Any time difference caused immediate logout
   • All users had same 7-day token
   • Poor admin experience

✅ AFTER:
   • ClockSkew = 5 minutes (tolerant)
   • Admin users: 8-hour tokens
   • Regular users: 7-day tokens
   • Much better session management

╔═══════════════════════════════════════════════════════════════╗
║                    TROUBLESHOOTING                            ║
╚═══════════════════════════════════════════════════════════════╝

Issue: API won't start after deployment
Solution:
  • Check IIS logs
  • Verify all DLLs uploaded correctly
  • Ensure appsettings.json is valid JSON
  • Check database connection string

Issue: Still getting immediate logouts
Solution:
  • Verify appsettings.json has ClockSkewMinutes: 5
  • Restart backend service completely
  • Clear browser cache on frontend
  • Check backend logs for authentication errors

Issue: Tokens not lasting 8 hours
Solution:
  • Verify appsettings.json has AdminExpirationInHours: 8
  • Check user has IsAdmin or IsSuperAdmin = true
  • Decode token at jwt.io to verify expiration time

╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║  ✅ DEPLOYMENT PACKAGE IS READY!                              ║
║                                                               ║
║  Deploy backend FIRST, then deploy frontend changes.          ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
"@

$instructions | Out-File -FilePath "BACKEND_UPLOAD_INSTRUCTIONS.txt" -Encoding UTF8

# Summary
Write-Host "╔═══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "║                 ✅ BUILD SUCCESSFUL!                           ║" -ForegroundColor Green
Write-Host "║                                                               ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📦 Package Location: $scriptPath\$zipPath" -ForegroundColor Cyan
Write-Host "📄 Instructions: $scriptPath\BACKEND_UPLOAD_INSTRUCTIONS.txt" -ForegroundColor Cyan
Write-Host "📁 Files Directory: $scriptPath\$deploymentFolder\" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANT:" -ForegroundColor Yellow
Write-Host "   Deploy BACKEND first, then deploy frontend!" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Read BACKEND_UPLOAD_INSTRUCTIONS.txt" -ForegroundColor White
Write-Host "  2. Backup current backend on server" -ForegroundColor White
Write-Host "  3. Upload $zipPath to server" -ForegroundColor White
Write-Host "  4. Extract and restart backend service" -ForegroundColor White
Write-Host "  5. Test API to ensure it's working" -ForegroundColor White
Write-Host "  6. Then deploy frontend changes" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

