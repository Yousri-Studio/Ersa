# ClickPay Webhook 308 Error - SOLVED

## Problem
ClickPay webhooks are receiving **308 Permanent Redirect** when sending POST requests to ngrok URL.

## Root Cause
- GET requests work (200 OK) ✅
- POST requests fail (308 Redirect) ❌

This indicates an **HTTP → HTTPS redirect** or protocol mismatch between ngrok and your local server.

## ✅ Solution Steps

### 1. Check Your ngrok Command
Make sure ngrok is running with the correct command:

**✅ CORRECT:**
```bash
ngrok http 3000
```

**❌ WRONG:**
```bash
ngrok http https://localhost:3000
ngrok http 3000 --scheme=https
```

### 2. Verify Your Next.js is on HTTP
Your Next.js dev server should be running on:
```
http://localhost:3000
```

NOT:
```
https://localhost:3000
```

### 3. Restart ngrok Properly
```powershell
# Stop any running ngrok
taskkill /F /IM ngrok.exe

# Start ngrok fresh
C:\Users\alyha\ngrok\ngrok.exe http 3000
```

### 4. Get the New URL
From the ngrok console, copy the **HTTPS forwarding URL**:
```
Forwarding    https://abc-123-xyz.ngrok-free.app -> http://localhost:3000
```

### 5. Update Backend Config
Update `backend/src/appsettings.Development.json`:
```json
"ClickPay": {
  "UseProxy": true,
  "ProxyUrl": "https://abc-123-xyz.ngrok-free.app"
},
"Frontend": {
  "BaseUrl": "https://abc-123-xyz.ngrok-free.app"
}
```

### 6. Restart Backend
```powershell
cd backend/src
dotnet run
```

## 🧪 Test the Fix

### Test 1: POST Request (should work now)
```powershell
Invoke-WebRequest -Uri "https://your-ngrok-url.ngrok-free.app/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook" -Method POST -ContentType "application/json" -Body '{"test":"data"}' -UseBasicParsing
```

**Expected:** Status 400 or 200 (NOT 308!)

### Test 2: Complete a Real Payment
1. Add item to cart
2. Go to checkout
3. Complete payment in ClickPay
4. Check backend logs for:
   ```
   🔔 ClickPay webhook received
   📝 RAW PAYLOAD: {...actual payment data...}
   ✅ Payment processed successfully
   ```

## Common Issues

### Issue: ngrok URL changes every restart
**Solution:** Upgrade to ngrok Pro for a static domain, or update config each time.

### Issue: Still getting 308
**Check:**
- Is Next.js forcing HTTPS redirects?
- Is there a middleware forcing HTTPS?
- Check `next.config.js` for redirect rules

### Issue: Webhook payload is empty `[]`
**Cause:** You're testing manually with curl/GET instead of letting ClickPay send the actual POST webhook after a real payment.

**Solution:** Complete a real payment in the ClickPay gateway.

## Verification Checklist

- [ ] ngrok is running on port 3000
- [ ] ngrok command is just `ngrok http 3000`
- [ ] Backend config has the correct ngrok URL
- [ ] Backend is restarted
- [ ] POST request to webhook endpoint returns 200/400 (not 308)
- [ ] Frontend is accessible via ngrok URL
- [ ] Test payment completes successfully
- [ ] Webhook is received in backend logs

## Final Test

Complete an actual payment and you should see in the backend logs:
```
🔧 ClickPay InitiatePayment - UseProxy: True, ApiUrl: https://secure.clickpay.com.sa
🔗 ClickPay webhook URL: https://your-ngrok.ngrok-free.app/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook
✅ ClickPay payment initiated successfully
🔔 ClickPay webhook received
📝 RAW PAYLOAD: {actual clickpay json data}
✅ Webhook signature validated
💰 Processing payment...
✅ Payment marked as paid
```

Success! 🎉

