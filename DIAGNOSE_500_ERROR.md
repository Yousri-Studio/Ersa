# 🚨 Proxy Returning 500 Error - Diagnostic Guide

## 🔍 What's Happening

Your proxy calls are returning **500 Internal Server Error**:
```
https://ersa-training.com/api/proxy/?endpoint=/auth/login → 500 ❌
https://ersa-training.com/api/proxy/?endpoint=/CourseCategories → 500 ❌
```

## 📋 Possible Causes (In Order of Likelihood)

### 1. ❌ Fixed Code Not Deployed Yet
You changed the code locally but haven't uploaded it to the server yet.

**How to Check:**
- The server is still running the old code with `lapi` typo
- Fixed code is on your local machine only

**Solution:** Deploy the fixed code (instructions below)

---

### 2. ❌ Backend API Not Reachable
The proxy can't connect to `http://api.ersa-training.com/api`

**How to Check:**
```bash
# Test from your local machine
curl http://api.ersa-training.com/api/courses

# Or test with browser
# Visit: http://api.ersa-training.com/api/courses
```

**If this fails:**
- Backend is down
- DNS not configured
- Firewall blocking requests

---

### 3. ❌ Environment Variable Not Set
`BACKEND_API_URL` is not set on the production server

**How to Check:**
- Look at Next.js server logs
- Should see which URL the proxy is trying to reach

**Solution:** Set environment variable or rely on fallback URL

---

## 🔧 Quick Diagnostic Steps

### Step 1: Check Backend API
```bash
# Can you reach the backend directly?
curl http://api.ersa-training.com/api/courses

# Expected: JSON response with courses
# If fails: Backend is the problem, not the proxy
```

### Step 2: Check Next.js Server Logs
Login to your hosting and check the logs. Look for:
```
[API Proxy POST] /auth/login
[API Proxy] Forwarding to: http://???/api/auth/login
[API Proxy] Error: ...
```

This will tell you:
- What URL it's trying to reach
- What error is occurring

### Step 3: Check Deployed Files
Verify these files on your server:
- `app/api/proxy/route.ts` - Has the fix?
- `.env.production` - Has `BACKEND_API_URL`?
- `.next/` folder - Rebuilt after fix?

---

## 🚀 Fix It Now

### Option A: Quick Test (Check Backend First)

Before deploying anything, verify the backend is accessible:

```bash
# From your local machine
curl -v http://api.ersa-training.com/api/courses

# Should return JSON, not error
```

**If backend is NOT accessible:**
1. Check if backend server is running
2. Check DNS: Does `api.ersa-training.com` resolve?
3. Check firewall/security rules
4. Fix backend first, then come back to frontend

---

### Option B: Deploy Fixed Frontend

If backend is accessible, deploy the fix:

#### 1. **Verify Local Fix**
Check that `frontend/app/api/proxy/route.ts` has:
```typescript
const API_BASE_URL = process.env.BACKEND_API_URL || 'http://api.ersa-training.com/api';
```

**NOT**:
```typescript
const API_BASE_URL = process.env.BACKEND_API_URL || 'http://lapi.ersa-training.com/api';
```

#### 2. **Create Environment File**

Create `frontend/.env.production`:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
PORT=3000
```

#### 3. **Rebuild**
```bash
cd D:\Data\work\Ersa\frontend
npm run build
```

Wait for build to complete (2-3 minutes)

#### 4. **Deploy**

Upload to server:
- `app/api/proxy/route.ts` (fixed file)
- `.next/` folder (rebuilt)
- `.env.production` (new file)

#### 5. **Restart Node.js**

In SmarterASP.NET control panel:
- Go to Node.js Manager
- Click Restart
- Wait 1 minute

#### 6. **Test Again**
```bash
curl "https://ersa-training.com/api/proxy?endpoint=/courses"
```

---

## 🔍 Advanced Troubleshooting

### Check Server Environment

SSH or access your server console and check:

```bash
# Check if environment variable is set
echo $BACKEND_API_URL

# Check if .env.production exists
ls -la .env.production
cat .env.production
```

### Check Next.js Process

```bash
# Check if Next.js is running
ps aux | grep node

# Check Node.js error logs
# Location depends on your hosting setup
```

### Test Proxy Directly

```bash
# Test proxy with a simple endpoint
curl -v "https://ersa-training.com/api/proxy?endpoint=/courses"

# Look for:
# - 500 error
# - Error message in response
# - Connection errors
```

---

## 📊 Error Analysis

### 500 Error Means:

| Scenario | Proxy Logs Would Show |
|----------|----------------------|
| **Backend unreachable** | "fetch failed", "ECONNREFUSED" |
| **DNS failure** | "getaddrinfo ENOTFOUND" |
| **Timeout** | "request timeout" |
| **Wrong URL** | "fetch failed" to wrong domain |
| **Code error** | Stack trace |

Without seeing the actual logs, we can't know which one it is.

---

## 🎯 Most Likely Scenario

Based on your symptoms, here's what's probably happening:

```
1. You fixed the typo locally ✅
   ↓
2. But haven't deployed to server yet ❌
   ↓
3. Server still has old code with "lapi" typo ❌
   ↓
4. Proxy tries to reach: http://lapi.ersa-training.com/api
   ↓
5. DNS can't resolve "lapi.ersa-training.com"
   ↓
6. Proxy crashes with 500 error
```

**Solution:** Deploy the fixed code!

---

## 🚨 Emergency Quick Fix

If you need to test RIGHT NOW without full deployment:

### 1. Check if backend works directly:
```bash
curl http://api.ersa-training.com/api/courses
```

### 2. If it works, temporarily bypass proxy:

In your browser console (F12), run:
```javascript
// Test backend directly
fetch('http://api.ersa-training.com/api/courses')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

**Note:** This will likely fail due to CORS, but will confirm if backend is reachable.

---

## 📝 Checklist

Before you deploy, verify:

- [ ] Backend API is running and accessible
- [ ] `curl http://api.ersa-training.com/api/courses` works
- [ ] Fixed proxy file locally (no "lapi" typo)
- [ ] Created `.env.production` file
- [ ] Rebuilt frontend (`npm run build`)
- [ ] Ready to upload fixed files

After deployment, verify:

- [ ] Uploaded `.next` folder
- [ ] Uploaded `app/api/proxy/route.ts`
- [ ] Uploaded `.env.production`
- [ ] Restarted Node.js
- [ ] Checked server logs for errors
- [ ] Tested: `curl "https://ersa-training.com/api/proxy?endpoint=/courses"`

---

## 🆘 Still Getting 500?

If you've deployed and still getting 500:

1. **Check Server Logs** - This is CRITICAL
   - Find where Next.js logs are stored
   - Look for error messages
   - Share them for further diagnosis

2. **Check Backend Connectivity FROM Server**
   - SSH into your hosting server
   - Run: `curl http://api.ersa-training.com/api/courses`
   - If this fails, it's a network/firewall issue

3. **Verify Files Deployed**
   - Check file timestamps
   - Make sure new files were actually uploaded
   - Clear any CDN cache

4. **Test Simpler Endpoint**
   ```bash
   # Try a GET endpoint first
   curl "https://ersa-training.com/api/proxy?endpoint=/courses"
   ```

---

## 📞 What We Need to Know

To help you further, we need:

1. **Server Logs** - What does Next.js log say?
2. **Backend Status** - Does `http://api.ersa-training.com/api/courses` work?
3. **File Timestamps** - When were files last updated on server?
4. **Deployment Status** - Did you deploy the fixed code yet?

---

**Most Important:** Check the server logs first! The 500 error means the proxy is crashing, and the logs will tell us exactly why.

