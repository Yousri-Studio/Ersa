# Payment Gateway Configuration - Quick Start Guide

## 🚀 Quick Configuration

### Step 1: Configure Payment Gateway Settings

Edit `backend/src/appsettings.json`:

```json
{
  "PaymentGateway": {
    "GatewayMethod": 0,  // 0 = Both, 1 = HyperPay only, 2 = ClickPay only
    "DefaultGateway": "HyperPay"
  }
}
```

### Step 2: Add Gateway Credentials

#### HyperPay Configuration
```json
"HyperPay": {
  "ApiUrl": "https://test.oppwa.com",  // Production: https://oppwa.com
  "CheckoutUrl": "https://test.oppwa.com/v1/paymentWidgets.js?checkoutId",
  "EntityId": "your-hyperpay-entity-id",
  "AccessToken": "your-hyperpay-access-token",
  "WebhookSecret": "your-hyperpay-webhook-secret"
}
```

#### ClickPay Configuration
```json
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa",
  "ProfileId": "your-clickpay-profile-id",
  "ServerKey": "your-clickpay-server-key",
  "WebhookSecret": "your-clickpay-webhook-secret",
  "MerchantCountryCode": "SA",
  "Currency": "SAR"
}
```

---

## 📋 Configuration Options

### GatewayMethod Values

| Value | Behavior | Frontend Display |
|-------|----------|------------------|
| **0** | Both gateways enabled | Shows gateway selector |
| **1** | HyperPay only | Auto-selects HyperPay, no selector |
| **2** | ClickPay only | Auto-selects ClickPay, no selector |

---

## 🔧 Frontend Implementation

### 1. Fetch Payment Configuration

```typescript
import { paymentsApi, PaymentConfig } from '@/lib/api';

const [config, setConfig] = useState<PaymentConfig | null>(null);

useEffect(() => {
  const fetchConfig = async () => {
    const response = await paymentsApi.getConfig();
    setConfig(response.data);
  };
  fetchConfig();
}, []);
```

### 2. Conditional Gateway Selection UI

```typescript
{config?.showSelector ? (
  <div className="payment-gateway-selector">
    <h3>Select Payment Method</h3>
    {config.availableGateways.map((gateway) => (
      <label key={gateway}>
        <input
          type="radio"
          name="gateway"
          value={gateway}
          checked={selectedGateway === gateway}
          onChange={(e) => setSelectedGateway(e.target.value)}
        />
        {gateway === 'HyperPay' && <span>💳 HyperPay</span>}
        {gateway === 'ClickPay' && <span>💰 ClickPay</span>}
      </label>
    ))}
  </div>
) : (
  <p>Payment Method: {config?.defaultGateway}</p>
)}
```

### 3. Create Checkout

```typescript
const handleCheckout = async () => {
  try {
    const response = await paymentsApi.createCheckout({
      orderId: orderId,
      returnUrl: `${window.location.origin}/checkout/return`,
      paymentProvider: selectedGateway // or undefined to use default
    });
    
    // Redirect to payment gateway
    window.location.href = response.data.redirectUrl;
  } catch (error) {
    console.error('Checkout failed:', error);
  }
};
```

---

## 🔗 API Endpoints

### Get Configuration
```
GET /api/payments/config
```

**Response:**
```json
{
  "gatewayMethod": 0,
  "availableGateways": ["HyperPay", "ClickPay"],
  "defaultGateway": "HyperPay",
  "showSelector": true
}
```

### Create Checkout
```
POST /api/payments/checkout
Authorization: Bearer {token}

{
  "orderId": "guid",
  "returnUrl": "https://yoursite.com/return",
  "paymentProvider": "ClickPay"  // Optional
}
```

### Webhooks
```
POST /api/payments/hyperpay/webhook  (HyperPay)
POST /api/payments/clickpay/webhook  (ClickPay)
```

---

## 🎯 Common Scenarios

### Scenario 1: Enable Both Gateways (Recommended)

```json
"PaymentGateway": {
  "GatewayMethod": 0,
  "DefaultGateway": "HyperPay"
}
```

**Result:** Users can choose between HyperPay and ClickPay

### Scenario 2: HyperPay Only

```json
"PaymentGateway": {
  "GatewayMethod": 1
}
```

**Result:** All payments use HyperPay automatically

### Scenario 3: ClickPay Only

```json
"PaymentGateway": {
  "GatewayMethod": 2
}
```

**Result:** All payments use ClickPay automatically

### Scenario 4: Testing ClickPay

```json
"PaymentGateway": {
  "GatewayMethod": 0,
  "DefaultGateway": "ClickPay"
}
```

**Result:** Both available, ClickPay selected by default

---

## 🔐 Production Setup

### 1. Update API URLs

```json
"HyperPay": {
  "ApiUrl": "https://oppwa.com",
  "CheckoutUrl": "https://oppwa.com/v1/paymentWidgets.js?checkoutId"
},
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa"
}
```

### 2. Configure Webhooks

Set these URLs in your gateway dashboards:

- **HyperPay:** `https://api.ersa-training.com/api/payments/hyperpay/webhook`
- **ClickPay:** `https://api.ersa-training.com/api/payments/clickpay/webhook`

### 3. Use Environment Variables

```bash
# .env or deployment config
PaymentGateway__GatewayMethod=0
PaymentGateway__DefaultGateway=HyperPay

HyperPay__EntityId=${HYPERPAY_ENTITY_ID}
HyperPay__AccessToken=${HYPERPAY_ACCESS_TOKEN}
HyperPay__WebhookSecret=${HYPERPAY_WEBHOOK_SECRET}

ClickPay__ProfileId=${CLICKPAY_PROFILE_ID}
ClickPay__ServerKey=${CLICKPAY_SERVER_KEY}
ClickPay__WebhookSecret=${CLICKPAY_WEBHOOK_SECRET}
```

---

## ✅ Testing Checklist

### Backend Tests

- [ ] Configuration endpoint returns correct values
- [ ] Checkout with HyperPay succeeds
- [ ] Checkout with ClickPay succeeds
- [ ] HyperPay webhook processed correctly
- [ ] ClickPay webhook processed correctly
- [ ] Invalid gateway selection is rejected
- [ ] Disabled gateway cannot be used

### Frontend Tests

- [ ] Config fetched on page load
- [ ] Gateway selector shows when `GatewayMethod = 0`
- [ ] Gateway selector hidden when `GatewayMethod = 1 or 2`
- [ ] Default gateway pre-selected
- [ ] Checkout redirects to correct gateway
- [ ] Return URL handling works

### End-to-End Tests

- [ ] Complete HyperPay payment flow
- [ ] Complete ClickPay payment flow
- [ ] Webhook updates order status
- [ ] Enrollments created on successful payment
- [ ] Failed payment handled correctly
- [ ] Refund process works

---

## 🐛 Troubleshooting

### Issue: "Payment gateway not found"

**Check:**
1. Gateway is registered in `Program.cs`
2. Configuration exists in `appsettings.json`

### Issue: "Gateway is not available"

**Check:**
1. `GatewayMethod` setting
2. Gateway is enabled for current configuration

### Issue: Webhook not received

**Check:**
1. Webhook URL configured in gateway dashboard
2. Server is publicly accessible
3. Signature validation passes
4. Check server logs for errors

### Issue: Frontend shows no gateways

**Check:**
1. Backend is running
2. `/api/payments/config` endpoint is accessible
3. Browser console for errors
4. Network tab for failed requests

---

## 📊 Monitoring

### Check Payment Status

```sql
SELECT 
  Provider,
  Status,
  COUNT(*) as Total,
  MIN(CreatedAt) as FirstPayment,
  MAX(CreatedAt) as LastPayment
FROM Payments
WHERE CreatedAt > DATEADD(DAY, -7, GETDATE())
GROUP BY Provider, Status
ORDER BY Provider, Status
```

### Success Rate by Gateway

```sql
SELECT 
  Provider,
  CAST(SUM(CASE WHEN Status = 3 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) AS DECIMAL(5,2)) as SuccessRate
FROM Payments
WHERE CreatedAt > DATEADD(DAY, -30, GETDATE())
GROUP BY Provider
```

---

## 📚 Additional Resources

- **Full Documentation:** [MULTI_GATEWAY_PAYMENT_IMPLEMENTATION.md](./MULTI_GATEWAY_PAYMENT_IMPLEMENTATION.md)
- **ClickPay API Docs:** https://support.clickpay.com.sa
- **HyperPay API Docs:** https://wordpresshyperpay.docs.oppwa.com/

---

## 🎉 Summary

✅ Multi-gateway payment system fully implemented  
✅ Easy configuration via `appsettings.json`  
✅ Frontend dynamically adapts to configuration  
✅ Backward compatible with existing HyperPay integration  
✅ Ready for production deployment  

**Need Help?** Check the full documentation or contact the development team.

