# SendGrid Unauthorized Error - Fix Guide

## Problem
You're getting this error in production:
```
Failed to send verification email. Status: "Unauthorized", Error: {"errors":[{"message":"The provided authorization grant is invalid, expired, or revoked","field":null,"help":null}]}
```

## Root Cause
The SendGrid API key is **invalid, expired, or revoked**. This happens because:
1. The API key in `appsettings.json` is hardcoded and exposed in git
2. SendGrid may have automatically revoked it for security reasons
3. The key may have expired or been deleted from SendGrid dashboard

## Security Issue
⚠️ **CRITICAL**: Your SendGrid API key is currently **hardcoded in `appsettings.json`** which is tracked in git. This is a **major security vulnerability**.

Current exposed key:
```
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
```

## Solution Steps

### Step 1: Generate a New SendGrid API Key

1. Go to [SendGrid Dashboard](https://app.sendgrid.com/)
2. Navigate to **Settings** → **API Keys**
3. Click **"Create API Key"**
4. Choose **Full Access** (or at minimum **Mail Send** permissions)
5. Copy the new API key immediately (you won't see it again!)

### Step 2: Revoke the Old Key

1. In SendGrid Dashboard → **Settings** → **API Keys**
2. Find the old key and click **Delete** or **Revoke**
3. This ensures the exposed key can't be misused

### Step 3: Update Production Environment

Update your production hosting provider's environment variables:

#### For Azure App Service:
```bash
az webapp config appsettings set \
  --name <your-app-name> \
  --resource-group <your-resource-group> \
  --settings SendGrid__ApiKey="<your-new-api-key>"
```

Or via Azure Portal:
1. Go to your App Service
2. Settings → **Configuration**
3. Find `SendGrid__ApiKey` or add new setting
4. Update value with new API key
5. Click **Save**
6. Click **Continue** to restart

#### For other hosting providers:
Add environment variable:
```
SendGrid__ApiKey=<your-new-api-key>
```

### Step 4: Remove Hardcoded Key from appsettings.json

Update `backend/src/appsettings.json`:

```json
"SendGrid": {
  "ApiKey": "",  // Leave empty - use environment variable
  "FromEmail": "noreply@ersa-training.com",
  "FromName": "Ersa Training",
  "WebhookKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGM5fTpe/tMFTIMa3hJ1+VliCwyuv66RwfGe4nHwP/E14S7zWdLXcwdYOw9QvrelUzdhE9jVXjTZA1bbxhdgZWw=="
}
```

### Step 5: Verify Configuration

The app already correctly reads from configuration (see `Program.cs` line 106):
```csharp
builder.Services.AddSendGrid(options =>
{
    options.ApiKey = builder.Configuration["SendGrid:ApiKey"] ?? "";
});
```

This will automatically use environment variable `SendGrid__ApiKey` if set, falling back to `appsettings.json`.

### Step 6: Test Locally (Optional)

If you want to test locally with the new key:

1. Create `backend/src/appsettings.Development.json` (already gitignored)
2. Add your key:
```json
{
  "SendGrid": {
    "ApiKey": "SG.your-new-key-here"
  }
}
```

Or use user secrets:
```bash
cd backend/src
dotnet user-secrets set "SendGrid:ApiKey" "SG.your-new-key-here"
```

### Step 7: Deploy and Restart

1. Commit the change (removing hardcoded key)
2. Deploy to production
3. Restart your application

## Environment Variable Priority

ASP.NET Core configuration reads in this order (highest priority first):
1. **Environment Variables** (e.g., `SendGrid__ApiKey`)
2. User Secrets (development only)
3. `appsettings.{Environment}.json`
4. `appsettings.json`

## Verification

After fixing, test email sending:

1. Try user registration
2. Check logs for successful SendGrid response:
   ```
   Verification email sent successfully to {Email}. Status: Accepted
   ```

## Best Practices Going Forward

1. ✅ **Never commit API keys** to git
2. ✅ Use environment variables for production secrets
3. ✅ Use user secrets for local development
4. ✅ Add `.gitignore` for sensitive files
5. ✅ Rotate keys if exposed
6. ✅ Use minimum required permissions for API keys

## Environment Variable Format

Note the double underscore (`__`) when setting environment variables:
- Config: `SendGrid:ApiKey`
- Environment: `SendGrid__ApiKey`

## Quick Test Command

Test if environment variable is set:

**Windows (PowerShell):**
```powershell
$env:SendGrid__ApiKey
```

**Linux/Mac:**
```bash
echo $SendGrid__ApiKey
```

## Additional Resources

- [SendGrid API Keys Documentation](https://docs.sendgrid.com/ui/account-and-settings/api-keys)
- [ASP.NET Core Configuration](https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [Managing Secrets in Production](https://docs.microsoft.com/en-us/aspnet/core/security/app-secrets)

