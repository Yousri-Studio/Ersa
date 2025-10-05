# 🚀 API PROXY DEPLOYMENT GUIDE

## What Was Done

Created an API proxy in your Next.js frontend to solve the mixed content issue:
- ✅ Frontend makes HTTPS calls to `/api/proxy?endpoint=...`
- ✅ Proxy forwards to HTTP backend API server-side
- ✅ No browser mixed content errors
- ✅ No backend changes needed

---

## Files Created/Modified

### 1. API Proxy Route
**Location**: `frontend/app/api/proxy/route.ts`

This handles all HTTP methods (GET, POST, PUT, DELETE) and forwards them to your backend API.

### 2. Environment Configuration
**Updated**: `frontend/.env.production`

```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

- `NEXT_PUBLIC_API_BASE_URL`: Used by frontend code (browser)
- `BACKEND_API_URL`: Used by proxy on server-side

---

## 📦 Deployment Steps

### Step 1: Wait for Build to Complete

The build is currently running. Wait for it to finish.

### Step 2: Copy Files to Deployment Folder

After build completes, run:

```powershell
cd "d:\Data\work\Ersa\frontend"

# Copy the new .next build
Remove-Item ".\deployment\.next" -Recurse -Force -ErrorAction SilentlyContinue
Copy-Item ".\.next" ".\deployment\.next" -Recurse -Force

# Copy the new .env.production
Copy-Item ".\.env.production" ".\deployment\.env.production" -Force

# Verify proxy route exists
Test-Path ".\.next\server\app\api\proxy\route.js"
```

### Step 3: Upload to Server

**Option A: Full Re-upload**
1. Compress the `deployment` folder
2. Upload to SmarterASP.NET
3. Extract in wwwroot
4. Replace all files

**Option B: Update Only Changed Files** (Faster)
Upload these specific files/folders:
- `.env.production`
- `.next/server/app/api/proxy/` (new proxy route)
- `.next/BUILD_ID` (updated build)
- `.next/server/app/` (updated app routes)

### Step 4: Update .env.production on Server

In SmarterASP.NET File Manager, edit:
`h:\root\home\ersatc-001\www\ersatraining\.env.production`

```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

### Step 5: Restart Node.js

1. Go to Control Panel
2. Node.js Manager
3. Click **Restart**
4. Wait 60 seconds

### Step 6: Test

Visit: `https://ersa-training.com/en`

The site should now load with all API data!

---

## 🧪 How to Test the Proxy

### Test 1: Direct Proxy Call
```
https://ersa-training.com/api/proxy?endpoint=courses
```
Should return JSON with course data.

### Test 2: Check Browser Console
Open DevTools (F12) → Console
Should NOT see any `(blocked:mixed-content)` errors anymore.

### Test 3: Network Tab
Open DevTools → Network tab
- All API calls should go to `/api/proxy?endpoint=...`
- Status should be 200 OK
- No red/blocked requests

---

## 📋 How It Works

**Before (Mixed Content Error):**
```
Browser (HTTPS) → http://api.ersa-training.com/api/courses ❌
```

**After (With Proxy):**
```
Browser (HTTPS) → https://ersa-training.com/api/proxy?endpoint=courses ✅
                   ↓ (server-side)
                   http://api.ersa-training.com/api/courses ✅
```

The browser only sees HTTPS calls!

---

## 🔍 Example API Calls

Your frontend code doesn't need to change much. The API calls will look like:

**Get Courses:**
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}courses`)
// Translates to: /api/proxy?endpoint=courses
```

**Get Course by ID:**
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}courses/123`)
// Translates to: /api/proxy?endpoint=courses/123
```

**Post Data:**
```javascript
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}contact`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
})
// Translates to: /api/proxy?endpoint=contact
```

---

## ✅ Advantages

- ✅ No mixed content errors
- ✅ Works with HTTPS frontend
- ✅ No backend changes needed
- ✅ Same CORS configuration works
- ✅ Can add caching/rate limiting later
- ✅ Can add authentication headers
- ✅ Easy to monitor API calls

## ⚠️ Considerations

- ⚠️ Slight latency increase (one extra hop)
- ⚠️ Server load increases (proxy processing)
- ⚠️ Need to handle large file uploads carefully

---

## 🔧 Troubleshooting

### Issue: Proxy returns 404
**Solution**: Verify the proxy route was built and deployed:
- Check: `.next/server/app/api/proxy/route.js` exists
- Rebuild if necessary

### Issue: Proxy returns 500
**Solution**: Check iisnode logs for proxy errors:
- Look for `[API Proxy]` messages
- Verify `BACKEND_API_URL` is correct in `.env.production`

### Issue: CORS errors still appear
**Solution**: CORS should not be an issue anymore since browser sees same-origin requests.
If still appearing, check backend CORS allows the requests.

---

## 🎯 Next Steps After Deployment

1. **Test all features** - courses, contact forms, login, etc.
2. **Monitor performance** - check proxy response times
3. **Check logs** - look for any proxy errors in iisnode logs
4. **Future**: When backend gets HTTPS, update `BACKEND_API_URL` to use `https://`

---

## 📞 Quick Reference

**Proxy Endpoint**: `/api/proxy?endpoint=<path>`

**Environment Variables:**
- Frontend (browser): `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=`
- Backend (server): `BACKEND_API_URL=http://api.ersa-training.com/api`

**Test URL**: `https://ersa-training.com/api/proxy?endpoint=courses`

---

**Status**: Proxy implemented ✅
**Ready to deploy**: After build completes
**Expected result**: No more mixed content errors!

