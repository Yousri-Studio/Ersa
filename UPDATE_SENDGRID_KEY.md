# Update SendGrid API Key

## ⚠️ Current Issue
Your SendGrid API key is invalid/expired/revoked. Email sending is failing with:
```
Status: Unauthorized
"The provided authorization grant is invalid, expired, or revoked"
```

## 🔧 Fix Steps

### 1. Create New SendGrid API Key

1. Login: https://app.sendgrid.com/
2. Go to: **Settings** → **API Keys**
3. Click: **"Create API Key"**
4. Configure:
   - **Name**: `Ersa Training Development`
   - **Permissions**: **Full Access** (or Restricted with Mail Send enabled)
5. Click: **"Create & View"**
6. **COPY THE KEY IMMEDIATELY** (you can only see it once!)

### 2. Update Configuration Files

#### For Development (`appsettings.Development.json`)

Update line 14:
```json
{
  "SendGrid": {
    "ApiKey": "SG.YOUR_NEW_API_KEY_HERE",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEGM5fTpe/tMFTIMa3hJ1+VliCwyuv66RwfGe4nHwP/E14S7zWdLXcwdYOw9QvrelUzdhE9jVXjTZA1bbxhdgZWw=="
  }
}
```

#### For Production (`appsettings.json`)

Update line 14:
```json
{
  "SendGrid": {
    "ApiKey": "SG.YOUR_PRODUCTION_API_KEY_HERE",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "your-production-webhook-key"
  }
}
```

### 3. Restart Your Backend

```bash
# Stop the current running backend (Ctrl+C)
# Then restart:
cd backend
dotnet run
```

### 4. Test Email Sending

Make a test purchase or register a new user to test email delivery.

## ✅ Verification

After updating, check logs for:
- ✅ "Email sent successfully"
- ✅ No more "Unauthorized" errors

## 🔒 Security Best Practices

### For Development:
- Keep API key in `appsettings.Development.json`
- **NEVER commit this file to Git!**
- Add to `.gitignore`:
  ```
  appsettings.Development.json
  appsettings.Production.json
  ```

### For Production:
Use **Environment Variables** instead of config files:

**Azure App Service**:
1. Portal → App Service → Configuration
2. Add Application Setting:
   - Name: `SendGrid__ApiKey`
   - Value: `SG.YOUR_PRODUCTION_KEY`

**Environment Variable (Windows)**:
```powershell
$env:SendGrid__ApiKey="SG.YOUR_KEY_HERE"
```

## 📧 Verify SendGrid Email Address

Also ensure your sender email is verified in SendGrid:

1. Go to: **Settings** → **Sender Authentication**
2. Verify: `noreply@ersa-training.com`
3. Complete domain authentication for better deliverability

## 🆘 Still Not Working?

Check these:
1. **API Key Permissions**: Ensure "Mail Send" is enabled
2. **Sender Verification**: Verify `noreply@ersa-training.com` in SendGrid
3. **From Email**: Must match a verified sender in SendGrid
4. **Account Status**: Check if SendGrid account is active
5. **Billing**: Ensure SendGrid account has available sends

## 📊 Monitor Email Activity

After fixing, monitor in SendGrid:
- **Activity Feed**: https://app.sendgrid.com/email_activity
- Check delivery status of emails
- View bounce/spam reports

---

**Need Help?** Contact SendGrid support if you continue to have authorization issues.

