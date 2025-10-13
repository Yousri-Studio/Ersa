# 🚨 URGENT: Admin 500 Error Debugging Guide

## Current Status

✅ Code has been updated and deployed (endpoints no longer have double `/api/` prefix)  
❌ Still getting 500 errors on admin requests after login

## Quick Diagnostic

### Run This PowerShell Script

Save and run `test-admin-api.ps1` to test the entire chain:

```powershell
.\test-admin-api.ps1
```

This will test:
1. ✅ Direct backend login
2. ✅ Direct backend dashboard stats (with token)
3. ✅ Through frontend proxy (with token)

The test results will tell us exactly where the failure is.

## Most Likely Issues (Ranked)

### Issue #1: Token Not Being Saved in Cookies After Login (80% probability)

**Symptom**: Login succeeds but token isn't saved, so subsequent requests fail

**Check**:
1. Open browser DevTools (F12)
2. Go to Application tab → Cookies → https://ersa-training.com
3. Look for `auth-token` cookie
4. **If missing**: This is the problem

**Fix**: The auth store login function should be saving the cookie. Check if the code in production matches the updated code.

### Issue #2: Authorization Header Case Sensitivity (15% probability)

**Symptom**: Backend expects `Authorization` but receives `authorization`

**Check**: Look at the proxy logs or add logging:

```typescript
// In frontend/app/api/proxy/route.ts
console.log('[API Proxy] Request headers:', Object.fromEntries(request.headers.entries()));
```

**Fix**: Ensure the header name is exactly `Authorization` (capital A).

### Issue #3: CORS or Preflight Request Issue (5% probability)

**Symptom**: Browser sends OPTIONS request that fails

**Check**: Network tab → Look for OPTIONS requests before POST/GET requests

**Fix**: Ensure backend CORS is configured to allow the frontend domain.

## Immediate Actions

### Action 1: Check Browser Console RIGHT NOW

1. Open https://ersa-training.com/en/admin-login
2. Open DevTools (F12) → Console tab
3. Login
4. Look for console logs starting with `[API Proxy]`
5. Check if there are any error messages

### Action 2: Check Network Tab

1. Open DevTools (F12) → Network tab
2. Clear all (trash icon)
3. Login
4. Find the request to `/api/proxy?endpoint=/admin/dashboard-stats`
5. Click on it
6. Go to "Headers" tab
7. **Check Request Headers** - is there `Authorization: Bearer ...`?
8. **Check Response** - what's the exact error message?

### Action 3: Check Cookies

1. Open DevTools (F12) → Application tab
2. Expand "Cookies" in left sidebar
3. Click on "https://ersa-training.com"
4. Look for `auth-token`
5. **If it exists**: Copy its value
6. **If it doesn't exist**: **THIS IS THE PROBLEM**

## Manual Test (Bypass Frontend)

You can test the API directly using the browser console:

```javascript
// 1. Login first
fetch('https://ersa-training.com/api/proxy?endpoint=/auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'superadmin@ersatraining.com',
    password: 'SuperAdmin123!'
  })
})
.then(r => r.json())
.then(data => {
  console.log('Login response:', data);
  window.testToken = data.token; // Save token for next test
});

// 2. Then test dashboard stats (run this after login succeeds)
fetch('https://ersa-training.com/api/proxy?endpoint=/admin/dashboard-stats', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${window.testToken}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Dashboard stats:', data))
.catch(err => console.error('Error:', err));
```

## Expected Results vs Actual Results

### If Login is Successful:
- ✅ Token should be returned in response
- ✅ Token should be saved to cookie `auth-token`
- ✅ User should be redirected to `/en/admin`

### If Dashboard Request Fails with 500:
- ❌ Either token is missing from cookie
- ❌ Or Authorization header is not being sent
- ❌ Or backend is rejecting the token

## Critical Files to Check

### 1. `frontend/lib/auth-store.ts` - Login Function

The login function should save the token to cookies:

```typescript
login: (token: string, user: User) => {
  Cookies.set('auth-token', token, { 
    expires: 7, 
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/'
  });
  set({ user, token, isAuthenticated: true });
}
```

### 2. `frontend/lib/api.ts` - Axios Interceptor

Should add Authorization header:

```typescript
api.interceptors.request.use((config) => {
  const token = Cookies.get('auth-token');
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});
```

### 3. `frontend/app/api/proxy/route.ts` - Proxy Route

Should forward Authorization header:

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader) {
  headers['Authorization'] = authHeader;
}
```

## Quick Fix If Token Cookie Is Missing

The issue is likely that the token isn't being saved after login. This could be because:

1. **Frontend code wasn't rebuilt after changes**
   - Run: `cd frontend && npm run build`

2. **Browser is caching old JavaScript code**
   - Hard refresh: Ctrl + Shift + R (Windows) or Cmd + Shift + R (Mac)
   - Or clear browser cache completely

3. **Cookie security settings**
   - Check if `secure: true` is set in production but site is on HTTP
   - Should be: `secure: process.env.NODE_ENV === 'production'`

## Next Steps

Please run the following and report back:

1. **Run PowerShell test script**: `.\test-admin-api.ps1`
2. **Check browser cookies**: Does `auth-token` exist after login?
3. **Check network tab**: Is `Authorization` header present in failed requests?
4. **Share screenshot**: Of the failed request's Headers tab

With this information, I can provide the exact fix.

## Emergency Workaround (Temporary)

If you need admin access urgently while debugging, you can temporarily disable authorization:

Edit `backend/src/Controllers/AdminController.cs`:

```csharp
[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // TEMPORARY - REMOVE AFTER FIXING!
//[Authorize(Policy = PolicyNames.AdminAccess)] // Comment this out temporarily
public class AdminController : ControllerBase
```

**WARNING**: This removes all authentication! Only use for testing, and revert immediately after finding the issue.

