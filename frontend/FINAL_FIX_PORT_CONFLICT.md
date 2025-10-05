# 🚨 CRITICAL FIX: Multiple Node Processes Running

## The Problem

IIS/iisnode is starting **multiple Node.js instances** of your application, causing port conflicts:
- One instance starts on port 3003 ✅
- Another tries port 8080 and fails ❌
- They conflict with each other

**Root Cause**: The way your app handles ports doesn't work well with how IIS manages multiple instances.

---

## ✅ THE COMPLETE FIX (Follow These Steps)

### STEP 1: Update .env.production on Server

In SmarterASP.NET File Manager, edit `.env.production`:

**Delete this line** (or comment it out):
```
PORT=3003
```

**The file should contain ONLY:**
```
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://api.ersa-training.com/api
```

**Why?** When PORT is not set, iisnode will automatically use Windows named pipes, which prevents port conflicts.

---

### STEP 2: Update web.config on Server

Replace your `web.config` with this simplified version:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="start.js" verb="*" modules="iisnode"/>
    </handlers>
    
    <iisnode      
      node_env="production"
      nodeProcessCountPerApplication="1"
      watchedFiles="*.js;iisnode.yml"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="true"
      devErrorsEnabled="true"
     />

    <rewrite>
      <rules>
        <!-- Serve Next.js static assets -->
        <rule name="NextJSStatic" stopProcessing="true">
          <match url="^_next/static/(.*)$" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>
        
        <!-- Serve public assets -->
        <rule name="PublicAssets" stopProcessing="true">
          <match url="^(favicon\.ico|robots\.txt|.*\.(png|jpg|jpeg|gif|svg|css|js|woff|woff2|ttf|eot))$" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" />
          </conditions>
          <action type="None" />
        </rule>
        
        <!-- All other requests to Node.js -->
        <rule name="NextJSApp">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true"/>
          </conditions>
          <action type="Rewrite" url="start.js" />
        </rule>
      </rules>
    </rewrite>

    <httpErrors existingResponse="PassThrough" />

  </system.webServer>
</configuration>
```

I've created this file locally at: `d:\Data\work\Ersa\frontend\web.config.FIXED`

---

### STEP 3: Clean Up iisnode Folder

On the server, in File Manager:
1. Navigate to: `h:\root\home\ersatc-001\www\ersatraining\iisnode\`
2. **Delete ALL log files** (this clears old errors)
3. Go back to parent folder

---

### STEP 4: Recycle Application Pool

In SmarterASP.NET Control Panel:
1. Go to **Websites** section
2. Find your website
3. Look for **"Recycle App Pool"** or **"Restart Application Pool"**
4. Click it
5. Wait 30 seconds

---

### STEP 5: Touch web.config

This forces IIS to restart the application:
1. In File Manager, open `web.config`
2. Add a space somewhere (or just save it)
3. This triggers IIS to reload

---

### STEP 6: Test

Visit: **http://ersa-training.com**

Should now load correctly!

---

## 🎯 WHY THIS WORKS

**The Key Change**: Removing `PORT=3003` from `.env.production`

When you don't specify a PORT:
- ✅ iisnode automatically uses Windows **named pipes**
- ✅ Named pipes don't have port conflicts
- ✅ Multiple instances can coexist
- ✅ IIS manages everything automatically

When you specify PORT=3003:
- ❌ Each instance tries to use port 3003
- ❌ First instance succeeds, others fail
- ❌ Causes EADDRINUSE errors

---

## 📋 Quick Checklist

On SmarterASP.NET server:
- [ ] Edit `.env.production` - remove or comment out PORT line
- [ ] Replace `web.config` with the simplified version above
- [ ] Delete all files in `iisnode/` folder
- [ ] Recycle Application Pool
- [ ] Wait 30 seconds
- [ ] Test: http://ersa-training.com

---

## 🔍 What You Should See in Logs After Fix

After the fix, in iisnode logs you should see:
```
✅ Environment variables loaded
🔍 PORT Analysis: undefined (or named pipe detected)
✅ Using named pipe configuration
✅ Server started successfully
```

NO MORE "EADDRINUSE" errors!

---

## ⚠️ CRITICAL NOTES

1. **Don't set PORT in .env.production** - Let iisnode manage it
2. **Don't try to use numeric ports** - Use named pipes (automatic)
3. **nodeProcessCountPerApplication="1"** - This ensures only ONE process runs
4. **After ANY change** - Recycle the app pool

---

## 🆘 If Still Not Working

1. **Check you removed PORT from .env.production**
2. **Verify web.config was updated**
3. **Make sure you recycled the app pool**
4. **Wait a full minute** after recycling
5. **Check latest iisnode log** for new errors

---

## 📦 Files I've Prepared

1. **`web.config.FIXED`** - Corrected web.config ready to upload
   - Location: `d:\Data\work\Ersa\frontend\web.config.FIXED`
   - Upload this to replace your current web.config

---

**The key is: REMOVE PORT from .env.production and let IIS manage ports automatically!**

