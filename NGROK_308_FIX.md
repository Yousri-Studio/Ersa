# Fix ngrok 308 Redirect Error

## Problem
ClickPay webhooks are getting **308 Permanent Redirect** responses from ngrok instead of reaching your backend.

## Root Cause
Free ngrok shows a browser warning interstitial page before forwarding requests. This causes the 308 redirect.

## ✅ Solution: Authenticate ngrok

### Step 1: Sign up for ngrok (Free)
Visit: https://ngrok.com/signup

### Step 2: Get Your Authtoken
1. Log in to ngrok dashboard
2. Go to: https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken (looks like: `2abc123def456ghi789jkl0`)

### Step 3: Add Authtoken to ngrok
```powershell
C:\Users\alyha\ngrok\ngrok.exe config add-authtoken YOUR_TOKEN_HERE
```

### Step 4: Restart ngrok
```powershell
C:\Users\alyha\ngrok\ngrok.exe http 3000
```

### Step 5: Update Backend Config
Copy your new ngrok URL and update `backend/src/appsettings.Development.json`:
```json
"ClickPay": {
  "UseProxy": true,
  "ProxyUrl": "https://your-new-ngrok-url.ngrok-free.app"
}
```

### Step 6: Restart Backend
```powershell
cd backend/src
dotnet run
```

## ✅ Verification
After authentication, ngrok will:
- ✅ No longer show the warning page
- ✅ No longer return 308 redirects
- ✅ Forward requests directly to your local server
- ✅ ClickPay webhooks will reach your backend

## Alternative: ngrok Static Domain (Paid)
If you need a permanent URL that doesn't change on restart:
- Upgrade to ngrok Pro: https://ngrok.com/pricing
- Get a static domain
- No need to update config on every restart

## Testing
After authentication, test the webhook:
```powershell
Invoke-WebRequest -Uri "https://your-ngrok-url.ngrok-free.app/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook" -Method POST -ContentType "application/json" -Body '{"test":"data"}'
```

You should get a **400 or 200 response**, NOT a 308 redirect!

