@echo off
echo Creating complete production deployment package for SmarterASP.NET...

REM Navigate to frontend directory
cd /d "%~dp0"
if not exist package.json (
    echo Error: package.json not found. Make sure you're in the frontend directory.
    pause
    exit /b 1
)

echo.
echo Step 1: Installing production dependencies...
npm ci --only=production --no-optional

if %ERRORLEVEL% neq 0 (
    echo Error: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo Step 2: Building the application...
npm run build

if %ERRORLEVEL% neq 0 (
    echo Error: Build failed
    pause
    exit /b 1
)

echo.
echo Step 3: Creating deployment directory...
if exist deployment\node_modules rmdir /s /q deployment\node_modules
if not exist deployment mkdir deployment

echo.
echo Step 4: Copying files to deployment directory...

REM Copy built application
xcopy /s /e /h /y .next deployment\.next\

REM Copy public assets
xcopy /s /e /h /y public deployment\public\

REM Copy node_modules (production only)
echo Copying node_modules...
xcopy /s /e /h /y node_modules deployment\node_modules\

REM Copy configuration files
copy package.json deployment\
copy package-lock.json deployment\
copy next.config.js deployment\

echo.
echo Step 5: Creating server files...

REM Create production environment file
echo NODE_ENV=production > deployment\.env.production
echo NEXT_PUBLIC_API_BASE_URL=http://api.ersa-training.com/api >> deployment\.env.production
echo PORT=3000 >> deployment\.env.production

REM Create startup file
(
echo const { createServer } = require('http'^)
echo const { parse } = require('url'^)
echo const next = require('next'^)
echo.
echo const port = parseInt(process.env.PORT ^|^| '3000', 10^)
echo const dev = false
echo.
echo console.log('Starting Ersa Training Frontend...'^)
echo console.log('Environment:', process.env.NODE_ENV^)
echo console.log('Port:', port^)
echo.
echo const app = next({ dev, dir: __dirname }^)
echo const handle = app.getRequestHandler(^)
echo.
echo app.prepare(^)
echo   .then(^(^) =^> {
echo     console.log('Next.js app prepared successfully'^)
echo     
echo     createServer(^(req, res^) =^> {
echo       try {
echo         const parsedUrl = parse(req.url, true^)
echo         handle(req, res, parsedUrl^)
echo       } catch (err^) {
echo         console.error('Error handling request:', err^)
echo         res.statusCode = 500
echo         res.end('Internal Server Error'^)
echo       }
echo     }^).listen(port, (err^) =^> {
echo       if (err^) {
echo         console.error('Server failed to start:', err^)
echo         throw err
echo       }
echo       console.log(`^> Ready on http://localhost:${port}`^)
echo     }^)
echo   }^)
echo   .catch(^(ex^) =^> {
echo     console.error('Failed to start application:', ex^)
echo     process.exit(1^)
echo   }^)
) > deployment\start.js

REM Create iisnode configuration
(
echo node_start_file: start.js
echo node_env: production
echo loggingEnabled: true
echo debuggingEnabled: true
echo maxLogFileSizeInKB: 128
echo maxTotalLogFileSizeInKB: 1024
echo nodeProcessCommandLine: "node"
echo devErrorsEnabled: true
) > deployment\iisnode.yml

REM Create web.config
(
echo ^<?xml version="1.0" encoding="utf-8"?^>
echo ^<configuration^>
echo   ^<system.webServer^>
echo     ^<handlers^>
echo       ^<add name="iisnode" path="start.js" verb="*" modules="iisnode"/^>
echo     ^</handlers^>
echo     ^<rewrite^>
echo       ^<rules^>
echo         ^<rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true"^>
echo           ^<match url="^start.js\/debug[\/]?" /^>
echo         ^</rule^>
echo         ^<rule name="StaticContent"^>
echo           ^<action type="Rewrite" url="public{REQUEST_URI}"/^>
echo         ^</rule^>
echo         ^<rule name="DynamicContent"^>
echo           ^<conditions^>
echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/^>
echo           ^</conditions^>
echo           ^<action type="Rewrite" url="start.js"/^>
echo         ^</rule^>
echo       ^</rules^>
echo     ^</rewrite^>
echo     ^<security^>
echo       ^<requestFiltering^>
echo         ^<hiddenSegments^>
echo           ^<remove segment="bin"/^>
echo         ^</hiddenSegments^>
echo       ^</requestFiltering^>
echo     ^</security^>
echo     ^<httpErrors existingResponse="PassThrough" /^>
echo     ^<iisnode node_env="production" devErrorsEnabled="true" /^>
echo   ^</system.webServer^>
echo ^</configuration^>
) > deployment\web.config

echo.
echo Step 6: Creating deployment package...
cd deployment
if exist "ersa-deployment-complete.zip" del "ersa-deployment-complete.zip"

REM Create zip file using PowerShell
powershell -command "Compress-Archive -Path * -DestinationPath 'ersa-deployment-complete.zip' -Force"

echo.
echo ===================================
echo Deployment package created successfully!
echo ===================================
echo.
echo File: deployment\ersa-deployment-complete.zip
echo.
echo This package contains:
echo - Built Next.js application (.next folder)
echo - All production dependencies (node_modules)
echo - Static assets (public folder)
echo - Server configuration files
echo - Startup scripts for SmarterASP.NET
echo.
echo Upload this ZIP file to your SmarterASP.NET hosting and extract it.
echo.
pause