# 🚨 URGENT: Debug Session Issue - Follow These Steps

## Step 1: Deploy the Debug Version

```powershell
cd D:\Data\work\Ersa\frontend
npm run build
```

Upload to server and restart Node.js

---

## Step 2: Test Login with Console Open

1. **Open browser in Incognito/Private mode** (fresh start)
2. **Open DevTools** (F12) → Go to **Console** tab
3. Go to: `https://ersa-training.com/en/admin-login`
4. **Login** with your credentials
5. **COPY ALL CONSOLE LOGS** and share with me

**Look for these logs after login**:
```
🔐 LOGIN: Setting auth token and user
🔐 Token length: [number]
🔐 User: [email]
🔐 Cookie set, verifying...
🔐 Cookie verified: YES ✅  or  NO ❌
🔐 LocalStorage check: Data saved ✅  or  No data ❌
```

---

## Step 3: Use the Debug Page

After login, visit:
```
https://ersa-training.com/en/debug-session
```

**Take a screenshot of this page** and share it with me.

This page shows:
- Cookie status
- LocalStorage status
- Zustand state
- All in real-time

---

## Step 4: Test Refresh

While still on the debug page:

1. **Press F5 to refresh**
2. **Watch the console** for these logs:
```
🔄 INIT FROM COOKIE: Starting...
🔄 Current state: { ... }
```

3. **Take another screenshot** after refresh
4. **Copy the console logs** after refresh

---

## Step 5: Check Manually

Open **DevTools** → **Application** tab:

### Check Cookies:
- Go to: Application → Cookies → https://ersa-training.com
- Look for: `auth-token`
- Screenshot the cookies section

### Check LocalStorage:
- Go to: Application → Local Storage → https://ersa-training.com
- Look for: `auth-storage`
- Click on it to see the value
- Screenshot the localStorage section

---

## Step 6: Run This in Console

After login, paste this in the browser console:

```javascript
// Copy-paste this entire block
console.log('=== SESSION DEBUG ===');
console.log('Cookie exists:', !!document.cookie.includes('auth-token'));
console.log('Cookie value:', document.cookie);
console.log('---');
console.log('LocalStorage auth-storage:', localStorage.getItem('auth-storage'));
console.log('---');
console.log('All localStorage keys:', Object.keys(localStorage));
console.log('---');
console.log('Zustand state:', useAuthStore.getState());
```

**Copy the output** and share with me.

---

## What I Need From You

Please share:

1. ✅ **Console logs** after login (Step 2)
2. ✅ **Screenshot** of debug-session page (Step 3)
3. ✅ **Console logs** after refresh (Step 4)
4. ✅ **Screenshot** of cookies and localStorage (Step 5)
5. ✅ **Output** of the console command (Step 6)

---

## Quick Check: Is It a Cookie Issue?

**After login**, run this in console:
```javascript
document.cookie
```

**Does it include `auth-token=`?**
- ✅ **YES** → Cookie is being set
- ❌ **NO** → Cookie is NOT being set (this is the problem!)

---

## Possible Issues We're Looking For

Based on the logs, I can tell if it's:

1. **Cookie not being set** (SameSite, domain, or path issue)
2. **LocalStorage not persisting** (Zustand persist issue)
3. **Cookie being cleared on navigation** (browser setting)
4. **State not rehydrating** (timing issue)
5. **Something else clearing the data** (middleware issue)

---

## If You Can't Follow All Steps

**At minimum, share**:
1. Console logs after login
2. Console logs after refresh
3. Answer: Does `document.cookie` show `auth-token` after login?

This will give me enough info to diagnose the issue!

---

**Deploy the debug version now and follow the steps above!** 🚀

