@echo off
echo.
echo ============================================================
echo   ERSA TRAINING - BACKEND SESSION FIX DEPLOYMENT
echo ============================================================
echo.
echo This script will:
echo   1. Clean old build files
echo   2. Restore NuGet packages
echo   3. Build the backend project
echo   4. Publish for deployment
echo   5. Create deployment package
echo.
echo Press any key to continue or close this window to cancel...
pause > nul

echo.
echo Starting backend build and package...
echo.

PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0deploy-session-fix.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   BUILD COMPLETED SUCCESSFULLY!
    echo ============================================================
    echo.
    echo Check BACKEND_UPLOAD_INSTRUCTIONS.txt for deployment steps.
    echo.
    echo IMPORTANT: Deploy backend FIRST, then frontend!
    echo.
) else (
    echo.
    echo ============================================================
    echo   BUILD FAILED!
    echo ============================================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause

