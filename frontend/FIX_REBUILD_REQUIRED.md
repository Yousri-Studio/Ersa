# 🔧 FIX: Frontend Still Using Direct Backend Connection

## The Problem

Your frontend code is still calling the backend directly because:
- ✅ Environment variable is updated: `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=`
- ✅ Proxy route exists in build
- ❌ **The frontend JavaScript was built with the OLD URL**

**Why?** Next.js bakes `NEXT_PUBLIC_*` environment variables into the build at **build time**. Your current deployment has the old URL hardcoded.

---

## ✅ THE FIX - Rebuild & Redeploy

### Step 1: Clean Build

```powershell
cd "d:\Data\work\Ersa\frontend"

# Clean old build
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue

# Verify .env.production has proxy URL
Get-Content ".env.production"
# Should show: NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
```

### Step 2: Rebuild with Correct Environment

```powershell
# Build with production environment
npx next build
```

This will bake `/api/proxy?endpoint=` into the JavaScript files.

### Step 3: Copy to Deployment

```powershell
# Remove old deployment build
Remove-Item ".\deployment\.next" -Recurse -Force

# Copy new build
Copy-Item ".\.next" ".\deployment\.next" -Recurse -Force

# Verify the built files have proxy URL
Select-String -Path ".\deployment\.next\static\chunks\*.js" -Pattern "/api/proxy" -List
```

### Step 4: Upload to Server

You have two options:

**Option A: Upload Only .next Folder** (Faster)
1. Compress just the `.next` folder:
   ```powershell
   Compress-Archive -Path ".\deployment\.next\*" -DestinationPath ".\next-folder-only.zip" -Force
   ```
2. Upload to server
3. Extract and replace the `.next` folder in wwwroot

**Option B: Full Deployment**
1. Upload entire deployment folder
2. Replace all files

### Step 5: Restart on Server

1. SmarterASP.NET Control Panel
2. Restart Node.js
3. Wait 60 seconds

### Step 6: Test

Open browser DevTools (F12) → Network tab:
```
https://ersa-training.com/en
```

Look for requests - they should now go to:
- ✅ `/api/proxy?endpoint=courses`
- ❌ NOT `http://api.ersa-training.com/api/courses`

---

## 🚀 QUICK FIX SCRIPT

Run this complete fix:

```powershell
cd "d:\Data\work\Ersa\frontend"

Write-Host "Cleaning old build..." -ForegroundColor Yellow
Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "Verifying environment..." -ForegroundColor Yellow
$env = Get-Content ".env.production" -Raw
if ($env -match "/api/proxy") {
    Write-Host "✓ Environment configured for proxy" -ForegroundColor Green
} else {
    Write-Host "✗ ERROR: .env.production not configured!" -ForegroundColor Red
    Write-Host "Add this line: NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=" -ForegroundColor Yellow
    exit 1
}

Write-Host "Building with proxy URL..." -ForegroundColor Yellow
npx next build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Build successful" -ForegroundColor Green
    
    Write-Host "Copying to deployment..." -ForegroundColor Yellow
    Remove-Item ".\deployment\.next" -Recurse -Force
    Copy-Item ".\.next" ".\deployment\.next" -Recurse -Force
    
    Write-Host "✓ Deployment folder updated" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOW: Upload deployment\.next folder to server and restart Node.js" -ForegroundColor Cyan
} else {
    Write-Host "✗ Build failed!" -ForegroundColor Red
}
```

---

## 🔍 HOW TO VERIFY IT'S USING PROXY

### Method 1: Browser DevTools
1. Open `https://ersa-training.com/en`
2. Press F12 → Network tab
3. Reload page
4. Look for API calls
5. **Should see**: `/api/proxy?endpoint=courses`
6. **Should NOT see**: `api.ersa-training.com`

### Method 2: Check Build Files
```powershell
# Search for proxy URL in built files
Select-String -Path ".\deployment\.next\static\chunks\*.js" -Pattern "/api/proxy"
```

Should find multiple matches.

### Method 3: Check Server Logs
In iisnode logs on server, you should see:
```
[API Proxy GET] courses
```

---

## ⚠️ IMPORTANT NOTES

1. **Environment Variables are Baked In**
   - `NEXT_PUBLIC_*` vars are replaced at BUILD time
   - Changing `.env.production` after build does nothing
   - Must rebuild after changing environment

2. **Two Different URLs**
   - `NEXT_PUBLIC_API_BASE_URL` → Used by frontend (browser)
   - `BACKEND_API_URL` → Used by proxy (server-side)

3. **Cache Issues**
   - Clear browser cache after deployment
   - Hard refresh: Ctrl+Shift+R (Windows) / Cmd+Shift+R (Mac)

---

## 📋 CHECKLIST

Before uploading:
- [ ] Cleaned old `.next` folder
- [ ] `.env.production` has `/api/proxy?endpoint=`
- [ ] Built with `npx next build`
- [ ] Build completed successfully
- [ ] Copied to `deployment\.next`
- [ ] Verified proxy URL in build files

After uploading:
- [ ] Uploaded new `.next` folder
- [ ] Restarted Node.js on server
- [ ] Cleared browser cache
- [ ] Tested in DevTools Network tab
- [ ] Confirmed requests go to `/api/proxy`

---

## 🎯 THE KEY ISSUE

**Your proxy works**, but your **frontend code still has the old URL hardcoded** from the previous build.

**Solution**: Rebuild so the new proxy URL gets baked into the JavaScript.

---

**Time to fix**: 5-10 minutes (rebuild + upload)
**Critical**: Must rebuild with correct .env.production
**Test**: Check DevTools Network tab to verify

