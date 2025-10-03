# Deployment Guide - Frontend to Windows Host

## Overview
This guide explains how to deploy the Ersa Training frontend (Next.js) to a Windows hosting environment using GitHub Actions.

## Prerequisites

### 1. Windows Server Requirements
- Windows Server 2016 or later (or Windows 10/11 for testing)
- Node.js 18.x or later installed
- IIS (Internet Information Services) with iisnode module (optional, for IIS hosting)
- FTP server configured (for automated deployment)

### 2. GitHub Repository Setup
The GitHub Actions workflow has been created at `.github/workflows/deploy-frontend.yml`

### 3. GitHub Secrets Configuration
You need to configure the following secrets in your GitHub repository:

Go to: **Repository Settings → Secrets and variables → Actions → New repository secret**

#### Required Secrets:
- `NEXT_PUBLIC_API_BASE_URL` - Your backend API URL (e.g., `https://api.yourdomain.com/api`)
- `FTP_SERVER` - Your Windows server FTP address (e.g., `ftp.yourdomain.com`)
- `FTP_USERNAME` - FTP username
- `FTP_PASSWORD` - FTP password
- `FTP_SERVER_DIR` - Target directory on server (e.g., `/httpdocs/frontend/`)

#### Optional Secrets (for SMB deployment):
- `SERVER_ADDRESS` - Windows server IP/hostname
- `SHARE_NAME` - Network share name
- `DEPLOY_USERNAME` - Windows username
- `DEPLOY_PASSWORD` - Windows password

## Deployment Methods

### Method 1: Automated Deployment via GitHub Actions (Recommended)

1. **Push to Main Branch**
   ```bash
   git add .
   git commit -m "Deploy frontend"
   git push origin main
   ```

2. **Manual Trigger**
   - Go to GitHub repository → Actions tab
   - Select "Build and Deploy Frontend to Windows Host"
   - Click "Run workflow"

3. **Monitor Deployment**
   - Watch the workflow progress in the Actions tab
   - Download the build artifact if needed for manual deployment

### Method 2: Manual Deployment

1. **Download Build Artifact**
   - Go to GitHub Actions → Latest successful workflow run
   - Download `frontend-build` artifact
   - Extract `frontend-deploy.zip`

2. **Upload to Windows Server**
   - Use FTP client (FileZilla, WinSCP, etc.)
   - Upload extracted files to your web directory
   - Or copy directly via network share/RDP

3. **Start the Application**
   - Open Command Prompt on Windows Server
   - Navigate to deployment directory
   - Run: `start.bat`
   - Or: `npm start`

## Hosting Options on Windows

### Option A: Standalone Node.js Server

1. **Run directly with Node.js:**
   ```batch
   cd C:\inetpub\wwwroot\frontend
   npm start
   ```

2. **Configure Port** (default: 3000)
   - Set environment variable: `PORT=80` or desired port

3. **Run as Windows Service** (recommended for production)
   - Use tools like `node-windows` or `NSSM` (Non-Sucking Service Manager)
   - Example with NSSM:
     ```batch
     nssm install ErsaFrontend "C:\Program Files\nodejs\node.exe"
     nssm set ErsaFrontend AppDirectory "C:\inetpub\wwwroot\frontend"
     nssm set ErsaFrontend AppParameters ".next\standalone\server.js"
     nssm start ErsaFrontend
     ```

### Option B: IIS with iisnode

1. **Install iisnode**
   - Download from: https://github.com/azure/iisnode/releases
   - Install on Windows Server
   - Restart IIS

2. **Configure IIS Site**
   - Create new website in IIS Manager
   - Point to deployment directory
   - Set Application Pool to No Managed Code
   - Ensure `web.config` is present (created by workflow)

3. **Configure URL Rewrite**
   - The `web.config` includes rewrite rules
   - Install URL Rewrite module if not present

4. **Start/Restart IIS Site**
   ```batch
   iisreset
   ```

### Option C: IIS with Reverse Proxy

1. **Install Application Request Routing (ARR)**
   - Download ARR for IIS
   - Install on Windows Server

2. **Run Next.js on Port 3000**
   ```batch
   npm start
   ```

3. **Configure IIS Reverse Proxy**
   - Create new site in IIS
   - Add URL Rewrite rule:
     ```xml
     <rule name="ReverseProxyInboundRule1" stopProcessing="true">
       <match url="(.*)" />
       <action type="Rewrite" url="http://localhost:3000/{R:1}" />
     </rule>
     ```

## Environment Variables

Create a `.env.production.local` file in the deployment directory:

```env
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

# Port (optional, defaults to 3000)
PORT=80

# Node Environment
NODE_ENV=production
```

## Troubleshooting

### Build Fails
- Check Node.js version (must be 18.x or later)
- Verify all dependencies are installed: `npm ci`
- Check GitHub Actions logs for specific errors

### Deployment Fails
- Verify FTP credentials are correct
- Check server connectivity
- Ensure target directory exists and has write permissions
- Check firewall rules

### Application Won't Start
- Check Node.js is installed: `node --version`
- Verify environment variables are set correctly
- Check port is not already in use
- Review application logs in `.next` directory

### IIS Shows 500 Error
- Check iisnode is installed and configured
- Verify Node.js path in `web.config`
- Check Application Pool settings (should be No Managed Code)
- Review iisnode logs in `iisnode` folder

### Port Already in Use
```batch
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

## Performance Optimization

1. **Enable Compression**
   - Enable Gzip/Brotli in IIS
   - Next.js already provides optimized builds

2. **Configure Caching**
   - Set proper cache headers for static assets
   - Use CDN for `_next/static` files

3. **Process Management**
   - Use PM2 or similar for process management
   - Configure auto-restart on failure
   - Set up monitoring and logging

## Monitoring

1. **Application Logs**
   - Check Node.js console output
   - Review IIS logs (if using IIS)
   - Monitor Windows Event Viewer

2. **Performance Monitoring**
   - Use Windows Performance Monitor
   - Set up uptime monitoring (Pingdom, UptimeRobot, etc.)
   - Configure alerts for downtime

## Rollback Procedure

1. **Keep Previous Versions**
   - Maintain backup of previous deployment
   - Use versioned directory names (e.g., `frontend-v1.0`, `frontend-v1.1`)

2. **Quick Rollback**
   - Stop current application
   - Switch to previous version directory
   - Restart application

3. **Via GitHub Actions**
   - Revert commit on GitHub
   - Trigger workflow run
   - Wait for automated deployment

## Security Considerations

1. **Environment Variables**
   - Never commit secrets to repository
   - Use GitHub Secrets for sensitive data
   - Rotate credentials regularly

2. **Server Security**
   - Keep Windows Server updated
   - Configure Windows Firewall
   - Use HTTPS (SSL/TLS certificates)
   - Limit FTP access by IP if possible

3. **Application Security**
   - Keep Node.js and npm packages updated
   - Run security audits: `npm audit`
   - Use environment-specific configurations

## Support

For issues or questions:
1. Check GitHub Actions logs
2. Review server logs
3. Test locally first: `npm run build && npm start`
4. Verify all environment variables are set correctly

## Next Steps

1. Configure GitHub Secrets in your repository
2. Test deployment to a staging server first
3. Set up monitoring and alerts
4. Configure SSL certificate for HTTPS
5. Set up automated backups
6. Document your specific hosting configuration

