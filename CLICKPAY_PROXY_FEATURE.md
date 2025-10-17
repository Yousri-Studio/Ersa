# ClickPay Proxy Configuration

## Overview
The backend API now supports routing ClickPay payment requests through a proxy server (like ngrok) for local development and webhook testing.

## Configuration

### Production (`appsettings.json`)
```json
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa",
  "ProfileId": "47223",
  "ServerKey": "SMJNMKH9GH-JLWGMWZRHZ-TWR6WL6DKK",
  "WebhookSecret": "your-clickpay-webhook-secret",
  "MerchantCountryCode": "SA",
  "Currency": "SAR",
  "UseProxy": false,
  "ProxyUrl": "https://your-ngrok-url.ngrok-free.app"
}
```

### Development (`appsettings.Development.json`)
```json
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa",
  "ProfileId": "47223",
  "ServerKey": "SMJNMKH9GH-JLWGMWZRHZ-TWR6WL6DKK",
  "WebhookSecret": "your-clickpay-webhook-secret",
  "MerchantCountryCode": "SA",
  "Currency": "SAR",
  "UseProxy": true,
  "ProxyUrl": "https://your-ngrok-url.ngrok-free.app"
}
```

## Settings Explained

### `UseProxy` (boolean)
- **`false`**: Uses the direct ClickPay API URL (`ApiUrl`)
- **`true`**: Routes all ClickPay requests through the `ProxyUrl`

### `ProxyUrl` (string)
- The public URL of your ngrok tunnel or proxy server
- Only used when `UseProxy` is `true`
- Example: `https://abc123.ngrok-free.app`

## How It Works

When `UseProxy` is enabled, the `ClickPayGateway` service will:

1. **Webhook URL**: Build webhook callback URL using the proxy format: `{ProxyUrl}/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook`
2. **Payment API**: Still sends payment requests to ClickPay API directly (`ApiUrl`)
3. **Logging**: Log which webhook URL is being used for debugging

### Code Implementation
```csharp
var config = _configuration.GetSection("ClickPay");
var useProxy = config.GetValue<bool>("UseProxy");

// Build webhook callback URL - use proxy format if UseProxy is enabled
var webhookUrl = useProxy
    ? $"{config["ProxyUrl"]}/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook"
    : $"{_configuration["App:BaseUrl"]}/api/payments/clickpay/webhook";

_logger.LogInformation("🔗 ClickPay webhook URL: {WebhookUrl}", webhookUrl);
```

## Use Cases

### 1. Local Development with ngrok
**Problem**: ClickPay webhooks cannot reach `localhost:5002`

**Solution**:
1. Start ngrok: `ngrok http 3000` (for your Next.js frontend)
2. Get your ngrok URL: `https://abc123.ngrok-free.app`
3. Update `appsettings.Development.json`:
   ```json
   "ClickPay": {
     "UseProxy": true,
     "ProxyUrl": "https://abc123.ngrok-free.app"
   },
   "App": {
     "BaseUrl": "http://localhost:5002"
   },
   "Frontend": {
     "BaseUrl": "https://abc123.ngrok-free.app"
   }
   ```

**Result**: Webhook URL will automatically be: `https://abc123.ngrok-free.app/api/proxy?endpoint=%2Fpayments%2Fclickpay%2Fwebhook`

### 2. Production Environment
**Setup**:
```json
"UseProxy": false,
"ProxyUrl": "https://your-ngrok-url.ngrok-free.app"
```

The system will use the direct ClickPay API URL for better performance and reliability.

## Testing

### Verify Proxy is Working
1. Set `UseProxy: true` in your config
2. Start your backend
3. Check logs when initiating a payment:
   ```
   🔧 ClickPay InitiatePayment - UseProxy: True, ApiUrl: https://abc123.ngrok-free.app
   ```

### Verify Direct Connection
1. Set `UseProxy: false` in your config
2. Start your backend
3. Check logs when initiating a payment:
   ```
   🔧 ClickPay InitiatePayment - UseProxy: False, ApiUrl: https://secure.clickpay.com.sa
   ```

## Benefits

✅ **Local Testing**: Test webhooks on localhost using ngrok
✅ **Flexible Routing**: Switch between direct and proxy connections easily
✅ **Environment-Specific**: Different configs for dev/staging/production
✅ **Debug Logging**: Know exactly which URL is being used
✅ **No Code Changes**: Toggle proxy via configuration only

## Important Notes

⚠️ **Security**: Keep `UseProxy: false` in production unless specifically needed
⚠️ **Performance**: Proxy adds latency; use direct connection when possible
⚠️ **ngrok URLs**: ngrok free URLs change on restart; update config accordingly
⚠️ **Webhook URLs**: Remember to update ClickPay dashboard when changing URLs

## Troubleshooting

### Payments not going through
- Check logs for the actual URL being used
- Verify `UseProxy` setting matches your intent
- Ensure `ProxyUrl` is correct and accessible

### Webhooks not received
- Verify ClickPay dashboard webhook URL matches your proxy URL
- Check ngrok web interface at `http://127.0.0.1:4040` for incoming requests
- Ensure backend is running and accessible through the proxy

### Proxy URL changes
- Update `ProxyUrl` in `appsettings.Development.json`
- Update webhook URL in ClickPay dashboard
- Restart backend application

