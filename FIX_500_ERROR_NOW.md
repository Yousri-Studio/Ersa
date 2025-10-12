# 🚨 FIX 500 ERROR - 3 Simple Steps

## ⚡ Step 1: Test Backend (1 minute)

Open browser and go to:
```
https://api.ersa-training.com/api/courses
```

### ✅ If you see JSON data:
Backend is working! Go to Step 2.

### ❌ If you see error or nothing:
**STOP!** Backend is the problem. Fix backend first:
1. Check if backend server is running
2. Check if IIS/API service is started
3. Check database connection
4. Check backend logs

---

## ⚡ Step 2: Deploy Fixed Code (5 minutes)

### A. Create `.env.production` file

In `D:\Data\work\Ersa\frontend\`, create a new file named `.env.production`:

```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
PORT=3000
```

### B. Run the deployment script

```
Double-click: D:\Data\work\Ersa\frontend\fix-production-url.bat
```

Wait for it to finish (2-3 minutes)

### C. Upload to server

1. Login to SmarterASP.NET
2. Go to File Manager
3. Navigate to your site folder
4. **DELETE** the old `.next` folder
5. **UPLOAD** `production-url-fix.zip`
6. **EXTRACT** the ZIP file
7. **DELETE** the ZIP after extraction

### D. Restart Node.js

1. Go to Node.js Manager in control panel
2. Click **Restart**
3. Wait 1 minute

---

## ⚡ Step 3: Test (30 seconds)

Open browser and go to:
```
https://ersa-training.com/api/test-backend
```

### ✅ If you see JSON with `"success": true`:
Great! Now try logging in.

### ❌ If you see errors:
Check what the test says. It will tell you exactly what's wrong.

---

## 🔍 Common Issues

### Issue: `.env.production` file not appearing in Windows

**Solution:** Use Notepad to create it:
1. Open Notepad
2. Copy the environment variables above
3. Save As → `.env.production` → Save as type: "All Files"
4. Save in `D:\Data\work\Ersa\frontend\`

### Issue: "Backend not reachable"

**Causes:**
- Backend server is down
- IIS not started
- Database connection failed
- Firewall blocking connections

**Fix:** Start backend service first!

### Issue: Still getting 500 after deploy

**Causes:**
- Files didn't upload properly
- Node.js didn't restart
- Old cached version

**Fix:**
1. Check file timestamps on server
2. Force restart Node.js
3. Clear browser cache (Ctrl+Shift+Delete)

---

## 📞 Need More Help?

**Check these in order:**

1. **Is backend running?**
   ```
   https://api.ersa-training.com/api/courses
   ```
   Should return JSON

2. **Did you deploy the fixed code?**
   - Check file `app/api/proxy/route.ts` on server
   - Should say `api.ersa-training.com` NOT `lapi.ersa-training.com`

3. **Is Node.js restarted?**
   - Restart it again
   - Wait 1-2 minutes
   - Try again

4. **Check server logs**
   - Find Next.js error logs
   - Look for error messages
   - They will tell you exactly what's wrong

---

## 🎯 Quick Summary

```
1. Test backend: https://api.ersa-training.com/api/courses
   ✅ Works? → Continue
   ❌ Fails? → Fix backend first

2. Create .env.production file

3. Run: fix-production-url.bat

4. Upload production-url-fix.zip

5. Restart Node.js

6. Test: https://ersa-training.com/api/test-backend

7. Try login!
```

---

## ⏱️ Time Estimate

- Testing backend: 1 minute
- Creating env file: 1 minute  
- Running build script: 3 minutes
- Uploading files: 2 minutes
- Testing: 1 minute

**Total: ~8 minutes**

---

**The fix is simple: Deploy the corrected code and restart Node.js!** 🚀

---

## 🧪 Diagnostic Test Route

After deploying, you can also test with:
```
https://ersa-training.com/api/test-backend
```

This will show you:
- What URL the proxy is trying to reach
- If it can connect to the backend
- What errors (if any) are occurring
- Environment variables status

This makes debugging much easier!

