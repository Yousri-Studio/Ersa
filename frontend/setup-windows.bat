@echo off
echo Setting up Ersa Training Frontend for SmarterASP.NET deployment...

REM Check if Node.js is installed
node --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if we're in the frontend directory
if not exist package.json (
    echo ERROR: package.json not found. Please run this script from the frontend directory.
    pause
    exit /b 1
)

echo Step 1: Installing dependencies...
npm ci

echo.
echo Step 2: Building the application...
npm run build

REM Check if build was successful
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 3: Creating deployment package...

REM Create deployment directory
if exist deployment rmdir /s /q deployment
mkdir deployment

REM Copy built application files
echo Copying .next build output...
xcopy .next deployment\.next /E /I /Y

echo Copying public assets...
xcopy public deployment\public /E /I /Y

echo Copying package files...
copy package.json deployment\
copy package-lock.json deployment\

echo Copying configuration files...
copy next.config.js deployment\
if exist web.config copy web.config deployment\

echo Copying environment files...
if exist .env.production.local copy .env.production.local deployment\
if exist .env.local copy .env.local deployment\

REM Create production environment file for SmarterASP.NET
echo Creating production environment configuration...
echo NEXT_PUBLIC_API_BASE_URL=https://yourdomain.smarterasp.net/api > deployment\.env.production
echo NODE_ENV=production >> deployment\.env.production

REM Create start script for SmarterASP.NET
echo Creating start script...
echo @echo off > deployment\start.bat
echo echo Starting Ersa Training Frontend... >> deployment\start.bat
echo npm start >> deployment\start.bat

REM Create Node.js startup configuration for SmarterASP.NET
echo Creating iisnode.yml for SmarterASP.NET...
echo node_start_file: start.js > deployment\iisnode.yml
echo node_env: production >> deployment\iisnode.yml

REM Create start.js file for IIS
echo Creating start.js for IIS/SmarterASP.NET...
echo const { createServer } = require('http') > deployment\start.js
echo const { parse } = require('url') >> deployment\start.js
echo const next = require('next') >> deployment\start.js
echo. >> deployment\start.js
echo const port = process.env.PORT ^|^| 3000 >> deployment\start.js
echo const dev = process.env.NODE_ENV !== 'production' >> deployment\start.js
echo const app = next({ dev }) >> deployment\start.js
echo const handle = app.getRequestHandler() >> deployment\start.js
echo. >> deployment\start.js
echo app.prepare().then(() =^> { >> deployment\start.js
echo   createServer((req, res) =^> { >> deployment\start.js
echo     const parsedUrl = parse(req.url, true) >> deployment\start.js
echo     handle(req, res, parsedUrl) >> deployment\start.js
echo   }).listen(port, (err) =^> { >> deployment\start.js
echo     if (err) throw err >> deployment\start.js
echo     console.log(`Ready on http://localhost:${port}`) >> deployment\start.js
echo   }) >> deployment\start.js
echo }) >> deployment\start.js

REM Create web.config for IIS/SmarterASP.NET if it doesn't exist
if not exist deployment\web.config (
    echo Creating web.config for IIS...
    echo ^<?xml version="1.0" encoding="utf-8"?^> > deployment\web.config
    echo ^<configuration^> >> deployment\web.config
    echo   ^<system.webServer^> >> deployment\web.config
    echo     ^<handlers^> >> deployment\web.config
    echo       ^<add name="iisnode" path="start.js" verb="*" modules="iisnode"/^> >> deployment\web.config
    echo     ^</handlers^> >> deployment\web.config
    echo     ^<rewrite^> >> deployment\web.config
    echo       ^<rules^> >> deployment\web.config
    echo         ^<rule name="DynamicContent"^> >> deployment\web.config
    echo           ^<conditions^> >> deployment\web.config
    echo             ^<add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/^> >> deployment\web.config
    echo           ^</conditions^> >> deployment\web.config
    echo           ^<action type="Rewrite" url="start.js"/^> >> deployment\web.config
    echo         ^</rule^> >> deployment\web.config
    echo       ^</rules^> >> deployment\web.config
    echo     ^</rewrite^> >> deployment\web.config
    echo     ^<iisnode node_env="production"/^> >> deployment\web.config
    echo   ^</system.webServer^> >> deployment\web.config
    echo ^</configuration^> >> deployment\web.config
)

echo.
echo ========================================
echo DEPLOYMENT PACKAGE CREATED SUCCESSFULLY!
echo ========================================
echo.
echo Deployment files are ready in the 'deployment' folder.
echo.
echo NEXT STEPS FOR SMARTERASP.NET DEPLOYMENT:
echo.
echo 1. Compress the 'deployment' folder into a ZIP file
echo 2. Upload the ZIP file to your SmarterASP.NET hosting account via File Manager
echo 3. Extract the ZIP file in your domain's root directory (public_html or wwwroot)
echo 4. In SmarterASP.NET control panel:
echo    - Go to Node.js section
echo    - Set 'Startup File' to: start.js
echo    - Set 'Node.js Version' to the latest available
echo    - Enable Node.js for your domain
echo 5. Update the API URL in .env.production to match your backend URL
echo.
echo Your frontend will be accessible at your domain URL.
echo.
pause