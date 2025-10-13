# Diagnosing Admin 500 Error

## Current Status

The code has been updated to remove `/api/` prefix from endpoints, and from the network logs you provided, we can see:
- ✅ Login request: `/api/proxy?endpoint=/auth/admin-login` (no double `/api/`)
- ✅ Dashboard request: `/api/proxy?endpoint=/admin/dashboard-stats` (no double `/api/`)

This means the frontend code changes have been deployed. However, the requests are still returning 500 errors.

## Possible Root Causes

### 1. Authorization Header Not Being Forwarded

**Symptom**: Backend returns 401/500 because it doesn't receive the JWT token

**Check**: Look at backend logs for the incoming requests. The logs should show:
```
Authorization: Bearer eyJhbGc...
```

If the header is missing, the backend will reject the request.

### 2. JWT Token Invalid or Expired

**Symptom**: Token validation fails on backend

**Check**: 
- Verify the JWT secret key matches between frontend and backend
- Check if token expiration is set correctly (8 hours for admin users)
- Verify the token includes role claims (`Admin` or `SuperAdmin`)

### 3. CORS Issue

**Symptom**: Browser blocks the request before it reaches the backend

**Check**: Browser console for CORS errors

### 4. Database Connection Issue

**Symptom**: Backend can't query the database for dashboard stats

**Check**: Backend logs for database errors

## Immediate Debugging Steps

### Step 1: Check Browser Console

Open DevTools (F12) → Console tab. Look for:
- ❌ CORS errors
- ❌ Network errors
- ❌ JavaScript errors

### Step 2: Check Network Tab

Open DevTools (F12) → Network tab → Find the failed request `/api/proxy?endpoint=/admin/dashboard-stats`:

1. **Check Request Headers**:
   - Is there an `Authorization: Bearer ...` header?
   - If NO: The token isn't being added by axios interceptor

2. **Check Response**:
   - What's the actual error message?
   - Status code: 500, 401, 403?

3. **Check Cookies**:
   - Go to Application tab → Cookies
   - Is there an `auth-token` cookie?
   - If NO: Login didn't save the token

### Step 3: Check Backend Logs

Check the backend server logs (usually in `backend/src/logs/` folder or console output):

Look for:
```
[Error] Authorization failed for user: ...
[Error] Error getting dashboard stats: ...
```

### Step 4: Test Backend Directly

Use PowerShell to test the backend API directly (bypassing the proxy):

```powershell
# First, login to get a token
$loginBody = @{
    email = "superadmin@ersatraining.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "http://api.ersa-training.com/api/auth/admin-login" `
    -Method POST `
    -Body $loginBody `
    -ContentType "application/json"

$token = $loginResponse.token
Write-Host "Token: $token"

# Then, test dashboard stats with the token
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$dashboardResponse = Invoke-RestMethod -Uri "http://api.ersa-training.com/api/admin/dashboard-stats" `
    -Method GET `
    -Headers $headers

Write-Host "Dashboard Stats:"
$dashboardResponse | ConvertTo-Json
```

**Expected Result**: Dashboard stats should be returned successfully
**If it fails**: The issue is in the backend (not the proxy)
**If it succeeds**: The issue is in how the proxy forwards the Authorization header

## Most Likely Issue

Based on the symptoms, the most likely issue is that **the Authorization header is not being forwarded by the proxy**. 

### Verify Proxy is Forwarding Headers

The proxy code in `frontend/app/api/proxy/route.ts` should have:

```typescript
const authHeader = request.headers.get('authorization');
if (authHeader) {
  headers['Authorization'] = authHeader;
  console.log(`[API Proxy] Forwarding Authorization header`);
}
```

Check if this log message appears in the Next.js server logs.

## Quick Fix to Test

### Option 1: Add Temporary Logging

Edit `frontend/app/api/proxy/route.ts` to add more logging:

```typescript
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  console.log(`[API Proxy POST] ${endpoint}`);
  console.log(`[API Proxy] All request headers:`, Object.fromEntries(request.headers.entries()));
  
  // ... rest of the code
}
```

This will show if the Authorization header is being received by the proxy.

### Option 2: Temporarily Allow Anonymous Access

Edit `backend/src/Controllers/AdminController.cs` to temporarily allow anonymous access for testing:

```csharp
[HttpGet("dashboard-stats")]
[AllowAnonymous] // TEMPORARY - REMOVE AFTER TESTING
public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
```

If this makes the request succeed, the issue is definitely with authorization/authentication.

## Action Plan

1. **Check browser network tab** → Verify Authorization header is being sent
2. **Check browser cookies** → Verify auth-token exists
3. **Check backend logs** → See actual error message
4. **Test backend directly** → Isolate if it's a proxy issue
5. **Add logging to proxy** → Verify headers are being forwarded

Once you complete these steps, we'll know exactly where the issue is and can fix it accordingly.

## Expected Findings

My hypothesis is that one of these is true:

**Hypothesis A**: The `auth-token` cookie is not being set after login
- **Cause**: Login response isn't properly saving the token
- **Fix**: Check `useAuthStore` login function

**Hypothesis B**: The axios interceptor isn't adding the Authorization header
- **Cause**: Cookie name mismatch or axios config issue  
- **Fix**: Verify cookie name is 'auth-token' in both places

**Hypothesis C**: The proxy isn't forwarding the Authorization header to backend
- **Cause**: Proxy route code issue
- **Fix**: Verify proxy forwards the header correctly

**Hypothesis D**: The backend is rejecting the token
- **Cause**: JWT validation fails or role claims missing
- **Fix**: Check backend JWT configuration and user roles

Please run the diagnostic steps above and share:
1. Screenshot of Network tab showing the failed request details
2. Backend server logs (last 50-100 lines)
3. Result of the PowerShell test script

This will help us pinpoint the exact issue.

