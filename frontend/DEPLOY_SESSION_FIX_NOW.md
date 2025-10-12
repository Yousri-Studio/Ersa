# 🚀 Quick Deploy Guide - Admin Session Fix

## ⚡ Quick Start (3 Simple Steps)

### Step 1: Build the Package
**Double-click** this file:
```
deploy-session-fix.bat
```

This will:
- ✓ Clean old build
- ✓ Rebuild application with new session code
- ✓ Create `ersa-session-fix.zip` 
- ✓ Generate `UPLOAD_INSTRUCTIONS.txt`

⏱️ **Time**: 2-3 minutes

---

### Step 2: Upload to Server

#### Quick Method:
1. **Login** to SmarterASP.NET
2. Go to **File Manager**
3. **Delete** the `.next` folder on server
4. **Upload** `ersa-session-fix.zip`
5. **Extract** the ZIP file
6. **Delete** the ZIP file after extraction

---

### Step 3: Restart & Test

1. Go to **Node.js Manager** in control panel
2. Click **Restart**
3. Wait 1 minute
4. **Clear browser cache** (Ctrl+Shift+Delete)
5. Visit `https://yourdomain/en/admin-login`
6. Login and test

---

## ✅ What Was Fixed

**Before**: Admin session was timing out too quickly

**After**: 
- ✓ Session lasts **30 minutes** of idle time
- ✓ Warning appears at **25 minutes**
- ✓ Any activity resets the timer
- ✓ Much more user-friendly!

---

## 📋 Files Changed

| File | Status |
|------|--------|
| `hooks/useAdminSession.ts` | ✨ NEW |
| `app/[locale]/admin/layout.tsx` | 🔄 UPDATED |
| `.next/*` | 🔄 REBUILT |

---

## ❓ FAQ

**Q: Do I need to upload everything?**
A: No! The script creates a complete package, but you can upload only the changed files if you prefer. See `UPLOAD_INSTRUCTIONS.txt` for both options.

**Q: Will this affect regular users?**
A: No! This only affects admin users. Regular users are unaffected.

**Q: What if something breaks?**
A: Your current site is still working. Just don't delete the old `.next` folder until you've uploaded the new one.

**Q: How long is the downtime?**
A: Less than 1 minute during the Node.js restart.

---

## 🆘 Need Help?

**Issue**: Build fails
- Check you have the latest code
- Run `npm install` first
- Check for errors in terminal

**Issue**: Upload fails
- Check file permissions on server
- Try uploading to a subfolder first
- Contact SmarterASP.NET support

**Issue**: Site doesn't start after upload
- Verify `start.js` exists
- Check Node.js is enabled in control panel
- Check error logs

---

## 📞 Support

If you're stuck:
1. Check `deploy-session-fix.md` for detailed instructions
2. Check `UPLOAD_INSTRUCTIONS.txt` after running the script
3. Review server error logs in SmarterASP.NET control panel

---

**Ready?** Double-click `deploy-session-fix.bat` to start! 🚀

