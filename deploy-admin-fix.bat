@echo off
REM ==========================================
REM Deploy Admin 500 Error Fix
REM ==========================================

echo.
echo ========================================
echo  ADMIN 500 ERROR FIX - DEPLOYMENT
echo ========================================
echo.

cd /d "%~dp0"

echo [1/5] Checking if we're in the correct directory...
if not exist "frontend\package.json" (
    echo ERROR: frontend directory not found!
    echo Please run this script from the project root directory.
    pause
    exit /b 1
)

echo [2/5] Installing dependencies (if needed)...
cd frontend
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)

echo.
echo [3/5] Building production frontend...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [4/5] Creating deployment package...
if not exist "..\deployment" mkdir "..\deployment"

echo   - Cleaning old .next folder...
if exist "..\deployment\.next" rmdir /s /q "..\deployment\.next"

echo   - Copying new .next build...
xcopy ".next" "..\deployment\.next\" /E /I /Y /Q

echo   - Copying environment files...
if exist ".env.production" copy /Y ".env.production" "..\deployment\.env.production"

echo   - Copying package files...
copy /Y "package.json" "..\deployment\package.json"
if exist "package-lock.json" copy /Y "package-lock.json" "..\deployment\package-lock.json"

echo   - Copying public files...
if exist "..\deployment\public" rmdir /s /q "..\deployment\public"
xcopy "public" "..\deployment\public\" /E /I /Y /Q

echo   - Copying configuration files...
if exist "next.config.js" copy /Y "next.config.js" "..\deployment\next.config.js"

echo.
echo [5/5] Verifying build...
if exist ".next\BUILD_ID" (
    echo   Build ID: 
    type ".next\BUILD_ID"
    echo.
) else (
    echo   WARNING: BUILD_ID not found!
)

if exist "..\deployment\.next\server\app\api\proxy\route.js" (
    echo   ✓ Proxy route exists
) else (
    echo   WARNING: Proxy route not found!
)

echo.
echo ========================================
echo  BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Check the 'deployment' folder
echo 2. Upload contents to your production server
echo 3. Make sure .env.production is configured:
echo    NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
echo    BACKEND_API_URL=http://api.ersa-training.com/api
echo.
echo Files ready for deployment:
echo - deployment\.next\       (build output)
echo - deployment\public\      (static files)
echo - deployment\package.json
echo - deployment\.env.production
echo.
echo IMPORTANT: Clear browser cache after deployment!
echo.

cd ..
pause

