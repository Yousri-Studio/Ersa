# ⚡ QUICK FIX: Allow Mixed Content for API Calls

## What to Do RIGHT NOW (2 Minutes)

Your frontend is on HTTPS, but your API is HTTP only. Browsers block this "mixed content".

### OPTION 1: Access Site via HTTP (Quick Test)

Visit: **http://ersa-training.com** (without the 's')

This should load everything including API calls.

---

### OPTION 2: Update .env.production + web.config (5 Minutes)

**Step 1: Edit `.env.production` on server**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=http://api.ersa-training.com/api
```

**Step 2: Update `web.config` - Add Content Security Policy**

Add this inside `<system.webServer>` section (after `</iisnode>`):

```xml
<httpProtocol>
  <customHeaders>
    <remove name="X-Powered-By" />
    <add name="X-Content-Type-Options" value="nosniff" />
  </customHeaders>
</httpProtocol>
```

**Step 3: Recycle App Pool**
- Control Panel → Recycle Application Pool
- Wait 30 seconds
- Test site

---

### OPTION 3: Force HTTP Redirect (Temporary)

Add this as the FIRST rule in your web.config rewrite section:

```xml
<rewrite>
  <rules>
    <!-- Force HTTP (temporary fix for mixed content) -->
    <rule name="Force HTTP" stopProcessing="true">
      <match url="(.*)" />
      <conditions>
        <add input="{HTTPS}" pattern="on" />
      </conditions>
      <action type="Redirect" url="http://{HTTP_HOST}/{R:1}" redirectType="Temporary" />
    </rule>
    
    <!-- ... rest of your rules ... -->
  </rules>
</rewrite>
```

This forces everyone to HTTP version of your site.

---

## ✅ Best Long-term Solution

Enable HTTPS on your backend API:

1. In SmarterASP.NET, check if `api.ersa-training.com` has SSL
2. If not, enable Let's Encrypt SSL
3. Update backend to accept HTTPS
4. Change `.env.production` to `https://api.ersa-training.com/api`

---

## 🚀 DO THIS NOW:

**Quick Test:**
Visit `http://ersa-training.com` (HTTP, not HTTPS)
- If it works → the issue is confirmed as mixed content
- If it doesn't → there's another issue

**Then choose:**
- **For testing**: Use HTTP version of site (Option 3)
- **For production**: Enable HTTPS on API backend

---

**Your CORS is working ✅**
**Your backend API is accessible ✅**  
**Problem**: HTTP/HTTPS mismatch ⚠️
**Solution**: Either force HTTP on frontend OR enable HTTPS on backend

