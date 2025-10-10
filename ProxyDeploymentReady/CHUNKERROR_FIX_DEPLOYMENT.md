# 🔧 ChunkLoadError Fix - Deployment Instructions

## 🚨 Issue Summary

**Problem:** Next.js static chunks returning 500 errors:
```
ChunkLoadError: Loading chunk 7639 failed.
(error: https://ersa-training.com/_next/static/chunks/7639-eefad8b226f5216c.js)
```

**Root Cause:** Build ID mismatch between the deployed HTML pages and the static JavaScript chunks in the `_next` folder. The production site was requesting chunks from a different build than what was actually deployed.

**Solution:** Deploy a fresh, complete build with matching BUILD_ID and improved web.config.

---

## ✅ What Was Fixed

### 1. Fresh Production Build
- **Old BUILD_ID:** `ZAabcM6-KQ3XopTYaOmQt`
- **New BUILD_ID:** `Ch721H3E1gyDRUbZYA3GV`
- **Chunks:** 37 JavaScript chunks generated
- All pages and static assets regenerated with matching build ID

### 2. Improved web.config
**Changes made:**

#### Enhanced Static File Handling
```xml
<!-- OLD: Only matched _next/static/ -->
<match url="^_next/static/(.*)$" />

<!-- NEW: Matches all _next/ files -->
<match url="^_next/(.*)$" />
```

#### Added 404 Error Handling
```xml
<outboundRules>
  <rule name="Handle404AsServerRequest" preCondition="CheckFor404">
    <match serverVariable="RESPONSE_Location" pattern=".*" />
    <action type="Rewrite" value="/" />
  </rule>
</outboundRules>
```

#### Added JavaScript MIME Type & Caching
```xml
<mimeMap fileExtension=".js" mimeType="application/javascript" />
<clientCache cacheControlMode="UseMaxAge" cacheControlMaxAge="31536000.00:00:00" />
```

---

## 📋 Deployment Steps

### Step 1: Stop the Production Site
```powershell
# If using PM2
pm2 stop ersa-frontend

# Or stop IIS application pool
Stop-WebAppPool -Name "YourAppPoolName"
```

### Step 2: Backup Current Deployment
```powershell
# On production server
cd C:\inetpub\wwwroot\ersa-training.com
Rename-Item ".next" ".next.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Copy-Item "web.config" "web.config.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
```

### Step 3: Upload New Files
Upload these files/folders from `ProxyDeploymentReady` to production:

**Critical Files:**
```
✅ .next/                  # Complete folder with new BUILD_ID
✅ web.config              # Updated configuration
✅ package.json            # Dependencies (if changed)
```

**Optional (if not already deployed):**
```
- public/                  # Static assets
- messages/                # Internationalization
- locales/                 # Locale configs
- next.config.js           # Next.js config
- i18n.ts                  # i18n config
- middleware.ts            # Middleware
- start.js                 # Server start script
```

### Step 4: Clear Server Caches

#### Clear IIS Output Cache
```powershell
# PowerShell on Windows Server
Remove-Item -Path "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\Temporary ASP.NET Files\*" -Recurse -Force -ErrorAction SilentlyContinue
```

#### Clear iisnode Cache
```powershell
# Delete iisnode cache folder
Remove-Item -Path "C:\inetpub\wwwroot\ersa-training.com\iisnode\*" -Recurse -Force -ErrorAction SilentlyContinue
```

#### Restart IIS (Optional but Recommended)
```powershell
iisreset /noforce
```

### Step 5: Verify File Structure
Check that files exist on production:
```powershell
# Verify BUILD_ID
Get-Content "C:\inetpub\wwwroot\ersa-training.com\.next\BUILD_ID"
# Should show: Ch721H3E1gyDRUbZYA3GV

# Verify chunks exist
Get-ChildItem "C:\inetpub\wwwroot\ersa-training.com\.next\static\chunks" -File | Measure-Object
# Should show: Count: 37

# Verify web.config
Get-Content "C:\inetpub\wwwroot\ersa-training.com\web.config" | Select-String "outboundRules"
# Should return a match (proves new web.config is deployed)
```

### Step 6: Start the Site
```powershell
# If using PM2
pm2 start ersa-frontend

# Or start IIS application pool
Start-WebAppPool -Name "YourAppPoolName"
```

### Step 7: Clear Browser Caches
**Important:** Users experiencing the error need to clear their browser cache!

#### Instructions for Users:

**Chrome/Edge:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cached images and files"
3. Choose "All time"
4. Click "Clear data"
5. Hard refresh: `Ctrl + F5`

**Firefox:**
1. Press `Ctrl + Shift + Delete`
2. Select "Cache"
3. Choose "Everything"
4. Click "Clear Now"
5. Hard refresh: `Ctrl + F5`

**Safari:**
1. Go to Safari > Preferences > Privacy
2. Click "Manage Website Data"
3. Remove all for ersa-training.com
4. Hard refresh: `Cmd + Shift + R`

**Quick Fix (All Browsers):**
- Hard refresh the page: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
- Or open in Incognito/Private mode

---

## 🧪 Testing & Verification

### 1. Test Static Chunks Load Correctly
Open browser DevTools (F12) → Network tab, then visit:
```
https://ersa-training.com/en
```

**Look for:**
- ✅ All `_next/static/chunks/*.js` files return `200 OK`
- ✅ No `500 Internal Server Error`
- ✅ No ChunkLoadError in Console

### 2. Test All Key Pages
Visit and verify no chunk errors:
```
✅ https://ersa-training.com/en
✅ https://ersa-training.com/ar
✅ https://ersa-training.com/en/courses
✅ https://ersa-training.com/ar/courses
✅ https://ersa-training.com/en/about
✅ https://ersa-training.com/en/admin-login
```

### 3. Test Navigation
- Click through multiple pages
- Switch between English/Arabic
- No ChunkLoadError should appear

### 4. Check Server Logs
**IIS Logs:**
```powershell
Get-Content "C:\inetpub\logs\LogFiles\W3SVC1\u_ex$(Get-Date -Format 'yyMMdd').log" | Select-String "_next/static/chunks" | Select-Object -Last 20
```

**Look for:**
- Status codes should be `200` not `500` or `404`

**iisnode Logs:**
```powershell
Get-Content "C:\inetpub\wwwroot\ersa-training.com\iisnode\*.log" | Select-Object -Last 50
```

**Look for:**
- No errors related to missing chunks
- Successful file serving

---

## 🚨 Troubleshooting

### Issue: Still seeing ChunkLoadError after deployment

**Solution 1: Clear All Caches**
```powershell
# Server-side
iisreset /noforce
Remove-Item "C:\inetpub\wwwroot\ersa-training.com\iisnode\*" -Recurse -Force

# Client-side
# Users MUST clear browser cache and hard refresh
```

**Solution 2: Verify BUILD_ID Consistency**
```powershell
# Check deployed BUILD_ID
Get-Content "C:\inetpub\wwwroot\ersa-training.com\.next\BUILD_ID"

# Check what HTML is serving
# Visit https://ersa-training.com/en and view page source
# Look for: <script src="/_next/static/..." 
# The hash in the URL should match build structure
```

**Solution 3: Check File Permissions**
```powershell
# Ensure IIS can read .next folder
icacls "C:\inetpub\wwwroot\ersa-training.com\.next" /grant "IIS AppPool\YourAppPoolName:(OI)(CI)R" /T
```

### Issue: 404 errors for chunks instead of 500

**This is actually better!** The new web.config will handle 404s gracefully.

**Solution:** Verify all files were uploaded:
```powershell
# Count chunks in production
Get-ChildItem "C:\inetpub\wwwroot\ersa-training.com\.next\static\chunks" -File | Measure-Object
# Should be: 37

# If count is wrong, re-upload .next folder completely
```

### Issue: Some pages work, some don't

**Solution:** Clear Next.js cache and restart:
```powershell
Remove-Item "C:\inetpub\wwwroot\ersa-training.com\.next\cache\*" -Recurse -Force -ErrorAction SilentlyContinue
pm2 restart ersa-frontend
```

---

## 🔄 Future Prevention

### 1. Always Deploy Complete .next Folder
**Never** deploy individual files from `.next` folder. Always upload the entire folder atomically:
```powershell
# ❌ DON'T DO THIS
Copy-Item ".next\static\chunks\*" -Destination "production\.next\static\chunks\"

# ✅ DO THIS
Remove-Item "production\.next" -Recurse -Force
Copy-Item ".next" -Destination "production\.next" -Recurse
```

### 2. Use Build IDs to Track Deployments
After every build, note the BUILD_ID:
```powershell
Get-Content ".next\BUILD_ID"
```

Log this in your deployment tracking system.

### 3. Automated Deployment Script
Create a deployment script that:
1. Stops the site
2. Backs up current deployment
3. Uploads new files
4. Clears caches
5. Restarts the site
6. Runs verification tests

Example: `deploy-production.ps1` (create this script)
```powershell
# See ProxyDeploymentReady\deploy.ps1 for template
```

### 4. Implement Build Validation
Before deploying, verify the build is complete:
```powershell
# Check BUILD_ID exists
if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Error "Build incomplete: BUILD_ID missing"
    exit 1
}

# Check chunks exist
$chunkCount = (Get-ChildItem ".next\static\chunks" -File).Count
if ($chunkCount -lt 10) {
    Write-Error "Build incomplete: Only $chunkCount chunks found"
    exit 1
}

Write-Host "✅ Build validation passed"
```

### 5. Monitor for ChunkLoadError
Add client-side monitoring to detect ChunkLoadError:
```javascript
// Add to frontend error tracking
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('ChunkLoadError')) {
    // Log to monitoring service (Sentry, LogRocket, etc.)
    console.error('ChunkLoadError detected:', event);
  }
});
```

---

## 📊 Build Information

| Property | Value |
|----------|-------|
| **Build Date** | October 9, 2025 |
| **BUILD_ID** | `Ch721H3E1gyDRUbZYA3GV` |
| **Next.js Version** | 15.5.4 |
| **Chunk Files** | 37 |
| **Node.js Required** | 18.x or later |
| **Total Build Size** | ~102 KB (First Load JS) |

---

## ✅ Deployment Checklist

Before deploying:
- [ ] Fresh build completed (`npm run build`)
- [ ] BUILD_ID verified in `.next` folder
- [ ] All 37 chunk files present in `.next/static/chunks`
- [ ] web.config updated with new configuration
- [ ] Backup of current production taken
- [ ] Deployment window scheduled (off-peak hours)
- [ ] Stakeholders notified

During deployment:
- [ ] Site stopped
- [ ] Caches cleared (IIS + iisnode)
- [ ] Files uploaded (.next + web.config)
- [ ] File permissions verified
- [ ] Site restarted

After deployment:
- [ ] Static chunks return 200 status
- [ ] All pages load without ChunkLoadError
- [ ] Navigation between pages works
- [ ] Language switching works
- [ ] Users notified to clear browser cache
- [ ] Monitoring enabled for errors

---

## 📞 Support & Rollback

### If Deployment Fails

**Quick Rollback:**
```powershell
# Stop site
pm2 stop ersa-frontend

# Restore backup
Remove-Item ".next" -Recurse -Force
Rename-Item ".next.backup.YYYYMMDD-HHMMSS" ".next"
Copy-Item "web.config.backup.YYYYMMDD-HHMMSS" "web.config"

# Clear cache and restart
iisreset /noforce
pm2 start ersa-frontend
```

### Contact Information
- **Developer:** [Your Name]
- **Date Fixed:** October 9, 2025
- **Issue Tracker:** Document this deployment in your issue tracking system

---

## 🎯 Success Criteria

Deployment is successful when:
1. ✅ No ChunkLoadError in browser console
2. ✅ All `_next/static/chunks/*.js` return HTTP 200
3. ✅ All pages load and navigate correctly
4. ✅ Both English and Arabic versions work
5. ✅ No 500 errors in IIS logs
6. ✅ Browser cache clears resolve any remaining issues

---

**Status:** 🟢 **READY TO DEPLOY**

This package contains a complete, tested build with matching BUILD_ID and improved error handling. Deploy with confidence!

