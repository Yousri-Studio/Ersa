# 🔍 Request Flow Analysis - Admin Login

## Current Flow

### 1. Frontend Makes Request
**File**: `frontend/app/[locale]/admin-login/page.tsx` (line 59)
```typescript
const response = await api.post('/auth/login', {
  email: loginEmail,
  password: loginPassword,
});
```

### 2. Axios Constructs URL
**File**: `frontend/lib/api.ts` (line 5-9)
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5002/api';

export const api = axios.create({
  baseURL: API_BASE_URL,  // = '/api/proxy?endpoint='
  headers: { 'Content-Type': 'application/json' },
});
```

**Result**: `/api/proxy?endpoint=` + `/auth/login` = `/api/proxy?endpoint=/auth/login`

### 3. Proxy Receives Request
**File**: `frontend/app/api/proxy/route.ts` (line 78-96)
```typescript
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';  // = '/auth/login'
  
  const body = await request.json();
  let cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;  // = 'auth/login'
  
  if (cleanEndpoint.startsWith('api/')) {
    cleanEndpoint = cleanEndpoint.slice(4);
  }
  
  const backendUrl = getBackendUrl();  // = 'http://api.ersa-training.com/api'
  const apiUrl = `${backendUrl}/${cleanEndpoint}`;  // = 'http://api.ersa-training.com/api/auth/login'
```

### 4. Backend Receives Request
**Expected**: `http://api.ersa-training.com/api/auth/login`
**Controller**: `backend/src/Controllers/AuthController.cs`
```csharp
[ApiController]
[Route("api/[controller]")]  // = "api/Auth"
public class AuthController : ControllerBase
{
    [HttpPost("login")]  // Full route: "api/Auth/login"
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
```

---

## ✅ Current Flow is CORRECT!

The URL construction is working properly:
- Frontend → `/api/proxy?endpoint=/auth/login`
- Proxy → `http://api.ersa-training.com/api/auth/login`
- Backend → Handles at `api/Auth/login` (case insensitive)

---

## ❌ So Why 500 Error?

The request flow is correct. The 500 error must be coming from:

1. **Backend can't process the request** (most likely)
2. **Proxy can't reach backend**
3. **Request data is malformed**

---

## 🔍 Check These

### Issue 1: authApi vs direct api.post
In `lib/api.ts` line 243, there's an `authApi.login` function:
```typescript
export const authApi = {
  login: (data: LoginRequest): Promise<AxiosResponse<LoginResponse>> =>
    api.post('/api/auth/login', data),  // ← Has '/api' prefix!
```

But the admin login page (line 59) uses:
```typescript
const response = await api.post('/auth/login', { ... });  // ← No '/api' prefix
```

**THIS IS CORRECT** because the baseURL already is `/api/proxy?endpoint=`

### Issue 2: Double /api Problem?
If `NEXT_PUBLIC_API_BASE_URL` has the wrong value, we might get:
- Wrong: `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=/api`
- Correct: `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=`

Let's check the production env value!

### Issue 3: Backend Not Accessible
The proxy might not be able to reach `http://api.ersa-training.com/api/auth/login`

---

## 🎯 Next Steps

### Step 1: Check Environment Variable
What is the actual value of `NEXT_PUBLIC_API_BASE_URL` in production?

In browser console on `https://ersa-training.com`:
```javascript
console.log(process.env.NEXT_PUBLIC_API_BASE_URL);
```

Or check the deployed `.env.production` file.

### Step 2: Check Proxy Logs
The proxy should log:
```
[API Proxy POST] /auth/login
[API Proxy] Forwarding to: http://api.ersa-training.com/api/auth/login
```

Check Next.js server logs to see what URL it's actually forwarding to.

### Step 3: Test Backend Directly
```powershell
curl "http://api.ersa-training.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'
```

If this works, backend is fine.  
If this fails with 500, backend has an issue.

### Step 4: Check Proxy Response
The proxy catches errors and returns them (line 126-132):
```typescript
catch (error) {
  console.error('[API Proxy] Error:', error);
  return NextResponse.json(
    { error: 'API request failed', details: error instanceof Error ? error.message : 'Unknown error' },
    { status: 500 }
  );
}
```

Check the browser Network tab for the proxy response body - it should contain the actual error message.

---

## 🚨 Most Likely Issues

### 1. Backend Database Connection Failed (70%)
Backend can't connect to SQL Server → throws exception → returns 500

### 2. CORS Issue (15%)
Frontend domain not in backend CORS allowed origins

### 3. Backend Not Running (10%)
IIS/backend service is down or not responding

### 4. Network Issue (5%)
Frontend server can't reach backend server over HTTP

---

## 🔧 Quick Fix: Add Detailed Logging

Add this to the proxy to see exactly what's happening:

```typescript
console.log('[API Proxy POST] Full request details:', {
  endpoint,
  backendUrl: getBackendUrl(),
  finalUrl: apiUrl,
  body: body,
  headers: Object.fromEntries(request.headers.entries())
});
```

This will show in the Next.js server logs exactly what's being sent to the backend.

