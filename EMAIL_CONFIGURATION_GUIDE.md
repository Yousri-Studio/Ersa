# Email Configuration Guide - Ersa Training Platform

## Overview

The Ersa Training platform uses **SendGrid** for email delivery. The email service is fully configured and includes beautiful, bilingual (Arabic/English) email templates for:

✅ **Email Verification** - Sends verification codes to new users  
✅ **Welcome Emails** - Welcome messages for verified users  
✅ **Contact Form** - Notifications and confirmations  
✅ **Live Session Details** - Teams links and session info  
✅ **Course Materials** - Secure download links  
✅ **Live Reminders** - 24h and 1h before session starts  

---

## 🎨 Email Verification Template

The verification email template is **already implemented** with:

### Features:
- ✅ Bilingual support (Arabic/English based on user locale)
- ✅ Beautiful gradient design matching your brand colors (#00AC96 to #292561)
- ✅ Large, centered verification code display
- ✅ Mobile-responsive HTML layout
- ✅ Automatic token generation using ASP.NET Identity

### Template Preview:

**English Version:**
```
Hello [User Name]

Thank you for registering with Ersa Training. To complete your registration, 
please use the following verification code:

┌─────────────────────┐
│   [VERIFICATION]    │
│      CODE HERE      │
└─────────────────────┘

This code is valid for 24 hours.

Best regards,
Ersa Training Team
```

**Arabic Version:**
```
مرحباً [اسم المستخدم]

شكراً لك على التسجيل في إرساء للتدريب. لإكمال عملية التسجيل، 
يرجى استخدام رمز التفعيل التالي:

┌─────────────────────┐
│    رمز التفعيل     │
│      هنا           │
└─────────────────────┘

هذا الرمز صالح لمدة 24 ساعة.

مع تحيات فريق إرساء للتدريب
```

---

## ⚙️ Configuration Steps

### Step 1: Get SendGrid API Key

1. Go to [SendGrid](https://sendgrid.com/) and create an account (Free tier: 100 emails/day)
2. Navigate to **Settings** > **API Keys**
3. Click **Create API Key**
4. Choose **Full Access** or **Restricted Access** with Mail Send permissions
5. Copy your API key (you won't see it again!)

### Step 2: Configure Backend

The configuration files have been updated with SendGrid settings:

#### Development Environment (`appsettings.Development.json`):
```json
{
  "SendGrid": {
    "ApiKey": "your-sendgrid-api-key-here",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "your-sendgrid-webhook-verification-key"
  },
  "Email": {
    "ContactEmail": "contact@ersa-training.com",
    "FromEmail": "noreply@ersa-training.com"
  }
}
```

#### Production Environment (`appsettings.json`):
```json
{
  "SendGrid": {
    "ApiKey": "your-sendgrid-api-key",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "your-sendgrid-webhook-verification-key"
  },
  "Email": {
    "ContactEmail": "contact@ersa-training.com",
    "FromEmail": "noreply@ersa-training.com"
  }
}
```

### Step 3: Update Configuration Values

Replace the following placeholders in **both** `appsettings.json` and `appsettings.Development.json`:

| Setting | Description | Example |
|---------|-------------|---------|
| `SendGrid:ApiKey` | Your SendGrid API key | `SG.xxxxxxxxxxxxxxxxxx` |
| `SendGrid:FromEmail` | Sender email address | `noreply@ersa-training.com` |
| `SendGrid:FromName` | Sender display name | `Ersa Training` |
| `Email:ContactEmail` | Admin contact email | `contact@ersa-training.com` |
| `Email:FromEmail` | Default from email | `noreply@ersa-training.com` |

### Step 4: Verify Domain (Recommended for Production)

To improve deliverability and remove "via sendgrid.net" from emails:

1. In SendGrid, go to **Settings** > **Sender Authentication**
2. Click **Authenticate Your Domain**
3. Follow the wizard to add DNS records to your domain
4. Wait for DNS propagation (up to 48 hours)
5. Update `FromEmail` to use your verified domain

---

## 🧪 Testing Email Service

### Test 1: User Registration
```bash
# Register a new user (from frontend or API)
POST http://localhost:5002/api/auth/register
{
  "fullName": "Test User",
  "email": "test@example.com",
  "password": "Test123!",
  "locale": "en"
}

# Check backend logs for email sending status
# Look for: "Failed to send verification email" or success message
```

### Test 2: Resend Verification
```bash
POST http://localhost:5002/api/auth/resend-verification
{
  "email": "test@example.com"
}
```

### Test 3: Check Email Logs (Database)
```sql
-- Query email logs to see delivery status
SELECT * FROM EmailLogs 
ORDER BY CreatedAt DESC
```

---

## 📧 Email Flow Diagram

```
User Registration
       ↓
Generate Verification Token (ASP.NET Identity)
       ↓
Send Email via SendGrid
       ↓
   [Success?]
   ↙      ↘
 Yes       No
  ↓         ↓
Log:     Log: 
Sent    Failed
  ↓         ↓
User    Retry
Verifies  Later
  ↓
Account
Activated
```

---

## 🔍 Troubleshooting

### Problem: Emails Not Sending

**Check 1: API Key Configuration**
```bash
# Verify API key is loaded
dotnet run --project backend/src

# Look for startup logs showing SendGrid is configured
```

**Check 2: SendGrid Dashboard**
- Log into SendGrid
- Go to **Activity** to see email attempts
- Check for any blocked/failed sends

**Check 3: Backend Logs**
```bash
# Check logs/log-[date].txt for errors
cat logs/log-*.txt | grep -i "email"
```

### Problem: Emails Go to Spam

**Solutions:**
1. ✅ Verify your domain in SendGrid
2. ✅ Set up SPF and DKIM records
3. ✅ Avoid spam trigger words in templates
4. ✅ Warm up your sending domain gradually

### Problem: "Authentication Failed" Error

**Solution:**
- Ensure API key has correct permissions
- Regenerate API key if needed
- Update `appsettings.json` with new key

---

## 🎨 Email Template Customization

### Location
All email templates are in: `backend/src/Services/EmailService.cs`

### Customizing Verification Email

Find the `SendSimpleVerificationEmailAsync` method (lines 62-101) and modify:

```csharp
var bodyHtml = user.Locale == "ar" 
    ? $@"
        <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'>
            <h2>مرحباً {user.FullName}</h2>
            <!-- Add your custom Arabic content here -->
            <div style='background-color: #f0f0f0; padding: 20px; text-align: center; 
                        font-size: 24px; font-weight: bold; margin: 20px 0;'>
                {verificationToken}
            </div>
            <!-- Add custom footer -->
        </div>"
    : $@"
        <div style='font-family: Arial, sans-serif;'>
            <h2>Hello {user.FullName}</h2>
            <!-- Add your custom English content here -->
            <div style='background-color: #f0f0f0; padding: 20px; text-align: center; 
                        font-size: 24px; font-weight: bold; margin: 20px 0;'>
                {verificationToken}
            </div>
            <!-- Add custom footer -->
        </div>";
```

### Adding Logo to Emails

1. Host your logo online (e.g., on Azure Blob Storage)
2. Add to email template:
```html
<img src="https://your-cdn.com/logo.png" alt="Ersa Training" style="max-width: 200px;">
```

---

## 📊 Email Analytics

SendGrid provides detailed analytics:

1. **Dashboard** > **Stats** > **Overview**
   - Delivery rates
   - Open rates
   - Click rates
   - Bounce rates

2. **Activity Feed**
   - Real-time email tracking
   - Individual email status
   - Error details

---

## 🔒 Security Best Practices

1. ✅ **Never commit API keys** to Git
2. ✅ Use environment variables in production
3. ✅ Rotate API keys periodically
4. ✅ Use restricted API keys (not full access)
5. ✅ Enable webhook signature verification
6. ✅ Monitor for suspicious sending patterns

---

## 💡 SendGrid Free Tier Limits

- **100 emails/day** forever free
- Good for development and testing
- Upgrade to paid plan for production:
  - Essentials: $19.95/mo (50,000 emails)
  - Pro: $89.95/mo (100,000 emails)

---

## 🚀 Next Steps

1. ✅ Get SendGrid API key
2. ✅ Update `appsettings.json` and `appsettings.Development.json`
3. ✅ Test user registration with email verification
4. ✅ Verify emails are delivered successfully
5. ✅ (Optional) Set up domain authentication
6. ✅ (Optional) Customize email templates with your branding

---

## 📞 Support

For SendGrid support:
- Documentation: https://docs.sendgrid.com
- Support: https://support.sendgrid.com

For platform support:
- Email: contact@ersa-training.com
- Check backend logs: `logs/log-[date].txt`

---

## ✅ Configuration Complete!

Your email service is **fully configured** and ready to use. Just add your SendGrid API key to the configuration files and test the registration flow!

The beautiful verification email template with Arabic/English support is already implemented and will work automatically once you configure the SendGrid API key.

