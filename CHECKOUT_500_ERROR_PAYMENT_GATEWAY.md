# Checkout 500 Error - Payment Gateway Issue

## Issue
After fixing the order status issue, checkout now returns a **500 Internal Server Error** when trying to create a payment checkout.

## Root Cause
The payment gateway (ClickPay) is trying to make an actual API call to the payment provider, which is failing because:

1. **Invalid/Test Credentials**: The `appsettings.json` has test credentials:
   ```json
   "ClickPay": {
     "ApiUrl": "https://secure.clickpay.com.sa",
     "ProfileId": "47223",
     "ServerKey": "SMJNMKH9GH-JLWGMWZRHZ-TWR6WL6DKK",
     "WebhookSecret": "your-clickpay-webhook-secret"
   }
   ```

2. **Missing OrderItems**: Orders were being created without OrderItems (now fixed)

3. **Live API Call**: The system is trying to connect to the actual ClickPay API endpoint

## Fixes Applied

### 1. Added OrderItems Creation
**File**: `backend/src/Controllers/OrdersController.cs`

Orders now properly create OrderItems from cart items:

```csharp
// Create order items from cart items
foreach (var cartItem in cart.Items)
{
    var orderItem = new OrderItem
    {
        Id = Guid.NewGuid(),
        OrderId = order.Id,
        CourseId = cartItem.CourseId,
        SessionId = cartItem.SessionId,
        CourseTitleEn = cartItem.Course.TitleEn,
        CourseTitleAr = cartItem.Course.TitleAr,
        Price = cartItem.Course.Price,
        Currency = cartItem.Course.Currency,
        Qty = cartItem.Qty,
        CreatedAt = DateTime.UtcNow
    };
    _context.OrderItems.Add(orderItem);
}
```

## Solutions for Payment Gateway

### Option 1: Use Valid ClickPay Credentials (Production/Real Testing)

If you have valid ClickPay credentials, update `appsettings.json` or `appsettings.Development.json`:

```json
"ClickPay": {
  "ApiUrl": "https://secure.clickpay.com.sa",
  "ProfileId": "YOUR_PROFILE_ID",
  "ServerKey": "YOUR_SERVER_KEY",
  "WebhookSecret": "YOUR_WEBHOOK_SECRET"
}
```

### Option 2: Use ClickPay Test Environment

ClickPay provides a test/sandbox environment. Update the configuration:

```json
"ClickPay": {
  "ApiUrl": "https://secure-test.clickpay.com.sa",  // Test URL
  "ProfileId": "YOUR_TEST_PROFILE_ID",
  "ServerKey": "YOUR_TEST_SERVER_KEY",
  "WebhookSecret": "test-webhook-secret"
}
```

### Option 3: Use HyperPay Instead (If Available)

Change the default gateway to HyperPay:

```json
"PaymentGateway": {
  "GatewayMethod": 1,  // 1 = HyperPay only
  "DefaultGateway": "HyperPay"
}
```

Then configure HyperPay credentials:

```json
"HyperPay": {
  "ApiUrl": "https://test.oppwa.com",
  "CheckoutUrl": "https://test.oppwa.com/v1/paymentWidgets.js?checkoutId",
  "EntityId": "YOUR_ENTITY_ID",
  "AccessToken": "YOUR_ACCESS_TOKEN",
  "WebhookSecret": "YOUR_WEBHOOK_SECRET"
}
```

### Option 4: Create Mock Payment Gateway for Development (Recommended for Now)

Create a mock/test gateway that doesn't make real API calls.

**Create file**: `backend/src/Services/MockPaymentGateway.cs`

```csharp
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public class MockPaymentGateway : IPaymentGateway
{
    private readonly ILogger<MockPaymentGateway> _logger;
    private readonly IConfiguration _configuration;

    public string ProviderName => "Mock";

    public MockPaymentGateway(ILogger<MockPaymentGateway> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string returnUrl)
    {
        _logger.LogInformation("Mock payment gateway: Creating checkout for order {OrderId}", order.Id);
        
        // Generate a fake checkout URL that redirects back with success
        var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "http://localhost:3000";
        var mockCheckoutUrl = $"{frontendUrl}/en/checkout/mock-payment?orderId={order.Id}&returnUrl={Uri.EscapeDataString(returnUrl)}";
        
        return Task.FromResult(new PaymentInitiationResult
        {
            Success = true,
            CheckoutUrl = mockCheckoutUrl,
            CheckoutId = $"MOCK-{Guid.NewGuid().ToString().Substring(0, 8)}"
        });
    }

    public Task<bool> ProcessWebhookAsync(string payload, string signature)
    {
        _logger.LogInformation("Mock payment gateway: Processing webhook");
        return Task.FromResult(true);
    }

    public Task<bool> RefundAsync(Payment payment, decimal? amount = null)
    {
        _logger.LogInformation("Mock payment gateway: Processing refund for payment {PaymentId}", payment.Id);
        return Task.FromResult(true);
    }
}
```

**Register in `Program.cs`**:

```csharp
// Find the payment gateway registration section and add:
services.AddScoped<IPaymentGateway, MockPaymentGateway>();
```

**Update `appsettings.Development.json`**:

```json
"PaymentGateway": {
  "GatewayMethod": 0,  // 0 = all available
  "DefaultGateway": "Mock"
}
```

## Temporary Workaround: Check Backend Logs

The 500 error should be logged. Check the backend console for the actual error:

```
[ERR] Error creating checkout for order {OrderId}
```

The error message will tell you exactly what failed (network error, authentication error, etc.)

## Files Modified

| File | Change |
|------|--------|
| `backend/src/Controllers/OrdersController.cs` | Added OrderItems creation when creating orders |

## Testing After Fix

1. **Restart backend**:
   ```powershell
   cd D:\Data\work\Ersa\backend\src
   dotnet run
   ```

2. **Watch backend console** for errors when clicking "Proceed to Payment"

3. **Check the actual error message** in backend logs

4. **Based on the error**:
   - If authentication error → Update payment credentials
   - If network error → Check API URL
   - If configuration error → Check appsettings.json

## Next Steps

**Immediate**: Check the backend console/logs to see the exact error from ClickPay

**Short term**: Either:
- Get valid ClickPay test credentials, OR
- Implement the Mock payment gateway for development

**Long term**: 
- Use environment-specific configurations
- Set up proper payment testing environment
- Add payment gateway health checks

## Summary

✅ **OrderItems Issue:** Fixed - orders now properly create order items  
⚠️ **Payment Gateway:** Needs valid credentials or mock implementation  
📋 **Action Required:** Check backend logs for exact error  

The system is now correctly creating orders with items, but needs payment gateway configuration to complete checkout.

