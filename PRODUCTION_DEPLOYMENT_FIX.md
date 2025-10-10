# Production Deployment Fix - Static Assets 500 Error

## Problem
After deployment, all Next.js static assets (`_next/static/*`) are returning **500 Internal Server Error**.

## Root Cause
The IIS server was missing or had an incorrect `web.config` file, causing static assets to not be served properly.

## Solution

### Files Created/Fixed
1. ✅ `frontend/web.config` - IIS configuration for serving static assets
2. ✅ `frontend/start.js` - Node.js entry point for iisnode

---

## Deployment Steps

### 1. **Build the Application**
```bash
cd frontend
npm run build
```

### 2. **Verify Build Output**
Ensure these directories exist after build:
- `frontend/.next/` - Next.js build output
- `frontend/.next/static/` - Static assets
- `frontend/public/` - Public assets

### 3. **Deploy to Production**

#### **Files to Deploy:**
```
frontend/
├── .next/              # Build output (REQUIRED)
├── public/             # Public assets (REQUIRED)
├── node_modules/       # Dependencies (REQUIRED)
├── web.config          # IIS configuration (REQUIRED) ✅ NEW
├── start.js            # iisnode entry point (REQUIRED) ✅ NEW
├── package.json        # Package configuration (REQUIRED)
├── next.config.js      # Next.js configuration (REQUIRED)
├── i18n.ts             # Internationalization config (REQUIRED)
└── messages/           # Translation files (REQUIRED)
```

#### **DO NOT Deploy:**
- `node_modules/` if using different OS (rebuild on server)
- `.git/`
- `src/` or development files
- `.env.local` (use server environment variables instead)

### 4. **IIS Configuration**

#### **A. Application Pool Settings:**
1. Open IIS Manager
2. Select your application pool
3. Set **.NET CLR Version** to **No Managed Code**
4. Set **Pipeline Mode** to **Integrated**
5. Set **Start Mode** to **AlwaysRunning**
6. Under **Advanced Settings**:
   - Set **Idle Time-out (minutes)** to `0` (never timeout)
   - Set **Regular Time Interval (minutes)** to `0` (disable recycling)

#### **B. Site Settings:**
1. Select your website in IIS
2. Go to **Basic Settings**
3. Set **Physical Path** to your frontend deployment folder
4. Ensure **Application Pool** is set correctly

#### **C. Verify web.config is in Root:**
The `web.config` file MUST be in the root of your deployment directory, not in a subdirectory.

### 5. **Environment Variables**

Set these environment variables in IIS:

1. In IIS Manager, select your site
2. Go to **Configuration Editor**
3. Select `system.webServer/aspNetCore` or configure via web.config

**Required Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://your-api-domain.com/api
PORT=3000 (or your preferred port)
```

### 6. **Permissions**

Ensure the IIS Application Pool identity has permissions:

```powershell
# Run in PowerShell as Administrator
$path = "C:\path\to\your\frontend\deployment"
$appPoolName = "YourAppPoolName"

# Grant read permissions
icacls $path /grant "IIS AppPool\$appPoolName:(OI)(CI)R" /T

# Grant write permissions to .next and node_modules
icacls "$path\.next" /grant "IIS AppPool\$appPoolName:(OI)(CI)F" /T
icacls "$path\node_modules" /grant "IIS AppPool\$appPoolName:(OI)(CI)RX" /T
```

### 7. **Verify Static Assets**

After deployment, check these URLs manually:

1. Main page: `https://ersa-training.com/en/`
2. Static CSS: `https://ersa-training.com/_next/static/css/[hash].css`
3. Static JS: `https://ersa-training.com/_next/static/chunks/[hash].js`

All should return **200 OK**, not 500 or 404.

### 8. **Restart IIS**

```powershell
# Restart the application pool
Restart-WebAppPool -Name "YourAppPoolName"

# Or restart IIS completely
iisreset
```

---

## Troubleshooting

### **Issue: Still Getting 500 Errors**

1. **Check IIS Logs:**
   ```
   C:\inetpub\logs\LogFiles\W3SVC[site-id]\
   ```

2. **Check iisnode Logs:**
   ```
   [your-deployment-path]\iisnode\
   ```

3. **Check Windows Event Viewer:**
   - Application logs
   - System logs

### **Issue: Static Files Return 404**

- Verify `.next/static/` folder exists and has files
- Check file permissions
- Verify `web.config` rewrite rules are active

### **Issue: Application Won't Start**

1. **Check Node.js is installed on server:**
   ```bash
   node --version
   ```

2. **Check iisnode is installed:**
   - Download from: https://github.com/Azure/iisnode

3. **Verify package.json scripts:**
   ```json
   {
     "scripts": {
       "start": "next start",
       "build": "next build"
     }
   }
   ```

### **Issue: Environment Variables Not Working**

Add to `web.config` inside `<system.webServer>`:

```xml
<iisnode>
  <iisnode 
    node_env="production"
    nodeProcessCountPerApplication="1"
  />
</iisnode>
```

---

## Quick Checklist

- [ ] Run `npm run build` locally
- [ ] Copy `web.config` to deployment root ✅
- [ ] Copy `start.js` to deployment root ✅
- [ ] Deploy `.next` folder
- [ ] Deploy `node_modules` or run `npm install --production` on server
- [ ] Set environment variables in IIS
- [ ] Configure Application Pool (No Managed Code)
- [ ] Set correct file permissions
- [ ] Restart IIS/Application Pool
- [ ] Test static asset URLs
- [ ] Check logs if errors persist

---

## Additional Notes

### **Alternative: Use PM2 Instead of iisnode**

If you continue having issues with iisnode, consider using PM2:

1. Install PM2 globally on server:
   ```bash
   npm install -g pm2
   ```

2. Create `ecosystem.config.js`:
   ```javascript
   module.exports = {
     apps: [{
       name: 'ersa-frontend',
       script: 'node_modules/next/dist/bin/next',
       args: 'start',
       cwd: './',
       instances: 1,
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 3000
       }
     }]
   };
   ```

3. Start with PM2:
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

4. Update IIS to proxy to PM2:
   - Install **URL Rewrite** and **Application Request Routing**
   - Configure reverse proxy to `http://localhost:3000`

---

## Contact

If issues persist after following this guide:
1. Check the iisnode logs in `[deployment-path]/iisnode/`
2. Check IIS logs in `C:\inetpub\logs\LogFiles\`
3. Verify Node.js version matches your development environment
4. Ensure iisnode module is properly installed in IIS

**Expected Result:** All static assets should return **200 OK** and the site should load normally.

