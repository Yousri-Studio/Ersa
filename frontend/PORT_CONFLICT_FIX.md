# 🚨 URGENT FIX: Port Conflict on Server

## The Problem

Your server has **TWO processes running**:
1. ✅ `progressive-nextjs.js` - Currently running on port 8080
2. ❌ `start.js` - Trying to start but BLOCKED (port 8080 is taken)

**Error:**
```
Error: listen EADDRINUSE: address already in use :::8080
```

Your `web.config` is configured to use `start.js`, but it can't start because another process is using port 8080.

---

## 🎯 SOLUTION: Stop All Node Processes and Restart

### Step 1: Stop Node.js Application
1. Login to **SmarterASP.NET Control Panel**
2. Go to **Node.js Manager** (or Website Management)
3. Find your site: `ersa-training.com`
4. Click **STOP** button
5. Wait 30 seconds for all processes to stop

### Step 2: Clean Up Old Files (Optional but Recommended)
In File Manager, navigate to: `h:\root\home\ersatc-001\www\ersatraining\`

Check if you have multiple server files:
- `start.js` ✅ (This is the correct one)
- `progressive-nextjs.js` ⚠️ (Delete this if present)
- `simple-server-api-integrated.js` ⚠️ (Delete this if present)
- `ersa-training-complete.js` ⚠️ (Delete this if present)

**Action**: Delete any extra server files. Keep ONLY `start.js`

### Step 3: Verify web.config Points to start.js
Your web.config should have:
```xml
<add name="iisnode" path="start.js" verb="*" modules="iisnode"/>
```

And in the rewrite rules:
```xml
<action type="Rewrite" url="start.js" />
```

### Step 4: Restart Node.js
1. In SmarterASP.NET Control Panel
2. Go to **Node.js Manager**
3. Click **START** (or **RESTART** if available)
4. Wait 60 seconds for application to fully start

### Step 5: Test
Visit: http://ersa-training.com

Should now load correctly!

---

## 🔍 What Happened?

You uploaded multiple server files during testing/deployment, and `progressive-nextjs.js` started first, taking port 8080. When IIS tries to start `start.js` (the correct one configured in web.config), it fails because the port is already in use.

---

## ✅ ALTERNATIVE: Use Progressive Next.js Server

If stopping and restarting doesn't work, you can switch to using `progressive-nextjs.js` instead:

### Option A: Change web.config to Use progressive-nextjs.js

Replace `start.js` with `progressive-nextjs.js` in web.config:

```xml
<handlers>
  <add name="iisnode" path="progressive-nextjs.js" verb="*" modules="iisnode"/>
</handlers>
```

And in rewrite rules:
```xml
<action type="Rewrite" url="progressive-nextjs.js" />
```

Then restart Node.js.

---

## 🎯 RECOMMENDED SOLUTION

**Do this on SmarterASP.NET:**

1. **STOP Node.js** completely
2. **DELETE** these files if they exist:
   - `progressive-nextjs.js`
   - `simple-server-api-integrated.js`
   - `ersa-training-complete.js`
   - Any other `*.js` files EXCEPT `start.js`
3. **KEEP** only:
   - `start.js`
   - `web.config`
   - `package.json`
   - `.next/` folder
   - All other necessary files
4. **RESTART** Node.js
5. **TEST**: http://ersa-training.com

---

## 📋 Quick Checklist

On SmarterASP.NET server:
- [ ] Stop all Node.js processes
- [ ] Verify only `start.js` exists (delete other server files)
- [ ] Verify `web.config` points to `start.js`
- [ ] Restart Node.js
- [ ] Wait 60 seconds
- [ ] Test: http://ersa-training.com
- [ ] Check iisnode logs if still not working

---

## 🔧 If Still Not Working

Check iisnode logs on server:
- Location: `h:\root\home\ersatc-001\www\ersatraining\iisnode\`
- Look for latest log file
- Check for new error messages

The error should change from "EADDRINUSE" to something else (or no error if it works).

---

**Priority**: CRITICAL - Site cannot start due to port conflict
**Time to Fix**: 2-3 minutes
**Action**: Stop Node.js, clean up files, restart

