# 🔍 Test Backend API - Quick Diagnosis

## Why You're Getting 500 Error

The 500 error could be caused by several issues. Let's test them one by one.

---

## ✅ Test 1: Is Backend Running?

Open your browser or run this in PowerShell:

```powershell
curl http://api.ersa-training.com/api/courses
```

### Expected Result:
- Should return JSON with courses data
- Status code: 200

### If it fails:
- Backend server is down or not accessible
- IIS is not running
- Backend API is not deployed correctly

---

## ✅ Test 2: Can Backend Handle Login?

Test the login endpoint directly:

```powershell
curl "http://api.ersa-training.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'
```

### Expected Result:
- Should return JWT token and user data
- Status code: 200

### If it returns 401:
- Wrong credentials
- User doesn't exist in production database

### If it returns 500:
- Backend has an error (check backend logs)
- Database connection issue
- JWT configuration issue

---

## ✅ Test 3: Test Your Frontend Proxy

Once backend works directly, test through the proxy:

```powershell
curl "https://ersa-training.com/api/proxy?endpoint=/courses"
```

### Expected Result:
- Should return the same data as Test 1
- Status code: 200

### If it returns 500:
- Proxy can't reach backend
- Network/firewall blocking HTTP from frontend server to backend
- CORS issue

---

## 🚨 Common Issues & Solutions

### Issue 1: Backend Returns "Cannot GET /api/api/courses"
**Problem**: Double `/api` in the URL

**Solution**: Already fixed in proxy route.ts

### Issue 2: Backend Not Accessible from Frontend Server
**Problem**: Frontend server (SmarterASP) can't reach backend server

**Causes**:
- Backend is on different network
- Firewall blocking HTTP requests
- Backend subdomain `api.ersa-training.com` not configured properly

**Solution**: 
- Check if `api.ersa-training.com` resolves correctly
- Test from frontend server (SSH or RDP into it)
- May need to use internal IP instead of domain name

### Issue 3: CORS Error
**Problem**: Backend rejects requests from frontend

**Solution**: Check `appsettings.json` CORS settings:
```json
"Cors": {
  "AllowedOrigins": [
    "https://ersa-training.com",
    "https://www.ersa-training.com"
  ]
}
```

### Issue 4: Database Connection Failed
**Problem**: Backend can't connect to database

**Solution**: 
- Check connection string in `appsettings.json`
- Verify database server is running
- Check backend logs for connection errors

---

## 🔧 Quick Fix Steps

### Step 1: Test Backend Directly
```
http://api.ersa-training.com/api/courses
```

**✅ Works?** → Go to Step 2  
**❌ Fails?** → Fix backend first! Check:
  - IIS/backend service status
  - Backend logs
  - Database connection
  - `appsettings.json` configuration

### Step 2: Test Login Directly
```
curl http://api.ersa-training.com/api/auth/login -POST
```

**✅ Works?** → Go to Step 3  
**❌ Fails?** → Check:
  - User credentials in database
  - Backend logs for errors
  - JWT configuration

### Step 3: Test Through Proxy
```
https://ersa-training.com/api/proxy?endpoint=/courses
```

**✅ Works?** → Great! Try login through browser  
**❌ Fails?** → Check:
  - Can frontend server reach backend?
  - Network connectivity
  - Proxy logs (Next.js console)

---

## 🎯 What to Check Right Now

Run these commands in order:

```powershell
# Test 1: Backend health
curl http://api.ersa-training.com/api/courses

# Test 2: Backend login
curl "http://api.ersa-training.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'

# Test 3: Proxy health  
curl https://ersa-training.com/api/proxy?endpoint=/courses

# Test 4: Proxy login
curl "https://ersa-training.com/api/proxy?endpoint=/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'
```

---

## 📊 Interpreting Results

| Test | Result | Meaning | Next Action |
|------|--------|---------|-------------|
| Backend health | ✅ 200 | Backend is running | Continue to login test |
| Backend health | ❌ 500/Error | Backend problem | Check backend logs/IIS |
| Backend login | ✅ 200 | Auth works | Test proxy |
| Backend login | ❌ 401 | Wrong credentials | Check database users |
| Backend login | ❌ 500 | Backend error | Check backend logs |
| Proxy health | ✅ 200 | Proxy works | Test proxy login |
| Proxy health | ❌ 500 | Can't reach backend | Network/firewall issue |
| Proxy login | ✅ 200 | Everything works! | Try in browser |
| Proxy login | ❌ 500 | See proxy logs | Check Next.js console |

---

## 🔍 Where to Find Logs

### Backend Logs:
- Location: `backend/logs/log-[date].txt`
- Check for:
  - Database connection errors
  - Authentication errors
  - JWT validation errors
  - Exception details

### Frontend Logs:
- On server: Check Node.js application logs
- Look for:
  - `[API Proxy]` messages
  - Connection timeout errors
  - `ECONNREFUSED` or `ETIMEDOUT`

---

## 💡 Most Likely Issue

Based on your 500 error, the most common causes are:

1. **Backend Not Running** (60% probability)
   - Solution: Start backend service/IIS

2. **Wrong Credentials** (20% probability)
   - Solution: Verify user exists in production DB

3. **Network Issue** (15% probability)
   - Solution: Check if frontend can reach backend

4. **Backend Error** (5% probability)
   - Solution: Check backend logs for exceptions

---

**Run Test 1 first and tell me what you get!** 🚀

