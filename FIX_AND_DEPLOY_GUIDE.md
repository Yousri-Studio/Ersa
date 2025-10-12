# 🚀 Fix and Deploy Guide - Complete Solution

## ✅ What Was Fixed

### 1. Enhanced Proxy Logging
**File**: `frontend/app/api/proxy/route.ts`

Added detailed logging to help diagnose the 500 error:
- Logs the exact URL being called
- Logs the request body being sent
- Logs the backend response status
- Captures and logs error response bodies
- Shows full error stack traces

This will help us see exactly what's going wrong.

### 2. Verified Request Flow
The request flow is **CORRECT**:
```
Browser → https://ersa-training.com/api/proxy?endpoint=/auth/login
         ↓
Proxy → http://api.ersa-training.com/api/auth/login (HTTP)
         ↓
Backend → Processes at api/Auth/login
```

---

## 🎯 Root Cause Analysis

Based on your curl comparison, the flow is working correctly. The 500 error is likely caused by:

### Most Likely: Backend Issue (80%)
1. **Database connection failed** - Backend can't reach SQL Server
2. **User doesn't exist** - `operations@ersa-training.com` not in production DB
3. **JWT configuration missing** - appsettings.json not deployed correctly
4. **Backend service down** - IIS not running or crashed

### Less Likely: Network Issue (15%)
- Frontend server can't reach backend server
- Firewall blocking HTTP requests
- DNS not resolving `api.ersa-training.com`

### Unlikely: Request Format (5%)
- The request format is correct based on your curl

---

## 📋 Deploy and Test Steps

### Step 1: Deploy Updated Proxy (5 minutes)

```powershell
cd D:\Data\work\Ersa\frontend

# Create .env.production if it doesn't exist
echo NODE_ENV=production > .env.production
echo NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint= >> .env.production
echo BACKEND_API_URL=http://api.ersa-training.com/api >> .env.production
echo PORT=3000 >> .env.production

# Rebuild
npm run build

# Create deployment package
mkdir deployment-proxy-fix
xcopy .next deployment-proxy-fix\.next\ /E /I /Y
xcopy app deployment-proxy-fix\app\ /E /I /Y
copy package.json deployment-proxy-fix\
copy web.config deployment-proxy-fix\

# Create ZIP
powershell Compress-Archive -Path "deployment-proxy-fix\*" -DestinationPath "proxy-fix.zip" -Force
```

### Step 2: Upload to Server

1. Login to SmarterASP.NET
2. Go to File Manager
3. **DELETE** old `.next` folder
4. **UPLOAD** `proxy-fix.zip`
5. **EXTRACT** the ZIP
6. **RESTART** Node.js application
7. **WAIT** 1-2 minutes for restart

### Step 3: Test and Check Logs

Open browser and try to login at:
```
https://ersa-training.com/en/admin-login
```

Then check the Next.js server logs on SmarterASP.NET. You should see detailed logs like:

```
[API Proxy POST] /auth/login
[API Proxy] Forwarding POST to: http://api.ersa-training.com/api/auth/login
[API Proxy] Request body: {"email":"operations@ersa-training.com","password":"Operations123!"}
[API Proxy] Backend response status: 500
[API Proxy] Error response body: {"error":"Internal server error","message":"ACTUAL ERROR MESSAGE HERE"}
```

**The error message will tell us exactly what's wrong!**

---

## 🔍 Interpreting the Logs

### If you see: "ECONNREFUSED" or "ETIMEDOUT"
**Problem**: Frontend server can't reach backend server  
**Fix**: 
- Check if backend is running
- Verify `api.ersa-training.com` resolves correctly
- Check firewall settings

### If you see: "Cannot connect to database"
**Problem**: Backend can't connect to SQL Server  
**Fix**:
- Check SQL Server is running
- Verify connection string in backend `appsettings.json`
- Check database firewall allows backend server IP

### If you see: "User not found" or "Invalid email or password"
**Problem**: User doesn't exist in production database  
**Fix**:
- Run database seeding script
- Or create user manually in database

### If you see: "JWT configuration error"
**Problem**: Backend `appsettings.json` missing JWT settings  
**Fix**:
- Deploy backend with correct `appsettings.json`
- Verify Jwt:SecretKey, Issuer, and Audience are set

### If you see: Backend returns HTML instead of JSON
**Problem**: IIS is returning error page instead of API response  
**Fix**:
- Check backend IIS configuration
- Verify backend is deployed correctly
- Check backend application pool is running

---

## 🧪 Quick Backend Test

To verify if backend is working, test it directly (NOT through proxy):

```powershell
# Test 1: Check if backend is accessible
curl http://api.ersa-training.com/api/courses

# Test 2: Try login directly
curl "http://api.ersa-training.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'
```

**If Test 1 fails**: Backend is down or not accessible  
**If Test 2 fails with 401**: Wrong credentials  
**If Test 2 fails with 500**: Backend has an error (check backend logs)  
**If both pass**: Backend is fine, issue is in proxy/network

---

## 📊 Decision Tree

```
1. Deploy updated proxy with enhanced logging
   ↓
2. Try login at https://ersa-training.com/en/admin-login
   ↓
3. Check Next.js logs for detailed error
   ↓
   ├─ "ECONNREFUSED" → Backend not accessible → Check IIS/backend service
   ├─ "Cannot connect to database" → DB issue → Check SQL Server
   ├─ "User not found" → Data issue → Check database users
   ├─ "JWT error" → Config issue → Check appsettings.json
   └─ Other error → Share the exact error message
```

---

## 🎯 Next Actions (In Order)

1. ✅ **DONE**: Enhanced proxy with detailed logging
2. ⏳ **TODO**: Deploy updated proxy to production
3. ⏳ **TODO**: Try login and check server logs
4. ⏳ **TODO**: Share the exact error message from logs
5. ⏳ **TODO**: Fix the specific issue based on error message

---

## 💡 Quick Reference

### Current Configuration
```bash
# Environment Variables (.env.production)
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api  # ← HTTP (no SSL)
PORT=3000
```

### Request Flow
```
Browser (HTTPS) → Frontend Proxy (HTTPS) → Backend API (HTTP)
    ↓                      ↓                        ↓
ersa-training.com    /api/proxy         api.ersa-training.com
```

### Backend Route
```csharp
[Route("api/[controller]")]  // = "api/Auth"
[HttpPost("login")]           // Full: "api/Auth/login"
```

### Frontend Call
```typescript
api.post('/auth/login', { email, password })
// With baseURL: /api/proxy?endpoint=
// Final: /api/proxy?endpoint=/auth/login
```

---

## ✨ What to Share With Me

After deploying and testing, share:

1. **The exact error from Next.js server logs** (the lines starting with `[API Proxy]`)
2. **Browser Network tab** - Screenshot of the failed request/response
3. **Backend direct test results** - Did `curl http://api.ersa-training.com/api/auth/login` work?

With this information, I can tell you exactly what's wrong and how to fix it! 🚀

---

**Deploy the updated proxy now and let's see what the logs reveal!**

