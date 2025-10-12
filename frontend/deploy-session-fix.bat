@echo off
echo.
echo ============================================================
echo   ERSA TRAINING - ADMIN SESSION FIX DEPLOYMENT
echo ============================================================
echo.
echo This script will:
echo   1. Clean old build
echo   2. Rebuild Next.js application
echo   3. Create deployment package
echo   4. Generate upload instructions
echo.
echo Press any key to continue or close this window to cancel...
pause > nul

echo.
echo Starting deployment build...
echo.

PowerShell.exe -ExecutionPolicy Bypass -File "%~dp0deploy-session-fix.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo   BUILD COMPLETED SUCCESSFULLY!
    echo ============================================================
    echo.
    echo Check the UPLOAD_INSTRUCTIONS.txt file for next steps.
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

