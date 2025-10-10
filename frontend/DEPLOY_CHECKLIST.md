# 🚀 Quick Deployment Checklist

## Before Deployment

### 1. Build Locally
```bash
npm run build
```
✅ Build should complete without errors

### 2. Verify Files
Check these files exist:
- [x] `web.config` (in root)
- [x] `start.js` (in root)
- [x] `.next/` folder (after build)
- [x] `package.json`
- [x] `next.config.js`

---

## Deploy to Production

### Files to Upload:
```
✅ .next/              (entire folder)
✅ public/             (entire folder)
✅ node_modules/       (or run npm install on server)
✅ web.config          (MUST be in root)
✅ start.js            (MUST be in root)
✅ package.json
✅ package-lock.json
✅ next.config.js
✅ i18n.ts
✅ messages/           (translation files)
```

### DO NOT Upload:
```
❌ .git/
❌ .env.local
❌ src/ (source files if already built)
❌ .vscode/
❌ node_modules/ (if different OS, rebuild on server)
```

---

## On the Server

### 1. Install Dependencies (if needed)
```bash
npm install --production
```

### 2. Set Environment Variables
Add to IIS Application Settings or `.env.production`:
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://ersa-training.com/api
```

### 3. Configure IIS Application Pool
- .NET CLR Version: **No Managed Code**
- Pipeline Mode: **Integrated**
- Start Mode: **AlwaysRunning**

### 4. Set Permissions
```powershell
# Replace with your paths
$path = "C:\inetpub\wwwroot\frontend"
$appPool = "YourAppPoolName"

icacls $path /grant "IIS AppPool\$appPool:(OI)(CI)R" /T
icacls "$path\.next" /grant "IIS AppPool\$appPool:(OI)(CI)F" /T
```

### 5. Restart
```powershell
Restart-WebAppPool -Name "YourAppPoolName"
# OR
iisreset
```

---

## Verify Deployment

### Test These URLs:
1. ✅ Main page: `https://ersa-training.com/en/`
2. ✅ Static CSS: `https://ersa-training.com/_next/static/css/[hash].css`
3. ✅ Static JS: `https://ersa-training.com/_next/static/chunks/[hash].js`
4. ✅ API connection works
5. ✅ Admin login works
6. ✅ Image uploads work

All should return **200 OK** (not 500 or 404)

---

## If You Get 500 Errors

### Quick Fixes:
1. **Check web.config is in root folder** (not in subfolder)
2. **Verify .next folder exists** after deployment
3. **Check IIS logs**: `C:\inetpub\logs\LogFiles\`
4. **Check iisnode logs**: `[your-path]\iisnode\`
5. **Restart IIS**: `iisreset`
6. **Rebuild**: Delete `.next` folder, run `npm run build` again

### Common Issues:
- **web.config missing or wrong location** → Copy to root
- **Permissions error** → Grant IIS AppPool read/write permissions
- **Node.js not found** → Install Node.js on server
- **iisnode not installed** → Install from GitHub
- **Old cache** → Clear browser cache + hard refresh

---

## Emergency Rollback

If deployment fails:
1. Keep backup of previous working `.next` folder
2. Replace new files with backup
3. Restart IIS
4. Investigate issue before redeploying

---

## Success Indicators

✅ Site loads without errors
✅ No 500 errors in browser console
✅ Static assets load (check Network tab)
✅ Images display correctly
✅ Translations work (switch language)
✅ Admin panel accessible
✅ API calls work
✅ No errors in IIS logs

---

## Need Help?

See `PRODUCTION_DEPLOYMENT_FIX.md` for detailed troubleshooting steps.

