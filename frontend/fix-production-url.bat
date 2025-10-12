@echo off
echo.
echo ============================================================
echo   FIX PRODUCTION URL - Quick Deploy
echo ============================================================
echo.
echo This will:
echo   1. Create .env.production with correct URL
echo   2. Rebuild frontend
echo   3. Create deployment package
echo.
echo Press any key to continue...
pause > nul

cd /d "%~dp0"

echo.
echo Step 1: Creating .env.production file...
echo.

(
echo NODE_ENV=production
echo NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
echo BACKEND_API_URL=http://api.ersa-training.com/api
echo PORT=3000
) > .env.production

echo ✓ Created .env.production
echo.
echo Contents:
type .env.production
echo.

echo Step 2: Cleaning old build...
if exist .next rmdir /s /q .next
if exist deployment-url-fix rmdir /s /q deployment-url-fix
echo ✓ Cleaned
echo.

echo Step 3: Building application...
echo This may take 2-3 minutes...
echo.
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ============================================================
    echo   BUILD FAILED!
    echo ============================================================
    pause
    exit /b 1
)

echo.
echo ✓ Build completed
echo.

echo Step 4: Creating deployment package...
mkdir deployment-url-fix
xcopy .next deployment-url-fix\.next\ /E /I /Y > nul
xcopy app deployment-url-fix\app\ /E /I /Y > nul
xcopy public deployment-url-fix\public\ /E /I /Y > nul
xcopy messages deployment-url-fix\messages\ /E /I /Y > nul
xcopy locales deployment-url-fix\locales\ /E /I /Y > nul 2>nul
copy .env.production deployment-url-fix\ > nul
copy next.config.js deployment-url-fix\ > nul
copy start.js deployment-url-fix\ > nul
copy web.config deployment-url-fix\ > nul
copy package.json deployment-url-fix\ > nul
copy package-lock.json deployment-url-fix\ > nul

echo ✓ Files copied
echo.

echo Step 5: Creating ZIP file...
powershell -command "Compress-Archive -Path 'deployment-url-fix\*' -DestinationPath 'production-url-fix.zip' -Force"
echo ✓ Created production-url-fix.zip
echo.

echo ============================================================
echo   ✅ DEPLOYMENT PACKAGE READY!
echo ============================================================
echo.
echo 📦 Package: production-url-fix.zip
echo 📁 Size: 
dir production-url-fix.zip | find "production-url-fix.zip"
echo.
echo UPLOAD INSTRUCTIONS:
echo.
echo 1. Login to SmarterASP.NET
echo 2. Go to File Manager
echo 3. Navigate to your site root
echo 4. DELETE old .next folder
echo 5. UPLOAD production-url-fix.zip
echo 6. EXTRACT the ZIP file
echo 7. RESTART Node.js application
echo 8. TEST: https://ersa-training.com/en/admin-login
echo.
echo ============================================================
echo   IMPORTANT: Backend Must Be Fixed Too!
echo ============================================================
echo.
echo Don't forget to also deploy the backend session fixes:
echo    1. Go to: D:\Data\work\Ersa\backend
echo    2. Run: deploy-session-fix.bat
echo    3. Upload backend to server
echo    4. Restart backend API
echo.
echo ============================================================
pause

