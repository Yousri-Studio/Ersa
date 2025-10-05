# 🔒 MIXED CONTENT FIX - API CORS & HTTPS Issues

## The Problem

Your site shows `(blocked:mixed-content)` errors because:
- ✅ Frontend: Uses HTTPS (`https://ersa-training.com`)
- ❌ Backend API: Only supports HTTP (`http://api.ersa-training.com`)
- 🚫 Browsers block HTTP requests from HTTPS pages

---

## ✅ RECOMMENDED SOLUTION: Enable HTTPS on Backend

### Step 1: Check SSL Certificate for API Domain

1. Login to SmarterASP.NET Control Panel
2. Go to **SSL** section
3. Check if `api.ersa-training.com` has an SSL certificate
4. If not, request/install one (usually free with Let's Encrypt)

### Step 2: Configure Backend for HTTPS

In your backend `.NET API` configuration:

1. Open `appsettings.json` (or `appsettings.Production.json`)
2. Add HTTPS configuration:

```json
{
  "Kestrel": {
    "Endpoints": {
      "Http": {
        "Url": "http://localhost:5002"
      },
      "Https": {
        "Url": "https://localhost:5003"
      }
    }
  },
  "AllowedHosts": "*",
  "Cors": {
    "AllowedOrigins": [
      "https://ersa-training.com",
      "http://ersa-training.com"
    ]
  }
}
```

3. Make sure your backend accepts HTTPS connections

### Step 3: Update Frontend Environment

In `.env.production` on frontend server:
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=https://api.ersa-training.com/api
```

### Step 4: Test

Visit: `https://api.ersa-training.com/api/courses`
Should work without SSL errors.

---

## 🔄 ALTERNATIVE: API Proxy (No Backend Changes Needed)

If you can't enable HTTPS on backend immediately, proxy API calls through your frontend:

### Solution: Use Next.js API Routes as Proxy

This keeps all requests within HTTPS domain.

**Create**: `frontend/app/api/proxy/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  
  try {
    const response = await fetch(`http://api.ersa-training.com/api/${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint') || '';
  const body = await request.json();
  
  try {
    const response = await fetch(`http://api.ersa-training.com/api/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'API request failed' }, { status: 500 });
  }
}
```

**Then update `.env.production`:**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
```

This way, all API calls go through your HTTPS frontend.

---

## 🚀 QUICK FIX: Disable HTTPS on Frontend (NOT RECOMMENDED)

If you need a quick temporary fix:

### In SmarterASP.NET:

1. Go to **Website Settings**
2. Find **SSL/HTTPS** settings
3. **Disable** "Force HTTPS" or "Require SSL"
4. Save changes
5. Visit: `http://ersa-training.com` (without s)

**Warning**: This is not secure for production. Users will see security warnings.

---

## 🔍 CHECK BACKEND CORS SETTINGS

Your backend also needs to allow requests from your frontend domain.

### In your .NET API, check `Program.cs` or `Startup.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
            "https://ersa-training.com",
            "http://ersa-training.com",
            "https://www.ersa-training.com",
            "http://www.ersa-training.com"
        )
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials();
    });
});

// Later in the pipeline:
app.UseCors("AllowFrontend");
```

---

## 📋 SUMMARY OF OPTIONS

| Option | Pros | Cons | Time |
|--------|------|------|------|
| Enable HTTPS on API | ✅ Secure<br>✅ Best practice<br>✅ No code changes | ⚠️ Needs SSL cert<br>⚠️ Backend config | 30-60 min |
| API Proxy in Frontend | ✅ No backend changes<br>✅ Works immediately | ⚠️ Extra latency<br>⚠️ More code | 15 min |
| Disable Frontend HTTPS | ✅ Quick fix | ❌ Not secure<br>❌ Not for production | 2 min |

---

## ✅ RECOMMENDED ACTION PLAN

**Short-term (Now):**
1. Update `.env.production` to use HTTP (accepts mixed content for now)
2. Or implement API proxy

**Long-term (This week):**
1. Get SSL certificate for `api.ersa-training.com`
2. Configure backend for HTTPS
3. Update frontend to use HTTPS API URL
4. Enable HTTPS enforcement on frontend

---

## 🔧 YOUR SPECIFIC FIX

Based on your setup, here's what to do **RIGHT NOW**:

### Update `.env.production` on server:

```bash
NODE_ENV=production
# Use HTTP for now since backend doesn't support HTTPS yet
NEXT_PUBLIC_API_BASE_URL=http://api.ersa-training.com/api
```

### Update web.config to allow mixed content (temporary):

Add this in the `<system.webServer>` section:

```xml
<httpProtocol>
  <customHeaders>
    <add name="Content-Security-Policy" value="upgrade-insecure-requests" />
  </customHeaders>
</httpProtocol>
```

This tells browsers to try upgrading HTTP to HTTPS, but allows fallback.

---

**Priority**: Medium - Site works but not secure
**Time to fix properly**: 30-60 minutes (enable HTTPS on API)
**Quick workaround**: 5 minutes (allow mixed content)

