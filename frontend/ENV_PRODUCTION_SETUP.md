# 🔧 Production Environment Setup - URGENT FIX

## 🚨 Issue Found: Wrong Backend URL!

Your proxy was using `http://lapi.ersa-training.com/api` (typo!)  
Should be: `http://api.ersa-training.com/api`

**Note**: Backend uses HTTP (no SSL), frontend proxy handles HTTPS

**Status**: ✅ Fixed in code (proxy route.ts)

---

## 📋 What You Need to Do Now

### Step 1: Create `.env.production` File

In your `frontend` folder, create a file named `.env.production` with this content:

```bash
# Production Environment Variables
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
PORT=3000
```

### Step 2: Rebuild Frontend

```bash
cd D:\Data\work\Ersa\frontend
npm run build
```

### Step 3: Deploy to Production

Upload these files:
- ✅ `.next/` folder (rebuilt)
- ✅ `app/api/proxy/route.ts` (fixed typo)
- ✅ `.env.production` (new file with correct URL)

---

## 🔍 How Environment Variables Work

### In Development (Local):
```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://localhost:5002/api
```

### In Production (Server):
```bash
# .env.production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

---

## 🎯 What Each Variable Does

### `NEXT_PUBLIC_API_BASE_URL`
- **Used by**: Browser (client-side)
- **Value**: `/api/proxy?endpoint=`
- **Purpose**: Makes browser send requests to the Next.js proxy

### `BACKEND_API_URL`
- **Used by**: Next.js proxy (server-side only)
- **Value**: `http://api.ersa-training.com/api`
- **Purpose**: Proxy knows where to forward requests

---

## 🔄 Request Flow

### Correct Flow (After Fix):
```
Browser → https://ersa-training.com/api/proxy?endpoint=/auth/login (HTTPS)
          ↓ (Next.js Proxy)
          → http://api.ersa-training.com/api/auth/login (HTTP) ✅
          ↓
          Backend API responds
```

### Old Flow (With Typo):
```
Browser → /api/proxy?endpoint=/auth/login
          ↓ (Next.js Proxy)
          → http://lapi.ersa-training.com/api/auth/login ❌
          ↓
          DNS error / No such host
```

---

## 🚀 Quick Deploy Instructions

### Option 1: Quick Fix (Just the Proxy File)

1. **Upload** `app/api/proxy/route.ts` to server
2. **Restart** Node.js application
3. **Test** login

### Option 2: Complete Fix (Rebuild + Deploy)

1. **Create** `.env.production` file:
   ```bash
   NODE_ENV=production
   NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
   BACKEND_API_URL=http://api.ersa-training.com/api
   PORT=3000
   ```

2. **Rebuild**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Upload to server**:
   - Delete old `.next` folder
   - Upload new `.next` folder
   - Upload `app/api/proxy/route.ts`
   - Upload `.env.production`

4. **Restart** Node.js

5. **Test** login

---

## ✅ Testing After Fix

### Test 1: Check Proxy URL
```bash
# Should respond successfully
curl https://ersa-training.com/api/proxy?endpoint=/courses
```

### Test 2: Check Backend Directly
```bash
# Should respond successfully
curl https://api.ersa-training.com/api/courses
```

### Test 3: Login
```bash
curl "https://ersa-training.com/api/proxy?endpoint=/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ersa-training.com","password":"SuperAdmin123!"}'
```

Should return:
```json
{
  "token": "eyJ...",
  "user": { ... }
}
```

---

## 🔧 Server Configuration

### On SmarterASP.NET:

The `.env.production` file should be in your site root:
```
h:\root\home\ersatc-001\www\ersatraining\
├── .env.production          ← NEW FILE
├── .next\
├── app\
│   └── api\
│       └── proxy\
│           └── route.ts     ← FIXED FILE
├── start.js
├── web.config
└── ...
```

### Environment Variables on Server:

Some hosting platforms let you set environment variables in the control panel. If SmarterASP.NET has this, set:

- `BACKEND_API_URL` = `http://api.ersa-training.com/api`
- `NEXT_PUBLIC_API_BASE_URL` = `/api/proxy?endpoint=`
- `NODE_ENV` = `production`

---

## ❌ Common Issues

### Issue: "Wrong username or password"

**Causes**:
1. Backend not deployed with session fixes
2. Different admin credentials in production database
3. Backend not reachable at `api.ersa-training.com`

**Solutions**:
```bash
# 1. Test if backend is accessible
curl https://api.ersa-training.com/api/courses

# 2. Try to login directly to backend
curl https://api.ersa-training.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ersa-training.com","password":"SuperAdmin123!"}'

# 3. Check what credentials are in production database
# Login to SQL Server and check Users table
```

### Issue: Session still expires quickly

**Solution**: Deploy the backend session fixes first!
```bash
cd D:\Data\work\Ersa\backend
# Run: deploy-session-fix.bat
# Upload backend changes to server
```

---

## 📝 Summary of Changes

| File | Change | Status |
|------|--------|--------|
| `app/api/proxy/route.ts` | Fixed typo: `lapi` → `api` | ✅ Fixed |
| `.env.production` | Created with correct URL | ⚠️ Need to create |
| Backend | Session timeout fixes | ⚠️ Need to deploy |

---

## 🎯 Next Steps (In Order)

1. ✅ **Fixed**: Proxy URL typo
2. ⚠️ **TODO**: Create `.env.production` file
3. ⚠️ **TODO**: Rebuild frontend
4. ⚠️ **TODO**: Deploy backend session fixes
5. ⚠️ **TODO**: Deploy frontend with fixed proxy
6. ⚠️ **TODO**: Test login

---

## 🆘 Still Not Working?

Check these in order:

1. **Is backend running?**
   ```bash
   curl https://api.ersa-training.com/api/courses
   ```

2. **Is proxy forwarding correctly?**
   - Check Next.js server logs
   - Should see: "Forwarding to: http://api.ersa-training.com/api/..."

3. **Are credentials correct?**
   - Check production database Users table
   - Verify email and password hash

4. **Is backend deployed with session fixes?**
   - Check `appsettings.json` has `ClockSkewMinutes: 5`
   - Backend should be rebuilt with new JWT settings

---

**The typo is fixed! Now rebuild, deploy, and test!** 🚀

