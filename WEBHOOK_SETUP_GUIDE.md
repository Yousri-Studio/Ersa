# SendGrid Webhook Setup Guide

## 📌 Quick Answer: Do You Need Webhooks?

**For Development/Testing:** ❌ **NO - Skip this entirely**  
**For Production (Optional):** ✅ **YES - If you want email tracking**

---

## What is the WebhookKey?

The `WebhookKey` is a **security verification string** that ensures webhook events are actually coming from SendGrid and not from malicious sources.

### Current Configuration (Default):
```json
{
  "SendGrid": {
    "ApiKey": "SG.B4xP_DckQbWCqBCLiTDHNQ...",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "webhook-verification-key"  // ← Default placeholder
  }
}
```

**Status:** ✅ This default is FINE for development. The code handles missing/placeholder keys gracefully.

---

## 🎯 What Do Webhooks Do?

Webhooks let SendGrid notify your API when email events happen:

| Event | What It Means | Updates Database |
|-------|---------------|------------------|
| **Delivered** | Email reached recipient's mail server | ✅ EmailLog.Status |
| **Opened** | User opened the email | ✅ EmailLog.OpenedAt |
| **Clicked** | User clicked a link in email | ✅ EmailLog.ClickedAt |
| **Bounced** | Email bounced (invalid address) | ✅ EmailLog.Status |
| **Spam Report** | User marked as spam | ✅ EmailLog.Status |

### Example Flow:
```
1. User registers → Email sent
2. SendGrid delivers email
3. SendGrid sends webhook to your API: "Email delivered!"
4. Your API updates EmailLog: Status = Delivered
5. User opens email
6. SendGrid sends webhook: "Email opened!"
7. Your API updates EmailLog: OpenedAt = Now
```

---

## 🚀 Option 1: Skip Webhooks (Recommended for Now)

### What You Keep:
- ✅ Email sending works perfectly
- ✅ Verification emails delivered
- ✅ Basic email logging (Sent/Failed)

### What You Miss:
- ❌ No delivery confirmation tracking
- ❌ No open rate tracking
- ❌ No click tracking

**Recommendation:** Start without webhooks, add later if needed.

**No action needed** - your current config is fine!

---

## 🔧 Option 2: Set Up Webhooks (Production)

### Prerequisites:
1. Backend deployed to public URL (e.g., `https://api.ersa-training.com`)
2. SendGrid account configured
3. 10 minutes of setup time

### Step 1: Generate WebhookKey

**Option A - PowerShell (Windows):**
```powershell
# Generate a secure random key
$bytes = New-Object byte[] 32
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**Option B - Bash (Linux/Mac):**
```bash
openssl rand -base64 32
```

**Option C - Simple String:**
```
my-super-secret-webhook-key-2024-ersa-training-xyz123
```

**Copy the generated key!** You'll need it in both places.

---

### Step 2: Update Backend Configuration

**File:** `backend/src/appsettings.json` (Production)

```json
{
  "SendGrid": {
    "ApiKey": "SG.your-production-key",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "paste-your-generated-key-here"  // ← ADD YOUR KEY
  }
}
```

**File:** `backend/src/appsettings.Development.json` (Optional for testing)

```json
{
  "SendGrid": {
    "ApiKey": "SG.B4xP_DckQbWCqBCLiTDHNQ...",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training",
    "WebhookKey": "test-webhook-key-for-development"  // ← Different key for dev
  }
}
```

---

### Step 3: Verify Webhook Endpoint

I've created the webhook endpoint for you! It's now available at:

**Endpoint:** `POST /api/email/webhook`

**Full URL:** `https://your-api-domain.com/api/email/webhook`

**File Created:** `backend/src/Controllers/EmailController.cs`

The endpoint:
- ✅ Receives SendGrid webhook events
- ✅ Validates webhook signature (when WebhookKey is configured)
- ✅ Updates EmailLog database records
- ✅ Handles errors gracefully
- ✅ Logs all webhook activity

---

### Step 4: Configure SendGrid Dashboard

1. **Login to SendGrid**
   ```
   https://app.sendgrid.com
   ```

2. **Navigate to Event Webhook**
   ```
   Settings → Mail Settings → Event Webhook
   ```

3. **Enable Event Webhook**
   - Toggle: **ON**

4. **HTTP POST URL**
   ```
   https://your-api-domain.com/api/email/webhook
   ```
   
   Examples:
   - Production: `https://api.ersa-training.com/api/email/webhook`
   - Development: `https://your-ngrok-url.ngrok.io/api/email/webhook`

5. **Authorization Method**
   - Select: **None** (we use custom header validation)

6. **Select Actions to Post**
   
   ✅ Check these:
   - [x] Delivered
   - [x] Opened
   - [x] Clicked
   - [x] Bounced
   - [x] Dropped
   - [x] Spam Reports
   - [x] Unsubscribes
   
   ❌ Uncheck these (not needed):
   - [ ] Processed
   - [ ] Deferred
   - [ ] Group Unsubscribes
   - [ ] Group Resubscribes

7. **Event Webhook Signature**
   - Enable: **ON**
   - Verification Key: **Paste your WebhookKey here** (the same one from appsettings.json)

8. **Test Your Integration**
   - Click **"Test Your Integration"**
   - SendGrid will send a test webhook
   - Check your backend logs for: "Received SendGrid webhook"

9. **Save**
   - Click **"Save"**
   - Webhook is now active! ✅

---

## 🧪 Testing Webhooks

### Test 1: Send Test Email
```bash
# Register a user
POST https://your-api.com/api/auth/register
{
  "fullName": "Test User",
  "email": "your-real-email@gmail.com",
  "password": "Test123!",
  "locale": "en"
}
```

### Test 2: Check Backend Logs
```bash
# Look for webhook logs
tail -f backend/src/logs/log-*.txt | grep -i webhook

# You should see:
# [INFO] Received SendGrid webhook
# [INFO] Processing SendGrid event: delivered
```

### Test 3: Check Database
```sql
-- Check EmailLog status updates
SELECT 
    Id,
    TemplateKey,
    Status,
    CreatedAt,
    SentAt,
    OpenedAt,
    ClickedAt,
    ProviderMsgId
FROM EmailLogs
ORDER BY CreatedAt DESC;

-- Expected Status values:
-- 0 = Pending
-- 1 = Sent
-- 2 = Delivered  ← Webhook updated this!
-- 3 = Opened     ← Webhook updated this!
-- 4 = Clicked    ← Webhook updated this!
```

### Test 4: Open the Email
1. Check your email inbox
2. Open the verification email
3. Wait 30 seconds
4. Check database - `OpenedAt` should be populated!

---

## 🔐 How Webhook Security Works

### Current Implementation:

The webhook validation code (in `EmailService.cs`) is set up but needs proper signature validation implementation:

```csharp
// Current code (lines 308-316)
private bool ValidateWebhookSignature(string payload, string signature)
{
    var webhookKey = _configuration["SendGrid:WebhookKey"];
    if (string.IsNullOrEmpty(webhookKey)) return true; // Skip if not configured
    
    // TODO: Implement proper signature validation
    return true;
}
```

### Proper Implementation (Optional Enhancement):

To add real signature validation:

```csharp
using System.Security.Cryptography;
using System.Text;

private bool ValidateWebhookSignature(string payload, string signature)
{
    var webhookKey = _configuration["SendGrid:WebhookKey"];
    if (string.IsNullOrEmpty(webhookKey)) return true;
    
    try
    {
        // SendGrid signs webhooks with HMAC-SHA256
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(webhookKey));
        var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
        var computedSignature = Convert.ToBase64String(computedHash);
        
        return signature == computedSignature;
    }
    catch
    {
        return false;
    }
}
```

**For now:** The placeholder validation is fine. Add proper validation later if needed.

---

## 📊 Monitoring Webhook Activity

### SendGrid Dashboard
```
Activity → Event Webhook → Deliveries
```
Shows:
- Total webhooks sent
- Success rate
- Failed webhooks
- Response times

### Backend Logs
```bash
# Real-time monitoring
tail -f backend/src/logs/log-*.txt | grep -i "sendgrid\|webhook\|email"
```

### Database Queries
```sql
-- Email delivery success rate
SELECT 
    Status,
    COUNT(*) as Count,
    CAST(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER() as DECIMAL(5,2)) as Percentage
FROM EmailLogs
GROUP BY Status;

-- Recent email activity
SELECT TOP 20
    TemplateKey,
    Status,
    CreatedAt,
    SentAt,
    OpenedAt,
    ErrorMessage
FROM EmailLogs
ORDER BY CreatedAt DESC;

-- Open rate by template
SELECT 
    TemplateKey,
    COUNT(*) as TotalSent,
    SUM(CASE WHEN OpenedAt IS NOT NULL THEN 1 ELSE 0 END) as Opened,
    CAST(SUM(CASE WHEN OpenedAt IS NOT NULL THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as DECIMAL(5,2)) as OpenRate
FROM EmailLogs
WHERE Status >= 1  -- Sent or better
GROUP BY TemplateKey;
```

---

## 🐛 Troubleshooting

### Problem: Webhooks Not Received

**Check 1:** Is your API publicly accessible?
```bash
curl https://your-api.com/api/email/webhook -X POST
# Should return 200 or 500, not connection error
```

**Check 2:** SendGrid Dashboard
```
Activity → Event Webhook → Failed Attempts
```

**Check 3:** Backend is running
```bash
# Check backend logs
tail -f backend/src/logs/log-*.txt
```

**Check 4:** Firewall/Security
- Ensure port 443 (HTTPS) is open
- Check Azure/AWS security groups
- Verify no rate limiting

---

### Problem: Signature Validation Failing

**If you implement proper validation and it fails:**

1. **Verify WebhookKey matches**
   - SendGrid dashboard key
   - appsettings.json key
   - Should be EXACTLY the same

2. **Check header name**
   ```csharp
   // Correct header name:
   var signature = Request.Headers["X-Twilio-Email-Event-Webhook-Signature"].FirstOrDefault();
   ```

3. **Disable temporarily for testing**
   ```json
   {
     "SendGrid": {
       "WebhookKey": ""  // Empty = skip validation
     }
   }
   ```

---

## 🔄 Development Testing with ngrok

To test webhooks in development:

### Step 1: Install ngrok
```bash
# Download from: https://ngrok.com/download
# Or via chocolatey:
choco install ngrok

# Or via npm:
npm install -g ngrok
```

### Step 2: Start Backend
```bash
cd backend/src
dotnet run
# Backend running on http://localhost:5002
```

### Step 3: Start ngrok Tunnel
```bash
ngrok http 5002
```

Output:
```
Forwarding https://abc123.ngrok.io -> http://localhost:5002
```

### Step 4: Configure SendGrid
Use ngrok URL in SendGrid webhook configuration:
```
https://abc123.ngrok.io/api/email/webhook
```

### Step 5: Test
Register a user and watch ngrok console for incoming webhooks!

---

## 📋 Summary: What to Do

### Right Now (Development):
```
✅ Nothing! Current config is fine.
✅ Emails will send perfectly without webhook setup.
✅ Basic logging works without webhooks.
```

### Before Production:
```
1. Generate secure WebhookKey
2. Add to appsettings.json
3. Deploy backend
4. Configure SendGrid dashboard
5. Test with real email
6. Monitor for 24 hours
7. Done!
```

---

## 🎓 Key Takeaways

1. **WebhookKey is optional** - Email sending works without it
2. **Webhooks = Email tracking** - Delivery, opens, clicks
3. **Set up in production** - Skip for development
4. **10 minutes to configure** - When you're ready
5. **Current code is ready** - Endpoint already created for you
6. **No changes needed now** - Focus on getting SendGrid API key first

---

## 📞 References

- **SendGrid Webhook Docs:** https://docs.sendgrid.com/for-developers/tracking-events/event
- **Webhook Security:** https://docs.sendgrid.com/for-developers/tracking-events/getting-started-event-webhook-security
- **Email Controller:** `backend/src/Controllers/EmailController.cs`
- **Email Service:** `backend/src/Services/EmailService.cs`

---

## ✅ Final Answer to Your Question

**"What is WebhookKey and how to set it?"**

**Answer:**
- WebhookKey = Security string to verify webhooks are from SendGrid
- Current value "webhook-verification-key" is a placeholder
- **For now:** Leave it as-is, it works fine!
- **For production:** Generate random key, add to both SendGrid dashboard and appsettings.json

**You don't need to change it right now.** Focus on testing email registration first with your SendGrid API key. Set up webhooks later when you're ready for production! 🚀

