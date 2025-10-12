# 🍪 Cookie Domain Fix - The Real Issue

## 🔍 What We Found

### The Problem:
**Cookie is being set but disappears on page refresh!**

### Evidence:
1. **Login**: `🔐 Cookie verified: YES ✅` - Cookie is set successfully
2. **After Refresh**: `⚠️ No token cookie found` - Cookie is gone!

### Root Cause:
**Cookie domain mismatch** - The cookie is being set for the wrong domain scope.

---

## 🔧 The Fix

### Issue 1: Domain Scope
Your site runs on `https://ersa-training.com` but the cookie might be set for a different scope.

**Solution**: Set cookie domain explicitly to `.ersa-training.com` (with the leading dot)

### Issue 2: Production vs Development
The cookie settings might be different between development and production.

---

## 📝 Files Changed

### `frontend/lib/auth-store.ts`
```typescript
// OLD
const cookieOptions = { 
  expires: 7, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/'
};

// NEW - Added domain
const cookieOptions = { 
  expires: 7, 
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  domain: process.env.NODE_ENV === 'production' ? '.ersa-training.com' : undefined
};
```

**Why this works:**
- `.ersa-training.com` (with dot) = Valid for all subdomains
- `ersa-training.com` (without dot) = Only for exact domain
- `undefined` in development = Uses current domain

---

## 🧪 Test the Fix

### Step 1: Deploy
```powershell
cd D:\Data\work\Ersa\frontend
npm run build
# Upload and restart Node.js
```

### Step 2: Test Login
1. Login to admin
2. Check console: Should see `🔐 Cookie verified: YES ✅`
3. Check cookies in DevTools: Should see `auth-token` cookie with domain `.ersa-training.com`

### Step 3: Test Refresh
1. Press F5
2. Check console: Should see `✅ Already authenticated from storage, skipping validation`
3. Should stay logged in!

---

## 🔍 If Still Not Working

### Alternative Cookie Settings

If the domain fix doesn't work, try these variations:

```typescript
// Option 1: No domain (use current domain)
domain: undefined

// Option 2: Exact domain
domain: 'ersa-training.com'

// Option 3: Remove secure in development
secure: false  // For testing only!

// Option 4: Different sameSite
sameSite: 'none'  // For cross-site cookies
```

---

## 📊 Cookie Debugging

### Check Cookie in DevTools:
1. F12 → Application → Cookies → https://ersa-training.com
2. Look for `auth-token` cookie
3. Check these values:
   - **Domain**: Should be `.ersa-training.com` or `ersa-training.com`
   - **Path**: Should be `/`
   - **Expires**: Should be ~7 days from now
   - **HttpOnly**: Should be `false` (we need JS access)
   - **Secure**: Should be `true` in production

### Run This in Console After Login:
```javascript
// Check all cookies
console.log('All cookies:', document.cookie);

// Check specific cookie
console.log('Auth token:', document.cookie.split(';').find(c => c.trim().startsWith('auth-token')));

// Check cookie options
const cookie = document.cookie.split(';').find(c => c.trim().startsWith('auth-token'));
if (cookie) {
  console.log('Cookie found:', cookie);
} else {
  console.log('❌ Cookie not found in document.cookie');
}
```

---

## 🎯 Expected Result

After the fix:

### Login:
```
🔐 LOGIN: Setting auth token and user
🔐 Cookie verified: YES ✅
🔐 LocalStorage check: Data saved ✅
```

### Refresh:
```
🔄 INIT FROM COOKIE: Starting...
🔄 Current state: {isAuthenticated: true, hasUser: true, hasToken: true, cookieExists: true}
✅ Already authenticated from storage, skipping validation
✅ Admin access granted
```

---

## 🚀 Deploy and Test!

The cookie domain fix should resolve the issue. Deploy and test, then let me know if you still see the cookie disappearing on refresh!

