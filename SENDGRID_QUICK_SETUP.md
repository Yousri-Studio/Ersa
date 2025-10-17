# SendGrid Quick Setup - 5 Minutes ⚡

## What You Need to Know

✅ **Email verification is already coded and working**  
✅ **Beautiful bilingual templates (AR/EN) are ready**  
✅ **Just add your SendGrid API key to start sending**  

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get SendGrid API Key (2 minutes)

1. Go to https://sendgrid.com/
2. Sign up (Free: 100 emails/day)
3. Settings → API Keys → Create API Key
4. Copy the key (starts with `SG.`)

### Step 2: Add API Key to Config (1 minute)

Open `backend/src/appsettings.Development.json` and update:

```json
{
  "SendGrid": {
    "ApiKey": "SG.paste-your-key-here",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training"
  }
}
```

For production, also update `backend/src/appsettings.json`.

### Step 3: Test It (2 minutes)

1. Start your backend
2. Register a new user from frontend
3. Check the email inbox for verification code
4. Check backend logs if email doesn't arrive

---

## 📧 What Emails Are Configured?

| Email Type | Status | Languages |
|------------|--------|-----------|
| **Email Verification** | ✅ Ready | AR + EN |
| Welcome Email | ✅ Ready | AR + EN |
| Contact Form | ✅ Ready | AR + EN |
| Live Session Details | ✅ Ready | AR + EN |
| Course Materials | ✅ Ready | AR + EN |
| Session Reminders | ✅ Ready | AR + EN |

---

## 🎨 Verification Email Preview

**What users will see:**

```
┌────────────────────────────────────┐
│   Ersa Training                    │
│                                    │
│   Hello [User Name]                │
│                                    │
│   Thank you for registering!       │
│   Your verification code:          │
│                                    │
│   ┏━━━━━━━━━━━━━━━━━━━━━┓         │
│   ┃   ABC123XYZ789     ┃         │
│   ┗━━━━━━━━━━━━━━━━━━━━━┛         │
│                                    │
│   Valid for 24 hours               │
│                                    │
│   Best regards,                    │
│   Ersa Training Team               │
└────────────────────────────────────┘
```

*Same layout for Arabic, just RTL direction*

---

## 🔧 Configuration Options

### Minimal Configuration (Development):
```json
{
  "SendGrid": {
    "ApiKey": "SG.your-key",
    "FromEmail": "noreply@example.com",
    "FromName": "Ersa Training"
  }
}
```

### Full Configuration (Production):
```json
{
  "SendGrid": {
    "ApiKey": "SG.your-production-key",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "webhook-verification-key"
  },
  "Email": {
    "ContactEmail": "contact@ersa-training.com",
    "FromEmail": "noreply@ersa-training.com"
  }
}
```

---

## 🐛 Troubleshooting

### Emails Not Sending?

**Check 1:** Is API key correct?
```bash
# Look for errors in logs
tail -f backend/src/logs/log-*.txt | grep -i email
```

**Check 2:** SendGrid Dashboard
- Login to SendGrid
- Go to Activity tab
- See all email attempts

**Check 3:** Database Logs
```sql
SELECT * FROM EmailLogs ORDER BY CreatedAt DESC LIMIT 10;
```

### Common Issues:

| Problem | Solution |
|---------|----------|
| "Invalid API key" | Regenerate key in SendGrid |
| Emails in spam | Verify domain in SendGrid |
| "From email not verified" | Add sender verification |
| Rate limit exceeded | Upgrade SendGrid plan |

---

## 💰 SendGrid Pricing

| Plan | Emails/Month | Price | Use Case |
|------|--------------|-------|----------|
| **Free** | 3,000 (100/day) | $0 | Development |
| **Essentials** | 50,000 | $19.95 | Small production |
| **Pro** | 100,000 | $89.95 | Production |

---

## 📝 Important Notes

1. **Free tier is perfect for development** - 100 emails/day
2. **Emails are logged in database** - Check `EmailLogs` table
3. **Verification codes expire in 24 hours** - Handled automatically
4. **Frontend already handles resend** - Users can request new codes
5. **Templates are in code** - Not in SendGrid dashboard

---

## 🎯 What Happens After You Configure?

```
User clicks "Register" 
    ↓
Backend generates verification token
    ↓
SendGrid sends beautiful email
    ↓
User receives code
    ↓
User enters code on verify page
    ↓
Account activated! ✅
```

---

## 📚 More Information

- Full guide: `EMAIL_CONFIGURATION_GUIDE.md`
- Template customization: `backend/src/Services/EmailService.cs`
- SendGrid docs: https://docs.sendgrid.com

---

## ✅ Checklist

- [ ] Created SendGrid account
- [ ] Got API key (starts with `SG.`)
- [ ] Updated `appsettings.Development.json`
- [ ] Updated `appsettings.json` (for production)
- [ ] Tested user registration
- [ ] Verified email received
- [ ] Checked email in spam folder (if not in inbox)
- [ ] (Optional) Set up domain verification

---

## 🚀 You're Done!

Your email system is ready. Just add the API key and start testing!

**Test URL:** http://localhost:3000/en/auth/register (or /ar/auth/register)

---

**Need Help?**
- Check logs: `backend/src/logs/log-[date].txt`
- SendGrid Activity: https://app.sendgrid.com/email_activity
- Database: `SELECT * FROM EmailLogs`

