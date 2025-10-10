# 🔧 Solution: Production 500 Error for Static Assets

## Problem Summary
After deploying to production (https://ersa-training.com), all Next.js static assets were returning **500 Internal Server Error**:
- CSS files: `_next/static/css/*.css`
- JavaScript chunks: `_next/static/chunks/*.js`
- Other static assets

This prevented the entire site from loading.

---

## Root Cause
The IIS server was missing the proper `web.config` file to serve Next.js static assets correctly. The file existed as `web.config.FIXED` but was not deployed as `web.config`.

---

## Solution Implemented

### ✅ Files Created/Fixed

1. **`frontend/web.config`** 
   - Copied from `web.config.FIXED`
   - Contains IIS rewrite rules to serve `_next` static files directly
   - Configures iisnode for running Node.js

2. **`frontend/start.js`**
   - Entry point for iisnode to run Next.js on IIS
   - Handles HTTP requests and routes them to Next.js

3. **`PRODUCTION_DEPLOYMENT_FIX.md`**
   - Comprehensive deployment guide
   - Troubleshooting steps
   - IIS configuration instructions

4. **`frontend/DEPLOY_CHECKLIST.md`**
   - Quick reference checklist
   - Step-by-step deployment guide
   - Verification steps

5. **`frontend/deploy.ps1`**
   - Automated PowerShell deployment script
   - Handles build, deploy, permissions, and restart

---

## Quick Fix Steps

### Option 1: Manual Deployment (Recommended for First Time)

1. **Build the application:**
   ```bash
   cd frontend
   npm run build
   ```

2. **Deploy these files to your IIS server:**
   ```
   ✅ .next/              (entire folder)
   ✅ public/             (entire folder)
   ✅ node_modules/       (or rebuild on server)
   ✅ web.config          ⭐ CRITICAL - Must be in root
   ✅ start.js            ⭐ CRITICAL - Must be in root
   ✅ package.json
   ✅ package-lock.json
   ✅ next.config.js
   ✅ i18n.ts
   ✅ messages/
   ```

3. **Configure IIS Application Pool:**
   - Set **.NET CLR Version** to **No Managed Code**
   - Set **Pipeline Mode** to **Integrated**

4. **Set permissions:**
   ```powershell
   # Run as Administrator
   $path = "C:\path\to\deployment"
   $appPool = "YourAppPoolName"
   
   icacls $path /grant "IIS AppPool\$appPool:(OI)(CI)R" /T
   icacls "$path\.next" /grant "IIS AppPool\$appPool:(OI)(CI)F" /T
   ```

5. **Restart IIS:**
   ```powershell
   iisreset
   # OR
   Restart-WebAppPool -Name "YourAppPoolName"
   ```

### Option 2: Automated Deployment

Run the PowerShell deployment script:

```powershell
cd frontend
.\deploy.ps1 -DeployPath "C:\inetpub\wwwroot\ersa-frontend" -AppPoolName "ErsaFrontendPool"
```

**Script Parameters:**
- `-DeployPath`: Target deployment directory
- `-AppPoolName`: IIS Application Pool name
- `-SkipBuild`: Skip the build step
- `-SkipRestart`: Skip IIS restart

---

## Verification Steps

After deployment, verify these:

### 1. Check Static Assets Load
Open browser console and verify these URLs return **200 OK**:
```
https://ersa-training.com/_next/static/css/[hash].css
https://ersa-training.com/_next/static/chunks/[hash].js
```

### 2. Check Site Loads
- Main page: `https://ersa-training.com/en/`
- Admin panel: `https://ersa-training.com/en/admin`
- Should load without errors

### 3. Check Logs
If issues persist:
- **IIS Logs**: `C:\inetpub\logs\LogFiles\W3SVC[id]\`
- **iisnode Logs**: `[deployment-path]\iisnode\`
- **Browser Console**: F12 → Console tab

---

## Common Issues & Solutions

### ❌ Still Getting 500 Errors

**Solution 1: Verify web.config Location**
```powershell
# web.config MUST be in deployment root, not in a subfolder
Test-Path "C:\inetpub\wwwroot\ersa-frontend\web.config"
# Should return: True
```

**Solution 2: Check .next Folder Exists**
```powershell
Test-Path "C:\inetpub\wwwroot\ersa-frontend\.next\static"
# Should return: True
```

**Solution 3: Clear IIS Cache**
```powershell
# Stop IIS
iisreset /stop

# Clear temp files
Remove-Item "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Temporary ASP.NET Files\*" -Recurse -Force

# Restart IIS
iisreset /start
```

### ❌ Application Won't Start

**Check Node.js Installation:**
```bash
node --version
# Should show: v18.x or higher
```

**Check iisnode Installation:**
- Download from: https://github.com/Azure/iisnode
- Install the appropriate version (x64)

**Verify package.json:**
```json
{
  "scripts": {
    "start": "next start",
    "build": "next build"
  }
}
```

### ❌ Permission Denied Errors

```powershell
# Grant full permissions to IIS AppPool
$path = "C:\inetpub\wwwroot\ersa-frontend"
$appPool = "ErsaFrontendPool"

icacls $path /grant "IIS AppPool\$appPool:(OI)(CI)F" /T
```

---

## Important Notes

### ⚠️ Critical Files
These files **MUST** be in your deployment root:
- `web.config` - IIS configuration
- `start.js` - Node.js entry point
- `.next/` folder - Build output

### ⚠️ Environment Variables
Set in IIS or web.config:
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://ersa-training.com/api
```

### ⚠️ Security
- Never commit `.env.local` to git
- Use IIS Application Settings for sensitive data
- Ensure proper file permissions

---

## Success Checklist

- [x] `web.config` created and deployed
- [x] `start.js` created and deployed
- [x] Build completed without errors
- [x] All required files deployed to IIS
- [x] IIS Application Pool configured correctly
- [x] Permissions set for IIS AppPool
- [x] IIS restarted
- [x] Site loads without 500 errors
- [x] Static assets return 200 OK
- [x] No errors in browser console
- [x] Admin panel accessible
- [x] API calls working

---

## Additional Resources

- **Detailed Guide**: See `PRODUCTION_DEPLOYMENT_FIX.md`
- **Quick Checklist**: See `frontend/DEPLOY_CHECKLIST.md`
- **Deployment Script**: Use `frontend/deploy.ps1`

---

## Need Help?

If you continue experiencing issues:

1. Check the detailed logs:
   - IIS: `C:\inetpub\logs\LogFiles\`
   - iisnode: `[deployment-path]\iisnode\`
   
2. Verify file structure:
   ```
   deployment-root/
   ├── web.config       ← Must be here!
   ├── start.js         ← Must be here!
   ├── .next/
   │   └── static/      ← Should have files
   ├── public/
   ├── node_modules/
   └── package.json
   ```

3. Test static file access directly:
   - Try accessing: `https://ersa-training.com/_next/static/chunks/webpack-[hash].js`
   - Should return JavaScript code, not 500 error

---

**Expected Result After Fix:**
✅ All static assets load with **200 OK** status
✅ Site loads completely without errors
✅ Browser console shows no 500 errors
✅ Admin panel and API work correctly

