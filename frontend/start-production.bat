@echo off
REM Ersa Training Frontend - Production Start Script

echo ========================================
echo Starting Ersa Training Frontend
echo ========================================
echo.

REM Check if build exists
if not exist ".next" (
    echo ERROR: Build not found!
    echo Please run setup-windows.bat first or execute: npm run build
    pause
    exit /b 1
)

REM Set environment variables (customize these)
set NODE_ENV=production
set PORT=3000
REM set NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

echo Starting on port %PORT%...
echo Press Ctrl+C to stop the server
echo.

REM Start the application
call npm start

