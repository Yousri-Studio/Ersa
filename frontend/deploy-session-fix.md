# Deploy Admin Session Fix - Production Deployment Guide

## 🎯 What Changed
- **NEW FILE**: `hooks/useAdminSession.ts` - 30-minute idle session timeout
- **UPDATED**: `app/[locale]/admin/layout.tsx` - Integrated session hook

## 📋 Deployment Checklist

### Step 1: Rebuild Next.js Application
**IMPORTANT**: You MUST rebuild after code changes!

```bash
cd D:\Data\work\Ersa\frontend
npm run build
```

⏱️ Wait for build to complete (2-3 minutes)
✅ Verify: "Compiled successfully" message appears

---

### Step 2: Prepare Files for Upload

You need to upload these files/folders:

#### ✅ Required Files (NEW/UPDATED):
- `hooks/useAdminSession.ts` - **NEW** (Session management)
- `app/[locale]/admin/layout.tsx` - **UPDATED** (Integrated session)
- `.next/` - **REBUILT** (Contains compiled code with new logic)

#### ✅ Supporting Files (May Already Exist on Server):
- `messages/` or `locales/` - Translation files
- `public/` - Static assets
- `next.config.js` - Next.js config
- `start.js` - Server startup script
- `web.config` - IIS config
- `package.json` - Dependencies

---

### Step 3: Upload to SmarterASP.NET

#### Option A: Upload Everything (Recommended for Safety)
1. **Delete** the old `.next` folder on server
2. **Upload** the entire new `.next` folder
3. **Upload** the entire `hooks` folder
4. **Upload** the entire `app` folder
5. **Restart** Node.js application

#### Option B: Upload Only Changed Files (Faster)
1. **Upload** `hooks/useAdminSession.ts` to server
   - Server path: `hooks/useAdminSession.ts`
   
2. **Upload** `app/[locale]/admin/layout.tsx` to server
   - Server path: `app/[locale]/admin/layout.tsx`
   
3. **Delete** old `.next` folder on server
   - Server path: `.next/`
   
4. **Upload** new `.next` folder
   - Local path: `D:\Data\work\Ersa\frontend\.next`
   - Server path: `.next/`

---

### Step 4: Restart Application

1. Login to SmarterASP.NET Control Panel
2. Go to **Node.js Manager**
3. Click **Restart** button
4. Wait 30-60 seconds for app to restart

---

### Step 5: Test the Fix

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. Visit: `https://yourdomain/en/admin-login`
3. Login with admin credentials
4. Go to any admin page
5. **Wait 25 minutes** - You should see a warning message
6. **Move your mouse** - Timer should reset
7. **Wait another 25 minutes** - Warning appears again

#### ✅ Success Indicators:
- ✓ No immediate logouts
- ✓ Warning appears after 25 min of inactivity
- ✓ Auto-logout after 30 min of inactivity
- ✓ Any activity resets the timer

#### ❌ If Still Logging Out Too Soon:
- Check browser console for errors (F12)
- Verify `hooks/useAdminSession.ts` exists on server
- Verify `.next` folder was rebuilt and uploaded
- Check Node.js error logs on server

---

## 🚀 Quick Command Reference

### Local Development Test (Before Deployment):
```bash
# 1. Rebuild
npm run build

# 2. Test locally
npm start

# 3. Open browser and test admin session
```

### File Upload Verification:
After uploading, verify these files exist on server:
```
✓ hooks/useAdminSession.ts
✓ app/[locale]/admin/layout.tsx
✓ .next/static/chunks/[many files]
✓ .next/server/app/[locale]/admin/layout.js
```

---

## 📁 Files Changed Summary

| File | Status | Purpose |
|------|--------|---------|
| `hooks/useAdminSession.ts` | **NEW** | 30-min idle timeout logic |
| `app/[locale]/admin/layout.tsx` | **UPDATED** | Imports and uses session hook |
| `.next/` | **REBUILT** | Compiled app with new code |

---

## ⚠️ Common Mistakes to Avoid

1. ❌ **Don't** upload old `.next` folder
   - ✅ **Always rebuild** before uploading

2. ❌ **Don't** forget to upload the `hooks` folder
   - ✅ **Hooks folder must exist** on server

3. ❌ **Don't** skip the restart step
   - ✅ **Always restart** Node.js after upload

4. ❌ **Don't** forget to clear browser cache
   - ✅ **Clear cache** before testing

---

## 🔧 Troubleshooting

### Issue: Still getting logged out quickly
**Solution**: 
- Verify `.next` folder was rebuilt AFTER adding the new hook
- Check browser console (F12) for import errors
- Ensure `hooks/useAdminSession.ts` exists on server

### Issue: "Module not found: useAdminSession"
**Solution**:
- Upload `hooks/useAdminSession.ts` to server
- Ensure file path is exactly: `hooks/useAdminSession.ts`
- Restart Node.js application

### Issue: Warning messages not appearing
**Solution**:
- Check browser console for toast notification errors
- Verify react-hot-toast is working (try a manual toast)
- Check if the hook is being called (add console.log for testing)

---

## 📞 Need Help?

If deployment fails:
1. Check Node.js error logs in SmarterASP.NET control panel
2. Verify all files were uploaded successfully
3. Try Option A (upload everything) instead of Option B
4. Ensure Node.js version is compatible (18.x or higher)

---

**Created**: ${new Date().toLocaleDateString()}
**Deployment Type**: Incremental Update (Session Management)
**Estimated Time**: 10-15 minutes
**Downtime**: < 1 minute (during restart)

