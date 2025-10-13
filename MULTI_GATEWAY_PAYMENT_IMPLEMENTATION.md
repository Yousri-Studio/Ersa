# Multi-Gateway Payment System Implementation

## Overview

Successfully implemented a flexible multi-gateway payment system that supports both **HyperPay** and **ClickPay** payment gateways with dynamic configuration.

## Implementation Date
October 13, 2025

---

## Architecture

### Gateway Pattern Implementation

The system uses a **Strategy Pattern** where each payment gateway implements a common `IPaymentGateway` interface:

```
┌─────────────────────────────────────────┐
│         IPaymentGateway                 │
│  - InitiatePaymentAsync()               │
│  - ProcessWebhookAsync()                │
│  - RefundAsync()                        │
└─────────────────────────────────────────┘
            ▲                ▲
            │                │
┌───────────┴──────┐  ┌─────┴──────────┐
│ HyperPayGateway  │  │ ClickPayGateway│
└──────────────────┘  └────────────────┘
            ▲                ▲
            │                │
            └────────┬───────┘
         ┌───────────▼──────────┐
         │   PaymentService     │
         │  (Orchestrator)      │
         └──────────────────────┘
                    ▲
                    │
         ┌──────────▼───────────┐
         │ PaymentsController   │
         └──────────────────────┘
```

---

## Configuration System

### GatewayMethod Configuration

The system uses a `GatewayMethod` setting in `appsettings.json`:

- **0** = Both gateways enabled (users can choose)
- **1** = Only HyperPay enabled
- **2** = Only ClickPay enabled

### Configuration File: `backend/src/appsettings.json`

```json
{
  "PaymentGateway": {
    "GatewayMethod": 0,
    "DefaultGateway": "HyperPay"
  },
  "HyperPay": {
    "ApiUrl": "https://test.oppwa.com",
    "CheckoutUrl": "https://test.oppwa.com/v1/paymentWidgets.js?checkoutId",
    "EntityId": "your-hyperpay-entity-id",
    "AccessToken": "your-hyperpay-access-token",
    "WebhookSecret": "your-hyperpay-webhook-secret"
  },
  "ClickPay": {
    "ApiUrl": "https://secure.clickpay.com.sa",
    "ProfileId": "your-clickpay-profile-id",
    "ServerKey": "your-clickpay-server-key",
    "WebhookSecret": "your-clickpay-webhook-secret",
    "MerchantCountryCode": "SA",
    "Currency": "SAR"
  }
}
```

---

## Backend Implementation

### New Files Created

1. **`backend/src/Services/IPaymentGateway.cs`**
   - Interface defining the contract for all payment gateways
   - Methods: `InitiatePaymentAsync`, `ProcessWebhookAsync`, `RefundAsync`

2. **`backend/src/Services/HyperPayGateway.cs`**
   - HyperPay gateway implementation
   - Extracted from original `PaymentService`
   - Handles HyperPay-specific API calls

3. **`backend/src/Services/ClickPayGateway.cs`**
   - ClickPay gateway implementation
   - Integrates with ClickPay API
   - Supports sale, refund, and webhook processing

### Modified Files

1. **`backend/src/Services/PaymentService.cs`**
   - Refactored to orchestrate multiple gateways
   - Routes requests to appropriate gateway based on configuration
   - Methods:
     - `GetAvailableGateways()` - Returns list of enabled gateways
     - `GetDefaultGateway()` - Returns default gateway based on config
     - `CreateCheckoutUrlAsync()` - Creates payment with selected gateway
     - `ProcessWebhookAsync()` - Routes webhook to correct gateway
     - `RefundPaymentAsync()` - Handles refunds through appropriate gateway

2. **`backend/src/Services/IPaymentService.cs`**
   - Updated interface with provider parameter
   - Added `GetAvailableGateways()` and `GetDefaultGateway()` methods

3. **`backend/src/Controllers/PaymentsController.cs`**
   - Added `GET /api/payments/config` endpoint - Returns payment configuration
   - Updated `POST /api/payments/checkout` - Accepts optional `paymentProvider`
   - Added `POST /api/payments/hyperpay/webhook` - HyperPay webhook endpoint
   - Added `POST /api/payments/clickpay/webhook` - ClickPay webhook endpoint
   - Kept `POST /api/payments/webhook` for backward compatibility

4. **`backend/src/DTOs/OrderDTOs.cs`**
   - Added `PaymentProvider` field to `CheckoutRequest`
   - Created `PaymentConfigResponse` DTO

5. **`backend/src/Program.cs`**
   - Registered both gateway implementations
   - Updated dependency injection

---

## API Endpoints

### Get Payment Configuration
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
```

**Request:**
```json
{
  "orderId": "guid",
  "returnUrl": "https://your-site.com/checkout/return",
  "paymentProvider": "ClickPay"  // Optional: "HyperPay" or "ClickPay"
}
```

**Response:**
```json
{
  "redirectUrl": "https://payment-gateway.com/checkout/xyz"
}
```

### Webhook Endpoints

**HyperPay Webhook:**
```
POST /api/payments/hyperpay/webhook
```

**ClickPay Webhook:**
```
POST /api/payments/clickpay/webhook
```

---

## Frontend Implementation

### Updated Files

**`frontend/lib/api.ts`**

Added payment configuration types and API methods:

```typescript
export interface PaymentConfig {
  gatewayMethod: number;
  availableGateways: string[];
  defaultGateway: string;
  showSelector: boolean;
}

export const paymentsApi = {
  getConfig: (): Promise<AxiosResponse<PaymentConfig>> =>
    api.get('/payments/config'),

  createCheckout: (data: {
    orderId: string;
    returnUrl: string;
    paymentProvider?: string;
  }): Promise<AxiosResponse<{ redirectUrl: string }>> =>
    api.post('/payments/checkout', data),
};
```

---

## Frontend Usage Example

### Fetching Payment Configuration

```typescript
import { paymentsApi } from '@/lib/api';

const CheckoutPage = () => {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>('');

  useEffect(() => {
    const fetchConfig = async () => {
      const response = await paymentsApi.getConfig();
      setPaymentConfig(response.data);
      setSelectedGateway(response.data.defaultGateway);
    };
    fetchConfig();
  }, []);

  return (
    <div>
      {paymentConfig?.showSelector && (
        <div>
          <h3>Select Payment Method</h3>
          {paymentConfig.availableGateways.map((gateway) => (
            <label key={gateway}>
              <input
                type="radio"
                value={gateway}
                checked={selectedGateway === gateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
              />
              {gateway}
            </label>
          ))}
        </div>
      )}
      <button onClick={() => handleCheckout(selectedGateway)}>
        Proceed to Payment
      </button>
    </div>
  );
};

const handleCheckout = async (gateway: string) => {
  const response = await paymentsApi.createCheckout({
    orderId: 'your-order-id',
    returnUrl: window.location.origin + '/checkout/return',
    paymentProvider: gateway,
  });
  window.location.href = response.data.redirectUrl;
};
```

---

## Configuration Scenarios

### Scenario 1: Both Gateways Enabled (GatewayMethod = 0)

```json
"PaymentGateway": {
  "GatewayMethod": 0,
  "DefaultGateway": "HyperPay"
}
```

**Behavior:**
- Frontend shows payment method selector
- Users can choose between HyperPay and ClickPay
- Default selection is HyperPay

### Scenario 2: HyperPay Only (GatewayMethod = 1)

```json
"PaymentGateway": {
  "GatewayMethod": 1,
  "DefaultGateway": "HyperPay"
}
```

**Behavior:**
- Frontend hides payment method selector
- All payments automatically use HyperPay
- API returns `showSelector: false`

### Scenario 3: ClickPay Only (GatewayMethod = 2)

```json
"PaymentGateway": {
  "GatewayMethod": 2,
  "DefaultGateway": "ClickPay"
}
```

**Behavior:**
- Frontend hides payment method selector
- All payments automatically use ClickPay
- API returns `showSelector: false`

---

## Payment Flow

### 1. User Initiates Payment

```
User → Frontend → GET /api/payments/config
                ← Payment Configuration
```

### 2. Frontend Displays Options

```
If showSelector = true:
  Display gateway selection UI
Else:
  Auto-select defaultGateway
```

### 3. Create Checkout

```
User → Frontend → POST /api/payments/checkout
                   { orderId, returnUrl, paymentProvider }
                ← { redirectUrl }
                → Redirect to Payment Gateway
```

### 4. Payment Processing

```
User → Payment Gateway → Completes Payment
                       → Gateway Webhook → POST /api/payments/{provider}/webhook
                                        → Update Order Status
                                        → Create Enrollments
```

### 5. Return to Site

```
Payment Gateway → Redirects User → returnUrl
                                 → Display Success/Failure
```

---

## Database Schema

### Payment Table

The existing `Payment` table already supports multiple providers:

```sql
Payment
  - Id (Guid)
  - OrderId (Guid)
  - Provider (string) -- "HyperPay" or "ClickPay"
  - ProviderRef (string)
  - Status (enum)
  - CapturedAt (DateTime?)
  - RawPayload (string)
  - CreatedAt (DateTime)
  - UpdatedAt (DateTime)
```

---

## ClickPay Integration Details

### API Endpoints Used

**Payment Initiation:**
```
POST https://secure.clickpay.com.sa/payment/request
Authorization: {ServerKey}
```

**Request Payload:**
```json
{
  "profile_id": "xxxxx",
  "tran_type": "sale",
  "tran_class": "ecom",
  "cart_id": "order-guid",
  "cart_description": "Order description",
  "cart_currency": "SAR",
  "cart_amount": "100.00",
  "callback": "https://api.ersa-training.com/api/payments/clickpay/webhook",
  "return": "https://ersa-training.com/checkout/return",
  "customer_details": {
    "name": "Customer Name",
    "email": "customer@email.com",
    "phone": "05xxxxxxxx",
    "street1": "Address",
    "city": "Riyadh",
    "state": "SA",
    "country": "SA",
    "zip": "00000"
  }
}
```

**Response:**
```json
{
  "tran_ref": "TST2200000001",
  "redirect_url": "https://secure.clickpay.com.sa/payment/page/xxxxx"
}
```

### Webhook Format

```json
{
  "cart_id": "order-guid",
  "tran_ref": "TST2200000001",
  "respCode": "00",
  "respMessage": "Approved",
  "cart_amount": "100.00",
  "cart_currency": "SAR"
}
```

**Response Codes:**
- `00` or `000` = Approved
- Other codes = Failed/Declined

---

## Testing Guide

### 1. Test Configuration Endpoint

```bash
curl http://localhost:5002/api/payments/config
```

Expected response based on `GatewayMethod` setting.

### 2. Test Checkout with HyperPay

```bash
curl -X POST http://localhost:5002/api/payments/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "guid",
    "returnUrl": "http://localhost:3000/checkout/return",
    "paymentProvider": "HyperPay"
  }'
```

### 3. Test Checkout with ClickPay

```bash
curl -X POST http://localhost:5002/api/payments/checkout \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "guid",
    "returnUrl": "http://localhost:3000/checkout/return",
    "paymentProvider": "ClickPay"
  }'
```

### 4. Test Webhook (HyperPay)

```bash
curl -X POST http://localhost:5002/api/payments/hyperpay/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: signature-hash" \
  -d '{...webhook payload...}'
```

### 5. Test Webhook (ClickPay)

```bash
curl -X POST http://localhost:5002/api/payments/clickpay/webhook \
  -H "Content-Type: application/json" \
  -H "X-Signature: signature-hash" \
  -d '{...webhook payload...}'
```

---

## Security Features

1. **Webhook Signature Validation**
   - Both gateways validate webhook signatures using HMAC-SHA256
   - Configurable webhook secrets in appsettings.json

2. **Authorization**
   - Checkout endpoint requires authentication
   - User can only create checkout for their own orders

3. **Gateway Validation**
   - Backend validates selected gateway is enabled before processing
   - Prevents unauthorized gateway usage

4. **Provider Isolation**
   - Each gateway has dedicated webhook endpoint
   - Prevents cross-gateway webhook attacks

---

## Error Handling

### Invalid Gateway Selection

If user tries to use a disabled gateway:

```json
{
  "error": "Payment gateway 'ClickPay' is not available. Available gateways: HyperPay"
}
```

### Gateway Not Found

If gateway implementation is missing:

```json
{
  "error": "Payment gateway 'InvalidGateway' not found"
}
```

### Payment Initiation Failed

```json
{
  "error": "Failed to create payment checkout"
}
```

---

## Migration from Old System

### Backward Compatibility

The system maintains backward compatibility:

1. **Old webhook endpoint** (`/api/payments/webhook`) still works
   - Defaults to HyperPay for existing integrations

2. **Checkout without provider** works
   - Uses default gateway from configuration

3. **Existing payments** continue to work
   - `Provider` field already exists in database

### Migration Steps

1. **Update Configuration**
   ```json
   "PaymentGateway": {
     "GatewayMethod": 1,
     "DefaultGateway": "HyperPay"
   }
   ```

2. **Deploy Backend**
   - New gateway implementations are registered
   - Existing HyperPay functionality unchanged

3. **Update Frontend**
   - Add payment config fetch
   - Add gateway selection UI (if GatewayMethod = 0)

4. **Enable Both Gateways**
   ```json
   "PaymentGateway": {
     "GatewayMethod": 0,
     "DefaultGateway": "HyperPay"
   }
   ```

5. **Configure ClickPay**
   - Add ClickPay credentials to appsettings.json
   - Configure webhook URL in ClickPay merchant dashboard

---

## Adding More Gateways

The system is designed to easily add more payment gateways:

### Example: Adding Tabby

1. **Create Gateway Implementation**
   ```csharp
   public class TabbyGateway : IPaymentGateway
   {
       public string ProviderName => "Tabby";
       
       public async Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string returnUrl)
       {
           // Tabby-specific implementation
       }
       
       public async Task<bool> ProcessWebhookAsync(string payload, string signature)
       {
           // Tabby webhook handling
       }
       
       public async Task<bool> RefundAsync(Payment payment, decimal? amount = null)
       {
           // Tabby refund logic
       }
   }
   ```

2. **Register in Program.cs**
   ```csharp
   builder.Services.AddScoped<IPaymentGateway, TabbyGateway>();
   ```

3. **Add Configuration**
   ```json
   "Tabby": {
     "ApiUrl": "https://api.tabby.ai",
     "MerchantCode": "xxx",
     "PublicKey": "xxx",
     "SecretKey": "xxx"
   }
   ```

4. **Update GatewayMethod Logic** (if needed)
   - Extend enum to support more combinations
   - Or use array of enabled gateways

---

## Production Deployment

### Environment Variables

For production, use environment variables instead of hardcoding:

```bash
PaymentGateway__GatewayMethod=0
PaymentGateway__DefaultGateway=HyperPay

HyperPay__ApiUrl=https://oppwa.com
HyperPay__EntityId=${HYPERPAY_ENTITY_ID}
HyperPay__AccessToken=${HYPERPAY_ACCESS_TOKEN}
HyperPay__WebhookSecret=${HYPERPAY_WEBHOOK_SECRET}

ClickPay__ApiUrl=https://secure.clickpay.com.sa
ClickPay__ProfileId=${CLICKPAY_PROFILE_ID}
ClickPay__ServerKey=${CLICKPAY_SERVER_KEY}
ClickPay__WebhookSecret=${CLICKPAY_WEBHOOK_SECRET}
```

### Webhook URLs

Configure these webhook URLs in merchant dashboards:

- **HyperPay:** `https://api.ersa-training.com/api/payments/hyperpay/webhook`
- **ClickPay:** `https://api.ersa-training.com/api/payments/clickpay/webhook`

### Production URLs

Update API URLs for production:

```json
"HyperPay": {
  "ApiUrl": "https://oppwa.com"
},
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa"
}
```

---

## Monitoring & Logging

### Log Levels

All payment operations are logged:

- **Information:** Successful operations
- **Warning:** Invalid requests, signature failures
- **Error:** Exception details, API failures

### Example Log Entries

```
[INF] Payment checkout created for order {OrderId} using {Provider}
[INF] ClickPay payment initiated successfully for order {OrderId}
[INF] HyperPay payment completed for order {OrderId}
[WRN] Invalid ClickPay webhook signature
[ERR] Error processing HyperPay webhook
```

### Monitoring Queries

Track payment success rates:

```sql
SELECT 
  Provider,
  Status,
  COUNT(*) as Count,
  AVG(DATEDIFF(SECOND, CreatedAt, CapturedAt)) as AvgProcessingTime
FROM Payments
WHERE CreatedAt > DATEADD(DAY, -7, GETDATE())
GROUP BY Provider, Status
```

---

## Support & Troubleshooting

### Common Issues

**Issue:** Frontend shows no payment methods  
**Solution:** Check `GatewayMethod` configuration and backend logs

**Issue:** ClickPay webhook not working  
**Solution:** Verify webhook URL in ClickPay dashboard and check signature validation

**Issue:** Payment stuck in pending  
**Solution:** Check webhook logs and gateway status

### Debug Endpoints

For debugging, temporarily enable verbose logging:

```json
"Serilog": {
  "MinimumLevel": {
    "Default": "Debug"
  }
}
```

---

## Success Metrics

✅ **Multi-gateway support implemented**  
✅ **Dynamic configuration system**  
✅ **Frontend API integration complete**  
✅ **Backward compatibility maintained**  
✅ **No breaking changes**  
✅ **Extensible architecture**  
✅ **Comprehensive documentation**  

---

## Next Steps

1. **Configure ClickPay Credentials**
   - Obtain production credentials from ClickPay
   - Update `appsettings.json` with real values

2. **Test in Staging**
   - Test both gateways with test cards
   - Verify webhooks are received correctly

3. **Frontend UI Implementation**
   - Create payment method selector component
   - Add gateway logos and styling
   - Implement loading states

4. **Production Deployment**
   - Deploy backend with new gateway support
   - Update frontend with payment selection
   - Configure webhooks in both gateways

5. **Monitor & Optimize**
   - Track payment success rates per gateway
   - Monitor webhook processing times
   - Optimize user experience based on data

---

## Contact & Support

For questions or issues with this implementation, please contact the development team.

**Implementation completed:** October 13, 2025  
**Version:** 1.0  
**Status:** ✅ Ready for Testing

