# Instructors Page 500 Error - Quick Fix Guide

## Problem
The admin instructors page returns a 500 error when trying to load its JavaScript chunk in production:
```
GET https://ersa-training.com/_next/static/chunks/app/%5Blocale%5D/admin/instructors/page-3618a029e4588ed0.js 
net::ERR_ABORTED 500 (Internal Server Error)
```

## Root Cause
The production deployment is missing the latest build. The instructors page was recently modified locally, but the changes were never built and deployed to production.

## Solution

### Option 1: Local Build + Deploy (Recommended)

1. **Navigate to frontend directory**:
   ```powershell
   cd D:\Data\work\Ersa\frontend
   ```

2. **Clean any previous build**:
   ```powershell
   Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
   ```

3. **Install dependencies** (if needed):
   ```powershell
   npm install
   ```

4. **Build the application**:
   ```powershell
   npm run build
   ```

5. **Deploy to production using the deployment script**:
   ```powershell
   .\deploy.ps1
   ```

### Option 2: Quick Production Server Fix

If you have direct access to the production server:

1. **SSH/RDP into production server**

2. **Navigate to the application directory**:
   ```bash
   cd /path/to/ersa-frontend
   ```

3. **Pull latest changes**:
   ```bash
   git pull origin main
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Build application**:
   ```bash
   npm run build
   ```

6. **Restart the application**:
   ```bash
   # If using PM2
   pm2 restart ersa-frontend
   
   # If using IIS
   iisreset
   ```

### Option 3: Deploy from ProxyDeploymentReady

If you prefer to use the proxy deployment package:

1. **Navigate to ProxyDeploymentReady**:
   ```powershell
   cd D:\Data\work\Ersa\ProxyDeploymentReady
   ```

2. **Run the updated deployment script**:
   ```powershell
   .\deploy.ps1
   ```

## Verification Steps

After deployment, verify the fix:

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Navigate to**: https://ersa-training.com/en/admin/instructors
3. **Check browser console** - should see no 500 errors
4. **Verify the page loads** correctly with all instructor data

## Prevention

To prevent this issue in the future:

1. **Always build before deploying**:
   ```powershell
   npm run build
   ```

2. **Use the deployment script** which includes build step:
   ```powershell
   .\deploy.ps1
   ```

3. **Commit and push changes** before deploying:
   ```bash
   git add .
   git commit -m "Update instructors page"
   git push origin main
   ```

## Additional Notes

- The deployment script at `frontend/deploy.ps1` already includes a build step
- The ProxyDeploymentReady deployment script has been updated to include a build step
- Always test locally before deploying to production
- Keep production and development in sync through version control

## Related Files Modified
- `frontend/app/[locale]/admin/instructors/page.tsx` (Modified but not deployed)
- `ProxyDeploymentReady/deploy.ps1` (Updated to include build step)
- `frontend/deploy.ps1` (Already includes build step)

## Support
If issues persist after following these steps:
1. Check IIS logs: `C:\inetpub\logs\LogFiles\`
2. Check application logs in the deployment directory
3. Verify `.env.production` is configured correctly
4. Ensure backend API is accessible from production server

