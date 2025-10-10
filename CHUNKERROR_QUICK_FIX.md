# 🚀 Quick Fix: ChunkLoadError on Production

## Problem
```
ChunkLoadError: Loading chunk 7639 failed.
(error: https://ersa-training.com/_next/static/chunks/7639-eefad8b226f5216c.js)
```

## ✅ Solution: Deploy Fresh Build

### 🎯 What to Do NOW

1. **Upload to Production:**
   ```
   ProxyDeploymentReady/.next/        → Production server
   ProxyDeploymentReady/web.config    → Production server
   ```

2. **Restart Production Site:**
   ```powershell
   pm2 restart ersa-frontend
   # OR
   iisreset /noforce
   ```

3. **Clear Caches:**
   - Server: Clear IIS cache and restart
   - Users: Tell them to hard refresh (Ctrl + Shift + R)

### 📋 Files Ready to Deploy
The `ProxyDeploymentReady` folder now contains:
- ✅ Fresh `.next` build (BUILD_ID: `Ch721H3E1gyDRUbZYA3GV`)
- ✅ 37 JavaScript chunks (all working)
- ✅ Updated `web.config` (improved error handling)

### 📖 Detailed Instructions
See: `ProxyDeploymentReady/CHUNKERROR_FIX_DEPLOYMENT.md`

---

## Why This Happened

The production site had an **old build** with BUILD_ID `ZAabcM6-KQ3XopTYaOmQt` but was trying to load chunks from a **different build**. This caused 500 errors.

**Solution:** Deploy a complete, fresh build where all files have the same BUILD_ID.

---

## Prevention

**Always deploy the ENTIRE `.next` folder** - never copy individual files!

❌ **Don't:**
```powershell
Copy-Item ".next\static\chunks\*.js" -Destination "production\"
```

✅ **Do:**
```powershell
Remove-Item "production\.next" -Recurse
Copy-Item ".next" -Destination "production\.next" -Recurse
```

---

## Verification

After deployment, check:
1. Open https://ersa-training.com/en
2. Open browser DevTools (F12) → Network tab
3. Refresh page
4. All `_next/static/chunks/*.js` should show `200 OK` ✅
5. No ChunkLoadError in Console ✅

---

**Status:** 🟢 Ready to deploy
**Build Date:** October 9, 2025
**Deployment Package:** `ProxyDeploymentReady/`

