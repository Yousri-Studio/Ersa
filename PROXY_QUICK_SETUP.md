# Quick Setup: ClickPay Proxy for Local Development

## 🚀 5-Minute Setup

### Step 1: Start ngrok
```powershell
ngrok http 5002
```

### Step 2: Copy Your ngrok URL
Look for the line that says:
```
Forwarding    https://abc123-def456.ngrok-free.app -> http://localhost:5002
```
Copy: `https://abc123-def456.ngrok-free.app`

### Step 3: Update Backend Config
Open `backend/src/appsettings.Development.json` and update:
```json
"ClickPay": {
  "UseProxy": true,
  "ProxyUrl": "https://abc123-def456.ngrok-free.app"
}
```

### Step 4: Update ClickPay Dashboard
1. Log in to ClickPay merchant dashboard
2. Go to webhook settings
3. Set webhook URL to: `https://abc123-def456.ngrok-free.app/api/payments/clickpay/webhook`
4. Save

### Step 5: Restart Backend
```powershell
cd backend/src
dotnet run
```

### Step 6: Test
1. Make a test payment through your frontend
2. Watch backend console for:
   ```
   🔧 ClickPay InitiatePayment - UseProxy: True, ApiUrl: https://abc123-def456.ngrok-free.app
   🔔 ClickPay webhook received
   ✅ Webhook signature validated
   💰 Processing payment...
   ```

## ✅ Success!
Your local backend can now receive ClickPay webhooks!

## 🔄 When ngrok Restarts
ngrok free URLs change on restart. Just repeat Steps 2-4.

## 🚫 For Production
Set `UseProxy: false` in `appsettings.json` to use direct ClickPay connection.

