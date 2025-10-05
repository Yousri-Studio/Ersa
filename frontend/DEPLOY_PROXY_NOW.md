# 🎯 QUICK START - API Proxy Deployment

## What We Did

✅ Created API proxy route: `app/api/proxy/route.ts`
✅ Updated environment config: `.env.production`
✅ Started Next.js build with proxy included
⏳ Waiting for build to complete...

---

## After Build Completes - Run This:

```powershell
cd "d:\Data\work\Ersa\frontend"
.\deploy-proxy.ps1
```

This script will:
1. ✅ Copy new build to deployment folder
2. ✅ Copy updated .env.production
3. ✅ Verify proxy route exists
4. ✅ Create deployment ZIP
5. ✅ Open folder for easy upload

---

## OR Manual Steps:

### 1. Copy Build Files
```powershell
cd "d:\Data\work\Ersa\frontend"

# Remove old build
Remove-Item ".\deployment\.next" -Recurse -Force

# Copy new build
Copy-Item ".\.next" ".\deployment\.next" -Recurse -Force

# Copy environment
Copy-Item ".\.env.production" ".\deployment\.env.production" -Force
```

### 2. Verify Proxy Exists
```powershell
Test-Path ".\deployment\.next\server\app\api\proxy\route.js"
```
Should return: `True`

### 3. Create ZIP
```powershell
Compress-Archive -Path ".\deployment\*" -DestinationPath ".\deployment-with-proxy.zip" -Force
```

### 4. Upload to Server
- Upload `deployment-with-proxy.zip` to SmarterASP.NET
- Extract in `h:\root\home\ersatc-001\www\ersatraining\`

### 5. Update .env.production on Server
Edit file on server to include:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

### 6. Restart Node.js
- Control Panel → Restart Node.js
- Wait 60 seconds

### 7. Test
```
https://ersa-training.com/api/proxy?endpoint=courses
```
Should return course data!

---

## 🧪 Testing the Proxy

### Test 1: Direct Proxy Call
Open browser:
```
https://ersa-training.com/api/proxy?endpoint=courses
```
Expected: JSON array of courses

### Test 2: Check Site
Open:
```
https://ersa-training.com/en
```
Expected:
- ✅ No mixed content errors in console
- ✅ Course data loads
- ✅ All API calls work

### Test 3: DevTools Network Tab
- Open DevTools (F12)
- Go to Network tab
- Reload page
- Look for `/api/proxy?endpoint=` requests
- All should be 200 OK status
- No blocked/red requests

---

## 📋 Environment Variables

**Frontend (.env.production)**
```bash
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

**How they work:**
- `NEXT_PUBLIC_API_BASE_URL`: Used by browser (client-side)
  - Frontend makes calls to `/api/proxy?endpoint=courses`
- `BACKEND_API_URL`: Used by proxy (server-side)
  - Proxy forwards to `http://api.ersa-training.com/api/courses`

---

## 🎯 Benefits

✅ **No more mixed content errors** - All requests are HTTPS
✅ **No backend changes** - Your API stays on HTTP
✅ **Same functionality** - All API features work
✅ **Better security** - Browser only sees HTTPS
✅ **Easy monitoring** - All API traffic goes through proxy

---

## ⏱️ Timeline

- ✅ Build started: In progress
- ⏳ Build completes: ~2-5 minutes
- ⏳ Run deploy script: 1 minute
- ⏳ Upload & restart: 3-5 minutes
- **Total**: ~10-15 minutes until site works!

---

## 🆘 If Something Goes Wrong

### Build fails
```powershell
cd "d:\Data\work\Ersa\frontend"
npx next build
```
Check output for errors.

### Proxy not found after build
- Check `app/api/proxy/route.ts` exists
- Rebuild: `npx next build`

### 404 on proxy endpoint
- Verify `.next/server/app/api/proxy/route.js` exists in deployment
- Restart Node.js on server

### Still get mixed content errors
- Check `.env.production` on server has correct values
- Clear browser cache
- Check DevTools console for actual URLs being called

---

**Status**: ⏳ Building with API proxy
**Next**: Run `deploy-proxy.ps1` after build completes
**Result**: Mixed content issue will be resolved! 🎉

