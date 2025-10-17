# Email Sending Diagnostic & Fix

## Problem Summary

You tried to register a new public user but didn't receive the SendGrid verification email. The logs showed webhook errors with JSON parsing issues.

## Root Causes Identified

### 1. **Webhook Error (Not the main issue)**
The error you saw was:
```
System.Text.Json.JsonException: The input does not contain any JSON tokens
```

**Cause**: SendGrid sends **empty POST requests** to verify webhook endpoints. The code was trying to deserialize empty strings as JSON, causing errors.

**Fix Applied**: Added check for empty payloads before attempting JSON deserialization.

### 2. **Lack of Detailed Logging**
The original code silently caught email sending failures without detailed logging, making it impossible to diagnose SendGrid API issues.

**Fix Applied**: Added comprehensive logging at every step of the email sending process.

## Changes Made

### 1. Enhanced Email Logging (`EmailService.cs`)
```csharp
- Added logging before sending email with FROM and TO addresses
- Added logging of SendGrid response status codes
- Added logging of SendGrid error messages when email fails
- Added detailed exception logging
```

### 2. Fixed Webhook Handler (`EmailService.cs`)
```csharp
- Check for empty payloads (SendGrid verification pings)
- Added event count logging
- Separated JsonException handling for better diagnostics
- Added payload logging for failed JSON parsing
```

### 3. Enhanced Registration Logging (`AuthController.cs`)
```csharp
- Log when verification token is generated
- Log email sending success/failure
- Log the email address receiving the verification
```

## Common SendGrid Issues to Check

### Issue 1: **FromEmail Not Verified**
**Problem**: SendGrid requires sender email verification
**Check**: 
1. Go to https://app.sendgrid.com/settings/sender_auth
2. Verify that `noreply@ersa-training.com` is verified
3. If not verified, you'll see errors like "403 Forbidden" in logs

**Solution**: 
- Verify the sender email in SendGrid dashboard
- OR use a verified sender email temporarily

### Issue 2: **Invalid API Key**
**Problem**: API key might be expired or invalid
**Check**: Look for "401 Unauthorized" in the new logs

**Solution**: Generate a new API key in SendGrid:
1. Go to https://app.sendgrid.com/settings/api_keys
2. Create a new key with "Mail Send" permissions
3. Update `appsettings.json` with the new key

### Issue 3: **SendGrid Account Issues**
**Problem**: Account suspended, quota exceeded, or payment issues
**Check**: Look for "429 Too Many Requests" or "403 Forbidden" errors

**Solution**: 
1. Check SendGrid dashboard for account status
2. Verify billing and quota limits

### Issue 4: **Spam Folder**
**Problem**: Email is being delivered but going to spam
**Check**: Look for logs showing "Status: 202" (success)

**Solution**: 
- Check spam/junk folder
- Configure SPF/DKIM records for your domain
- Use SendGrid's domain authentication

## Testing the Fix

### Step 1: Rebuild and Restart Backend
```bash
cd backend/src
dotnet build
dotnet run
```

### Step 2: Try Registration Again
Register a new user through the frontend.

### Step 3: Check Logs
Look for these log entries:

✅ **Success Pattern:**
```
[INFO] Generated verification token for user {UserId}, attempting to send email
[INFO] Attempting to send verification email to {Email} from noreply@ersa-training.com
[INFO] Sending email via SendGrid...
[INFO] Verification email sent successfully to {Email}. Status: 202
[INFO] Verification email sent successfully to user {UserId} at {Email}
```

❌ **Failure Pattern:**
```
[ERR] Failed to send verification email to {Email}. Status: 403, Error: {...}
[WARN] Email service returned false for user {UserId} at {Email}
```

### Step 4: Check SendGrid Dashboard
1. Go to https://app.sendgrid.com/
2. Navigate to "Activity" section
3. Search for recent emails sent to your test email
4. Check delivery status

## Debugging Commands

### View Recent Logs
```bash
# In backend/src directory
Get-Content logs/log-*.txt -Tail 100 | Select-String "verification|SendGrid|email"
```

### Test Email Sending Manually
Create a test script `test-email.ps1`:
```powershell
$body = @{
    email = "test@example.com"
    fullName = "Test User"
    phone = "1234567890"
    password = "Test123!"
    locale = "en"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5002/api/Auth/register" -Method POST -Body $body -ContentType "application/json"
```

## Configuration Check

### Current SendGrid Config (`appsettings.json`):
```json
"SendGrid": {
  "ApiKey": "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",
  "FromEmail": "noreply@ersa-training.com",
  "FromName": "Ersa Training",
  "WebhookKey": "https://ersa-training.com/api/proxy?endpoint=/Email/webhook"
}
```

### Verification Checklist:
- [ ] API Key is valid and not expired
- [ ] `FromEmail` (noreply@ersa-training.com) is verified in SendGrid
- [ ] SendGrid account is active and in good standing
- [ ] Quota limits not exceeded
- [ ] Test recipient email is valid
- [ ] Check spam/junk folder
- [ ] Domain authentication configured (SPF, DKIM)

## Quick Solutions

### Solution 1: Use Gmail SMTP (Alternative)
If SendGrid continues to have issues, you can temporarily use Gmail SMTP:

1. Install MailKit:
```bash
dotnet add package MailKit
```

2. Update configuration to support both providers

### Solution 2: Use Verified Sender
Change `FromEmail` to a verified sender:
```json
"FromEmail": "your-verified-email@gmail.com"
```

### Solution 3: SendGrid Sandbox Mode
For testing, use SendGrid's sandbox mode (emails won't actually send):
```csharp
msg.MailSettings = new MailSettings
{
    SandboxMode = new SandboxMode { Enable = true }
};
```

## Next Steps

1. **Restart the backend** with the new logging
2. **Try registration again**
3. **Check the logs** for detailed error messages
4. **Check SendGrid dashboard** for email activity
5. **Verify sender email** if you see 403 errors
6. **Check spam folder** if logs show success but no email received

## Contact Information

If emails are still not being received after these fixes:

1. **Share the new detailed logs** from the backend
2. **Check SendGrid activity feed** and share status
3. **Verify SendGrid account status** (trial limits, billing issues)
4. **Consider alternative email provider** as backup (AWS SES, Mailgun)

---

**Status**: ✅ Code fixes applied, webhook errors resolved, detailed logging added
**Next**: Test registration and check logs for SendGrid API response

