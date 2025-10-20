# SendGrid Production Fix - Site4Now.net Hosting

## Issue Summary
You're getting this error in production:
```
Failed to send verification email. Status: "Unauthorized"
Error: {"errors":[{"message":"The provided authorization grant is invalid, expired, or revoked",...}]}
```

## Root Cause
The SendGrid API key configured in production is **invalid, expired, or revoked**.

## 🔍 How Site4Now.net Handles Configuration

Site4Now.net hosting reads configuration from:
1. **`appsettings.json`** file (uploaded with your backend)
2. **`web.config`** file (for ASP.NET Core)
3. **Environment Variables** (if configured through their control panel)

## ✅ Solution: Update Production SendGrid API Key

### Step 1: Create a New SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Configure:
   - **Name**: `Ersa Training Production`
   - **Permissions**: **Full Access** (or Restricted with "Mail Send" enabled)
5. Click **"Create & View"**
6. **⚠️ COPY THE KEY IMMEDIATELY** (you can only see it once!)
   - It starts with `SG.`
   - Example: `SG.abc123XYZ456...`

### Step 2: Update Production Configuration

You have **two options** to update the key in production:

#### Option A: Update appsettings.json (Quick Fix)

1. Open `backend/src/appsettings.json` locally
2. Update line 14 with your NEW API key:
   ```json
   {
     "SendGrid": {
       "ApiKey": "SG.YOUR_NEW_PRODUCTION_API_KEY_HERE",
       "FromEmail": "noreply@ersa-training.com",
       "FromName": "Ersa Training",
       "WebhookKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGM5fTpe/tMFTIMa3hJ1+VliCwyuv66RwfGe4nHwP/E14S7zWdLXcwdYOw9QvrelUzdhE9jVXjTZA1bbxhdgZWw=="
     }
   }
   ```
3. **Deploy to Site4Now.net**:
   - Via FTP: Upload the updated `appsettings.json` file
   - Via File Manager: Edit directly in Site4Now control panel
   - Via Deployment: Redeploy your backend

#### Option B: Use Environment Variables (Best Practice)

**Note**: Check if Site4Now.net control panel allows setting environment variables.

1. Log into Site4Now.net Control Panel
2. Look for **Environment Variables** or **Application Settings**
3. Add new setting:
   - **Name**: `SendGrid__ApiKey` (note double underscore)
   - **Value**: `SG.YOUR_NEW_PRODUCTION_API_KEY_HERE`
4. Keep `appsettings.json` with empty ApiKey (secure):
   ```json
   {
     "SendGrid": {
       "ApiKey": "",
       "FromEmail": "noreply@ersa-training.com",
       "FromName": "Ersa Training"
     }
   }
   ```

### Step 3: Verify SendGrid Sender Authentication

**IMPORTANT**: SendGrid requires sender verification!

1. Go to SendGrid Dashboard → **Settings** → **Sender Authentication**
2. Choose one option:

   **Option A: Single Sender Verification** (Quick, for testing)
   - Click **"Verify a Single Sender"**
   - Enter: `noreply@ersa-training.com`
   - Check your email for verification link
   - Click the link to verify

   **Option B: Domain Authentication** (Recommended for production)
   - Click **"Authenticate Your Domain"**
   - Enter: `ersa-training.com`
   - Follow wizard to get DNS records
   - Add DNS records to your domain provider
   - Wait for verification (up to 48 hours)

### Step 4: Restart Your Application

After updating the API key, restart your backend:

**Via Site4Now.net Control Panel:**
1. Log into control panel
2. Go to your website management
3. Click **"Restart Application"** or **"Recycle Application Pool"**

**Via FTP:**
- Upload a dummy file to trigger app restart
- Or modify `web.config` (add a space, save)

### Step 5: Test Email Sending

1. Try registering a new user from your website
2. Check if verification email is sent
3. Monitor logs for success message

## 🔍 Checking Current Configuration

### Check What's Deployed in Production

1. **Via FTP Client**:
   - Connect to your Site4Now FTP
   - Navigate to your backend folder
   - Download `appsettings.json`
   - Check the `SendGrid:ApiKey` value

2. **Via Site4Now File Manager**:
   - Log into control panel
   - Use File Manager
   - Navigate to backend directory
   - Open `appsettings.json`
   - Check current API key

### Verify SendGrid API Key is Valid

Test your API key with PowerShell:

```powershell
$apiKey = "SG.YOUR_API_KEY_HERE"
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}
$body = @{
    personalizations = @(
        @{
            to = @(
                @{
                    email = "test@example.com"
                }
            )
            subject = "Test Email"
        }
    )
    from = @{
        email = "noreply@ersa-training.com"
        name = "Ersa Training"
    }
    content = @(
        @{
            type = "text/plain"
            value = "This is a test email"
        }
    )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/mail/send" -Method POST -Headers $headers -Body $body
```

**Expected Results:**
- ✅ Success: No error (HTTP 202 Accepted)
- ❌ Error: "Unauthorized" = API key is invalid

## 📊 Monitoring Production Emails

### Check SendGrid Activity

1. Go to [SendGrid Activity Feed](https://app.sendgrid.com/email_activity)
2. Filter by:
   - Date range: Last 24 hours
   - Status: All
3. Look for your verification emails
4. Check delivery status

### Check Application Logs

**Via Site4Now.net:**
1. Log into control panel
2. Find **"Logs"** or **"Error Logs"** section
3. Look for:
   - ✅ Success: `"Verification email sent successfully"`
   - ❌ Error: `"Failed to send verification email"` with status code

**Via FTP:**
- Download logs from: `backend/logs/log-[date].txt`
- Search for "SendGrid" or "email"

## 🚨 Important Notes

### About the Exposed API Key

⚠️ The API key in your current `appsettings.json` was:
```
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
```

This key is:
- ✅ **Already removed** from the git repository
- ❌ **Needs to be revoked** in SendGrid (to prevent misuse)
- ❌ **Should be replaced** with new key

### Security Best Practices

1. ✅ **Never commit API keys** to git
2. ✅ **Use environment variables** for production (if available)
3. ✅ **Rotate keys** if exposed
4. ✅ **Use restricted permissions** (only "Mail Send" if possible)
5. ✅ **Monitor SendGrid activity** for suspicious sends

## 🔄 Deployment Flow

```
1. Create new SendGrid API key
       ↓
2. Update production config (appsettings.json or env var)
       ↓
3. Verify sender email in SendGrid
       ↓
4. Deploy to Site4Now.net
       ↓
5. Restart application
       ↓
6. Test email sending
       ↓
7. Check logs and SendGrid activity
       ↓
8. ✅ Emails working!
```

## ✅ Verification Checklist

- [ ] Created new SendGrid API key
- [ ] Copied the new API key
- [ ] Revoked old exposed API key in SendGrid
- [ ] Updated `appsettings.json` with new key
- [ ] Verified sender email in SendGrid (`noreply@ersa-training.com`)
- [ ] Deployed updated config to Site4Now.net
- [ ] Restarted application
- [ ] Tested user registration
- [ ] Received verification email
- [ ] Checked SendGrid activity feed
- [ ] Verified no "Unauthorized" errors in logs

## 🆘 Troubleshooting

### Still Getting "Unauthorized"?

1. **Double-check API key** - Ensure it's copied correctly (no extra spaces)
2. **Check sender verification** - Must verify `noreply@ersa-training.com`
3. **Verify deployment** - Ensure updated `appsettings.json` is deployed
4. **Restart app** - Application must restart to pick up new config
5. **Check SendGrid account** - Ensure account is active and not suspended

### Emails Still Not Sending?

1. **Check From Email** - Must match verified sender in SendGrid
2. **Check API key permissions** - Must have "Mail Send" enabled
3. **Check SendGrid quota** - Free tier: 100 emails/day
4. **Check logs** - Look for detailed error messages
5. **Test API key** - Use PowerShell script above

### Where to Get Help

- **SendGrid Support**: [https://support.sendgrid.com](https://support.sendgrid.com)
- **SendGrid Docs**: [https://docs.sendgrid.com](https://docs.sendgrid.com)
- **Site4Now Support**: Contact via your control panel
- **Application Logs**: Check `backend/logs/log-[date].txt`

## 📞 Quick Commands

### Test Production API (PowerShell)
```powershell
# Test if backend is running
Invoke-RestMethod -Uri "http://api.ersa-training.com/api/health" -Method GET

# Check API configuration (if you have a test endpoint)
Invoke-RestMethod -Uri "http://api.ersa-training.com/swagger" -Method GET
```

### Check SendGrid Configuration
```csharp
// In your backend startup logs, look for:
// "SendGrid client configured with API key starting with: SG.xxx..."
```

---

## Summary

The fix is simple:
1. **Create new SendGrid API key**
2. **Update `appsettings.json` in production**
3. **Verify sender email in SendGrid**
4. **Restart application**
5. **Test and verify**

The SendGrid API key is the only thing that needs to be fixed. Once updated, emails will start working immediately!

