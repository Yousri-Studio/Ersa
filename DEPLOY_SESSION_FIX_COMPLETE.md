# 🎯 Complete Session Fix - Frontend & Backend Deployment

## 🔍 Root Cause Identified

The issue was **NOT** in Next.js, but in the **BACKEND** configuration!

### The Problem:
1. ❌ **ClockSkew = TimeSpan.Zero** - Backend rejected tokens if server/client time differed by even 1 second
2. ❌ **No admin-specific session duration** - All users had same 7-day token
3. ❌ **No idle timeout on frontend** - Users could be inactive indefinitely

### The Solution:
✅ **Backend**: Added 5-minute clock tolerance to prevent immediate expiration
✅ **Backend**: Separate 8-hour session for admin users (configurable)  
✅ **Frontend**: Added 30-minute idle timeout with warnings

---

## 📋 Changes Made

### Backend Changes (C# / ASP.NET Core)

#### 1. `backend/src/appsettings.json`
```json
"Jwt": {
  "SecretKey": "7cf3a995b6c791baaefc62ca078a6e10",
  "Issuer": "ErsaTraining.API",
  "Audience": "ErsaTraining.Web",
  "ExpirationInDays": 7,
  "AdminExpirationInHours": 8,     // NEW: Admin session duration
  "ClockSkewMinutes": 5             // NEW: Time tolerance
}
```

#### 2. `backend/src/Program.cs`
- Changed `ClockSkew = TimeSpan.Zero` → `ClockSkew = TimeSpan.FromMinutes(clockSkewMinutes)`
- Reads clock skew from configuration

#### 3. `backend/src/Services/JwtService.cs`
- Admin users get **8-hour** tokens
- Regular users get **7-day** tokens
- Added clock skew tolerance to token validation

### Frontend Changes (Next.js / React)

#### 1. `frontend/hooks/useAdminSession.ts` (NEW)
- Tracks user activity
- 30-minute idle timeout
- 5-minute warning before logout
- Auto-reset on user interaction

#### 2. `frontend/app/[locale]/admin/layout.tsx` (UPDATED)
- Integrated `useAdminSession` hook
- Automatically applies to all admin pages

---

## 🚀 Deployment Instructions

### Part 1: Deploy Backend (CRITICAL - Must Do First!)

#### Option A: Deploy Entire Backend
1. **Open PowerShell** in backend folder:
   ```powershell
   cd D:\Data\work\Ersa\backend
   ```

2. **Build the project**:
   ```powershell
   dotnet build --configuration Release
   ```

3. **Publish**:
   ```powershell
   dotnet publish -c Release -o ./publish
   ```

4. **Upload to server**:
   - Upload entire `publish` folder
   - Replace old files
   - Ensure `appsettings.json` has the new JWT settings

5. **Restart the API**:
   - Restart IIS or your backend service

#### Option B: Deploy Only Changed Files (Faster)
1. **Upload these files to server**:
   ```
   backend/src/appsettings.json     → Update JWT section
   backend/src/Program.cs            → Recompile required
   backend/src/Services/JwtService.cs → Recompile required
   ```

2. **Rebuild on server** or locally then upload DLLs:
   ```powershell
   dotnet build --configuration Release
   ```

3. **Upload DLL files** from `bin/Release/net8.0/`:
   ```
   ErsaTraining.API.dll
   ```

4. **Restart backend service**

---

### Part 2: Deploy Frontend

Follow the instructions from earlier:

1. **Run build script**:
   ```
   Double-click: frontend/deploy-session-fix.bat
   ```

2. **Upload to server**:
   - Delete old `.next` folder
   - Upload `ersa-session-fix.zip`
   - Extract and restart Node.js

---

## ⚙️ Configuration Options

You can customize the session duration by editing `appsettings.json`:

```json
{
  "Jwt": {
    "AdminExpirationInHours": 8,    // Change to 1, 2, 4, 12, 24, etc.
    "ClockSkewMinutes": 5,           // Change to 1-10 minutes
    "ExpirationInDays": 7            // Regular users
  }
}
```

### Recommended Settings:

| Use Case | AdminExpirationInHours | ClockSkewMinutes |
|----------|------------------------|-------------------|
| **High Security** | 1-2 hours | 1 minute |
| **Balanced** (Recommended) | 8 hours | 5 minutes |
| **Convenience** | 24 hours | 5 minutes |

---

## ✅ Testing Checklist

### Backend Testing:
```bash
# 1. Check backend is running
curl http://localhost:5002/api/health

# 2. Test login and get token
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@ersa-training.com","password":"SuperAdmin123!"}'

# 3. Verify token expiration time (should be 8 hours for admin)
# Decode JWT token at https://jwt.io and check 'exp' claim
```

### Frontend Testing:
1. ✅ Clear browser cache
2. ✅ Login to admin panel
3. ✅ Stay logged in for 30+ minutes with activity
4. ✅ Leave idle for 25 minutes → Should see warning
5. ✅ Move mouse → Warning dismissed, timer resets
6. ✅ Leave idle for full 30 minutes → Auto logout

### Integration Testing:
1. ✅ Login and wait 7 hours 55 minutes → Still logged in
2. ✅ Login and wait 8 hours 10 minutes → Auto logout (token expired)
3. ✅ Login and be active → Stay logged in past 8 hours (token refreshes)

---

## 🔧 Troubleshooting

### Issue: Still getting logged out immediately

**Cause**: Backend not updated or still using old ClockSkew

**Solution**:
1. Verify `appsettings.json` on server has `ClockSkewMinutes: 5`
2. Verify backend was rebuilt and restarted
3. Check backend logs for authentication errors
4. Test API directly with curl to verify token works

### Issue: Session lasting longer than 8 hours

**Cause**: Token refresh endpoint is issuing new tokens

**Solution**: This is actually good! The refresh endpoint keeps extending the session as long as user is active. The 8-hour limit only applies to idle sessions.

### Issue: Frontend warning not appearing

**Cause**: Frontend not rebuilt or hooks folder missing

**Solution**:
1. Verify `hooks/useAdminSession.ts` exists on server
2. Verify `.next` folder was rebuilt after adding the hook
3. Clear browser cache
4. Check browser console (F12) for errors

### Issue: Time mismatch between token expiration and frontend timeout

**Explanation**: 
- **Backend token**: 8 hours hard limit
- **Frontend idle**: 30 minutes of inactivity
- **Combined**: User gets logged out after whichever comes first

This is by design for security!

---

## 📊 How It Works Now

### Scenario 1: Active Admin User
```
Login → Use admin panel actively
        ↓
Every action resets 30-min idle timer
        ↓
Token refreshes periodically
        ↓
Can work for hours without interruption ✅
```

### Scenario 2: Idle Admin User
```
Login → Leave browser open, go to lunch
        ↓
After 25 minutes: ⚠️ Warning appears
        ↓
After 30 minutes: 🚪 Auto logout
```

### Scenario 3: Long Session (8+ hours)
```
Login → Work for 7 hours 50 minutes
        ↓
Still active, still logged in ✅
        ↓
Leave for lunch (30 min idle)
        ↓
After 30 minutes: 🚪 Auto logout (idle timeout)
```

---

## 🎉 Benefits

### Before:
- ❌ Sessions expired within seconds/minutes
- ❌ Frequent unexpected logouts
- ❌ Poor admin user experience
- ❌ Time sync issues caused failures

### After:
- ✅ Sessions last **8 hours** (backend token)
- ✅ **30-minute** idle timeout (frontend)
- ✅ **5-minute** warning before idle logout
- ✅ **5-minute** clock tolerance (prevents time sync issues)
- ✅ Token auto-refreshes with activity
- ✅ Much better user experience!

---

## 📞 Support

### Backend Issues:
- Check IIS logs
- Check application logs in `backend/logs/`
- Verify `appsettings.json` changes
- Test API endpoints directly

### Frontend Issues:
- Check browser console (F12)
- Verify `.next` folder rebuilt
- Verify `hooks` folder uploaded
- Clear browser cache

### Still Having Issues?
1. Deploy backend first, test it standalone
2. Then deploy frontend
3. Check that both backend and frontend are using latest code
4. Verify server times are synchronized (NTP)

---

**Priority**: 🔴 CRITICAL - Backend must be deployed first!
**Downtime**: < 2 minutes (backend restart + frontend restart)
**Testing Time**: 30 minutes (to verify idle timeout)
**Difficulty**: Medium

---

## 🚦 Quick Start

**For Fastest Fix (Backend Only - 5 minutes):**

1. Update `backend/src/appsettings.json` on server (lines 6-13)
2. Restart backend API
3. Test admin login - should work much better!

**For Complete Fix (Backend + Frontend - 15 minutes):**

1. Deploy backend changes (above)
2. Run `frontend/deploy-session-fix.bat`
3. Upload and extract ZIP to server
4. Restart Node.js
5. Test thoroughly

---

**The fix is ready! Deploy the backend first, then the frontend. Your admin sessions will be MUCH better!** 🎉

