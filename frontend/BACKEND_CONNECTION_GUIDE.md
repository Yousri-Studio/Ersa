# Backend Connection Guide

This guide explains how the frontend connects to the backend and how to switch between proxy and direct connection approaches.

## 🔄 Current Setup

Your frontend is configured to use **TWO different connection methods**:
- **Development (local)**: Uses Proxy → `/api/proxy?endpoint=`
- **Production**: Uses Proxy → `/api/proxy?endpoint=`

## 📋 Connection Methods

### Method 1: Proxy Route (✅ Currently Active)

**How it works:**
1. Frontend makes API call: `/api/proxy?endpoint=/courses`
2. Next.js proxy route (`app/api/proxy/route.ts`) receives the request
3. Proxy forwards to backend: `http://api.ersa-training.com/api/courses`
4. Response is sent back to frontend

**Advantages:**
- ✅ No CORS issues
- ✅ Backend URL hidden from client
- ✅ Can add authentication, logging, rate limiting at proxy level
- ✅ Works better with server-side rendering

**Configuration:**
```bash
# .env.local or .env.production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://localhost:5002/api  # or production URL
```

### Method 2: Direct Connection

**How it works:**
1. Frontend makes API call directly to backend: `http://api.ersa-training.com/api/courses`
2. Backend responds directly to frontend

**Advantages:**
- ✅ Simpler setup
- ✅ Faster (no proxy overhead)
- ✅ Easier to debug

**Disadvantages:**
- ❌ CORS must be properly configured on backend
- ❌ Backend URL exposed to client
- ❌ No intermediary for logging/security

**Configuration:**
```bash
# .env.local or .env.production
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api  # Direct URL
```

## 🔧 How to Switch Between Methods

### Switch to Proxy (Recommended)

**For Development (.env.local):**
```bash
# Use Proxy
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://localhost:5002/api
```

**For Production (.env.production):**
```bash
# Use Proxy
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
# Or with HTTPS:
# BACKEND_API_URL=https://api.ersa-training.com/api
```

### Switch to Direct Connection

**For Development (.env.local):**
```bash
# Direct Connection
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api
```

**For Production (.env.production):**
```bash
# Direct Connection
NEXT_PUBLIC_API_BASE_URL=http://api.ersa-training.com/api
# Or with HTTPS:
# NEXT_PUBLIC_API_BASE_URL=https://api.ersa-training.com/api
```

## 📝 Environment Files

| File | Purpose | When Used |
|------|---------|-----------|
| `.env.local` | Local development | `npm run dev` |
| `.env.production` | Production build | `npm run build` |
| `.env.example` | Template for reference | Not used in app |

## 🚀 After Changing Configuration

**Important:** After changing environment variables, you MUST restart the development server or rebuild:

```bash
# For Development
# Stop the server (Ctrl+C) then:
npm run dev

# For Production
npm run build
npm start
```

## 🧪 Testing Your Connection

### Test Proxy Route
```bash
# Start dev server
npm run dev

# In browser or Postman, test:
http://localhost:3000/api/proxy?endpoint=courses

# Should forward to backend and return courses data
```

### Test Direct Connection
```bash
# Change .env.local to direct connection
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api

# Restart server
npm run dev

# App will connect directly to backend
```

## 📊 Current Configuration Status

### ✅ Your Current Setup (Proxy-based)

**Development (.env.local):**
```
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://localhost:5002/api
```

**Production (.env.production):**
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

## 🔍 How API Calls Work with Proxy

When you make an API call in your code:
```typescript
// In your component
api.get('/courses')
```

With proxy configuration, it becomes:
```
1. Frontend calls: /api/proxy?endpoint=/courses
2. Proxy (app/api/proxy/route.ts) receives request
3. Proxy forwards to: http://api.ersa-training.com/api/courses
4. Backend responds to proxy
5. Proxy forwards response to frontend
```

## 🛠️ Troubleshooting

### Issue: API calls not working after env change
**Solution:** Restart the development server completely
```bash
# Stop server (Ctrl+C)
npm run dev
```

### Issue: Production build not using correct URL
**Solution:** Rebuild the application
```bash
npm run build
```

### Issue: CORS errors with direct connection
**Solution:** Either:
1. Use proxy method (recommended)
2. Configure CORS properly on backend

### Issue: 404 on proxy route
**Solution:** Verify proxy route exists at `app/api/proxy/route.ts`

## 📚 Related Files

- **API Configuration**: `lib/api.ts`
- **Backend Connection Manager**: `lib/backend-connection.ts`
- **Proxy Route**: `app/api/proxy/route.ts`
- **Next.js Config**: `next.config.js`

## 💡 Recommendation

**For Production**: Use the proxy approach (current setup) ✅
- Better security
- No CORS issues
- Backend URL hidden
- Can add middleware functionality

**For Development**: You can use either:
- Proxy: More similar to production
- Direct: Faster debugging if backend CORS is configured

---

Last Updated:5 Oct, 2025


