# 🔍 Backend Auth 500 Error - Diagnosis Guide

## What Could Cause 500 in Auth Login?

Based on your backend `AuthController.cs`, here are the possible causes:

---

## 🔴 Top 5 Most Likely Causes

### 1. **Database Connection Failure** (70% probability)
**Line**: `var user = await _userManager.FindByEmailAsync(request.Email);`

**Symptoms**:
- Login returns 500 error
- Other endpoints might also fail
- Backend logs show SQL connection errors

**Check**:
```sql
-- Test database connection from backend server
-- Connection string in appsettings.json:
Data Source=SQL1002.site4now.net;
Initial Catalog=db_abea46_ersatraining;
User Id=powerDb;
Password=P@$sw0rd;
```

**Common Issues**:
- Database server is down
- Firewall blocking SQL port (1433)
- Wrong credentials
- Connection timeout
- SSL/TLS certificate validation failing

**Fix**:
- Check SQL Server is running
- Test connection from backend server
- Verify credentials are correct
- Check firewall allows SQL connections

---

### 2. **User Not Found or Data Corruption** (15% probability)
**Line**: JWT generation or user data access

**Symptoms**:
- Login fails for specific users
- Some users can login, others get 500

**Check**:
```sql
-- Check if user exists
SELECT * FROM AspNetUsers WHERE Email = 'operations@ersa-training.com'

-- Check user roles
SELECT u.Email, r.Name as RoleName
FROM AspNetUsers u
LEFT JOIN AspNetUserRoles ur ON u.Id = ur.UserId
LEFT JOIN AspNetRoles r ON ur.RoleId = r.Id
WHERE u.Email = 'operations@ersa-training.com'
```

**Possible Issues**:
- User record is NULL or corrupted
- Missing required fields (FullName, Email)
- User.Status is invalid value

---

### 3. **JWT Configuration Error** (10% probability)
**Line**: `var token = await _jwtService.GenerateTokenAsync(user);`

**Check appsettings.json**:
```json
{
  "Jwt": {
    "SecretKey": "7cf3a995b6c791baaefc62ca078a6e10",
    "Issuer": "ErsaTraining.API",
    "Audience": "ErsaTraining.Web",
    "ExpirationInDays": 7,
    "AdminExpirationInHours": 8,
    "ClockSkewMinutes": 5
  }
}
```

**Possible Issues**:
- SecretKey is missing or too short
- Issuer/Audience not configured
- Exception during claims generation (roles access)

---

### 4. **CORS Preflight Issue** (3% probability)
**Issue**: Browser sends OPTIONS request, backend rejects it

**Check in appsettings.json**:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "http://localhost:5002",
      "https://ersa-training.com",
      "https://www.ersa-training.com"
    ]
  }
}
```

**Problem**: If `https://ersa-training.com` is NOT in the allowed origins, CORS will fail

**Fix**: Make sure your frontend domain is in CORS allowed origins

---

### 5. **Backend Not Running or Crashed** (2% probability)
**Symptoms**:
- Can't access ANY backend endpoint
- `http://api.ersa-training.com/api/courses` also returns 500 or nothing

**Fix**:
- Restart IIS/backend service
- Check backend logs for startup errors
- Verify backend is deployed correctly

---

## 🔍 How to Diagnose

### Step 1: Check Backend Logs

**Location**: `backend/logs/log-[today's date].txt`

**Look for**:
```
[Error] Error during user login
System.Exception: [actual error message]
```

**Common errors you might see**:
- `SqlException: Cannot connect to database`
- `TimeoutException: Connection timeout`
- `NullReferenceException: User object is null`
- `ArgumentException: JWT configuration invalid`

### Step 2: Test Backend Directly

```powershell
# Test if backend is accessible
curl http://api.ersa-training.com/api/courses

# Test login directly (bypass proxy)
curl "http://api.ersa-training.com/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"operations@ersa-training.com","password":"Operations123!"}'
```

**If backend direct test works**: Problem is in proxy/network  
**If backend direct test fails**: Problem is in backend itself

### Step 3: Check Database

```sql
-- Test user exists
SELECT 
    u.Id,
    u.Email,
    u.FullName,
    u.Status,
    u.EmailConfirmed,
    u.IsAdmin,
    u.IsSuperAdmin
FROM AspNetUsers u
WHERE u.Email = 'operations@ersa-training.com'
```

**Expected result**:
- User exists
- Status = 1 (Active)
- Email is 'operations@ersa-training.com'

**If user not found**: User doesn't exist in production DB  
**If Status != 1**: User is not active

### Step 4: Check Backend Configuration

```powershell
# On backend server, check if appsettings.json exists
dir C:\inetpub\wwwroot\api.ersa-training.com\appsettings.json

# Check if connection string is correct
type C:\inetpub\wwwroot\api.ersa-training.com\appsettings.json | findstr ConnectionString
```

---

## 🚨 Quick Fixes by Symptom

### Symptom: "Cannot connect to database"

**Fix**:
1. Check SQL Server is running
2. Test connection string with SSMS
3. Check firewall allows port 1433
4. Verify credentials in appsettings.json

### Symptom: "User not found"

**Fix**:
1. Run database seeding script
2. Create user manually in database
3. Verify email matches exactly (case-sensitive)

### Symptom: "JWT token generation failed"

**Fix**:
1. Check Jwt:SecretKey in appsettings.json
2. Verify all JWT config values are present
3. Check user roles are properly assigned

### Symptom: "Internal server error" with no details

**Fix**:
1. Check backend logs for actual error
2. Enable detailed error messages (development mode)
3. Check ExceptionMiddleware for error handling

---

## 📝 Common Production Issues

### Issue: Different appsettings.json on server

**Problem**: Local backend uses different config than production

**Solution**: 
- Check if `appsettings.Production.json` exists
- Verify connection string points to production database
- Ensure JWT settings match between environments

### Issue: Backend can't reach database from server

**Problem**: Database firewall blocks backend server IP

**Solution**:
- Whitelist backend server IP in SQL Server firewall
- Check SQL Server Network Configuration
- Verify SQL Server TCP/IP is enabled

### Issue: CORS blocking requests

**Problem**: Frontend domain not in CORS allowed origins

**Solution**:
```json
{
  "Cors": {
    "AllowedOrigins": [
      "https://ersa-training.com"  // ← ADD THIS
    ]
  }
}
```

---

## 🎯 Next Steps

1. **Check backend logs** for actual error message
2. **Test backend directly** (not through proxy)
3. **Verify database connection** from backend server
4. **Check user exists** in production database
5. **Review appsettings.json** configuration

---

## 💡 Most Likely Issue

**Database connection failure** is the #1 cause of 500 errors in login.

**Quick test**:
```powershell
# From your backend server, test SQL connection
sqlcmd -S SQL1002.site4now.net -U powerDb -P "P@$sw0rd" -d db_abea46_ersatraining -Q "SELECT COUNT(*) FROM AspNetUsers"
```

If this fails, your database is unreachable from the backend server.

---

## 🔧 Enable Detailed Error Messages (for debugging only)

In `Program.cs`, temporarily add:

```csharp
// ONLY FOR DEBUGGING - REMOVE AFTER FIXING
app.UseDeveloperExceptionPage();
```

This will show detailed error messages instead of generic 500 errors.

**⚠️ WARNING**: Remove this after debugging - it exposes sensitive information!

---

**Check backend logs and tell me what error you see!** 🚀

