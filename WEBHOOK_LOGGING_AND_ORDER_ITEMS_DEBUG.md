# Webhook Logging & Order Items Debug Guide

## Issues

1. **Order Items Not Showing** in admin order detail page (screenshot shows empty "Order Items" table)
2. **ClickPay Webhook Not Completing** - Payment not finishing after gateway redirect
3. **Need Webhook Logs** to diagnose payment completion issues

## Fixes Applied

### 1. Enhanced Webhook Logging ✅

Added comprehensive emoji-based logging to track webhook flow.

**File**: `backend/src/Controllers/PaymentsController.cs`

```csharp
[HttpPost("clickpay/webhook")]
public async Task<IActionResult> ClickPayWebhook()
{
    _logger.LogInformation("🔔 ClickPay webhook received");
    
    var payload = await new StreamReader(Request.Body).ReadToEndAsync();
    var signature = Request.Headers["X-Signature"].FirstOrDefault() ?? "";
    
    _logger.LogInformation("📦 Webhook payload length: {Length}, Has signature: {HasSig}", 
        payload?.Length ?? 0, !string.IsNullOrEmpty(signature));
    _logger.LogInformation("📄 Payload preview: {Payload}", 
        payload?.Length > 500 ? payload.Substring(0, 500) + "..." : payload);

    var success = await _paymentService.ProcessWebhookAsync(payload, signature, "ClickPay");
    
    if (success)
    {
        _logger.LogInformation("✅ ClickPay webhook processed successfully");
        return Ok();
    }
    else
    {
        _logger.LogWarning("⚠️ ClickPay webhook processing returned false");
        return BadRequest();
    }
}
```

**File**: `backend/src/Services/ClickPayGateway.cs`

```csharp
public async Task<bool> ProcessWebhookAsync(string payload, string signature)
{
    _logger.LogInformation("🔍 Processing ClickPay webhook...");
    
    if (!ValidateWebhookSignature(payload, signature))
    {
        _logger.LogWarning("❌ Invalid ClickPay webhook signature");
        return false;
    }
    
    _logger.LogInformation("✅ Webhook signature validated");
    
    var webhookData = JsonSerializer.Deserialize<ClickPayWebhookData>(payload);
    _logger.LogInformation("📋 Webhook data - CartId: {CartId}, RespCode: {RespCode}, TranRef: {TranRef}", 
        webhookData.CartId, webhookData.RespCode, webhookData.TranRef);
    
    _logger.LogInformation("🔍 Looking for order: {OrderId}", orderId);
    // ... rest of processing
}
```

### Webhook Log Messages You'll See:

**Successful Flow:**
```
[INF] 🔔 ClickPay webhook received
[INF] 📦 Webhook payload length: 456, Has signature: True
[INF] 📄 Payload preview: {"cart_id":"e2087d5f-...
[INF] 🔍 Processing ClickPay webhook...
[INF] ✅ Webhook signature validated
[INF] 📋 Webhook data - CartId: e2087d5f-d555-42cf-a0c0-0acc185727d0, RespCode: 00, TranRef: TST2165432
[INF] 🔍 Looking for order: e2087d5f-d555-42cf-a0c0-0acc185727d0
[INF] ✅ ClickPay webhook processed successfully
```

**Failed Flow (examples):**
```
[WRN] ❌ Invalid ClickPay webhook signature
-- OR --
[WRN] ❌ ClickPay webhook data is null after deserialization
-- OR --
[WRN] ❌ Invalid order ID in ClickPay webhook: {CartId}
-- OR --
[WRN] ⚠️ ClickPay webhook processing returned false
```

## Order Items Issue

### The Problem:
The order detail page shows an empty "Order Items" table even though:
- Backend creates OrderItems (we fixed this in `OrdersController.cs`)
- Backend includes OrderItems in the detail endpoint (`GET /api/admin/orders/{id}`)

### Root Causes:

**1. Database Has No OrderItems (Most Likely)**
   - Old orders created before we fixed OrderItems creation won't have items
   - Need to create a NEW order to test

**2. Frontend/Backend Mismatch**
   - Frontend expects: `orderDetail.items[]` with `courseTitleEn`, `courseTitleAr`
   - Backend provides: `AdminOrderItemDto[]` with these exact fields ✅

**3. API Not Being Called**
   - Check Network tab - is `/api/admin/orders/{orderId}` being called?
   - Check response - does `items` array exist and have data?

## Diagnostic Steps

### Step 1: Check if Order Has Items in Database

```sql
-- Check if this order has items
SELECT 
    o.Id AS OrderId,
    o.CreatedAt,
    o.Amount,
    COUNT(oi.Id) AS ItemCount
FROM Orders o
LEFT JOIN OrderItems oi ON o.Id = oi.OrderId
WHERE o.Id = 'e2087d5f-d555-42cf-a0c0-0acc185727d0'
GROUP BY o.Id, o.CreatedAt, o.Amount;

-- If ItemCount = 0, that's the problem!

-- See the actual items
SELECT * FROM OrderItems WHERE OrderId = 'e2087d5f-d555-42cf-a0c0-0acc185727d0';
```

### Step 2: Test with NEW Order

**The orders in your screenshot are all from Oct 17, 04:23-04:36 PM**
These were likely created BEFORE we fixed OrderItems creation!

**Create a NEW order:**
1. Add course to cart
2. Complete checkout
3. Check if THIS new order shows items

### Step 3: Check Backend API Response

**Test the admin order detail endpoint:**

```powershell
$token = "your-admin-jwt-token"
$orderId = "e2087d5f-d555-42cf-a0c0-0acc185727d0"

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/orders/$orderId" `
  -Method GET `
  -Headers @{
    "Authorization" = "Bearer $token"
    "Accept" = "application/json"
  }

$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
```

**Check the response:**
```json
{
  "id": "e2087d5f-...",
  "items": [  // ← Should NOT be empty!
    {
      "id": "...",
      "courseId": "...",
      "courseTitleEn": "Power BI x1",
      "courseTitleAr": "باور بي آي",
      "price": 1700.00,
      "currency": "SAR",
      "qty": 1
    }
  ]
}
```

**If `items` array is empty**, the order has no OrderItems in database.

### Step 4: Check Webhook Reception

**Complete a payment and watch backend console:**

Expected logs when payment completes:
```
[INF] 🔔 ClickPay webhook received
[INF] 📦 Webhook payload length: 456, Has signature: True
[INF] 📄 Payload preview: {"cart_id":"...
```

**If you DON'T see these logs**, ClickPay is not reaching your webhook.

**Common Webhook Issues:**

1. **localhost Not Reachable**
   - ClickPay servers cannot reach `http://localhost:5000`
   - Solution: Use ngrok for testing
   ```bash
   ngrok http 5000
   # Then update App:BaseUrl to https://your-ngrok-url.ngrok.io
   ```

2. **Wrong Webhook URL in ClickPay Dashboard**
   - Check ClickPay dashboard webhook configuration
   - Should be: `https://your-domain.com/api/payments/clickpay/webhook`

3. **Webhook Secret Mismatch**
   - Check `appsettings.json`: `"ClickPay": { "WebhookSecret": "..." }`
   - Must match what's configured in ClickPay dashboard

## Testing Checklist

### ✅ Test Order Items Display:

1. **Restart backend** with new logging:
   ```powershell
   cd D:\Data\work\Ersa\backend\src
   dotnet run
   ```

2. **Create a NEW order**:
   - Add course to cart
   - Complete checkout (don't worry about payment completing for now)
   - Note the Order ID

3. **Check database**:
   ```sql
   SELECT * FROM OrderItems WHERE OrderId = 'new-order-id';
   ```
   Should show rows!

4. **View in admin**:
   - Go to admin orders
   - Click on the NEW order
   - Should see items in "Order Items" section

### ✅ Test Webhook Logging:

1. **Complete a test payment**

2. **Watch backend console** - you should see:
   ```
   🔔 ClickPay webhook received
   📦 Webhook payload length: ...
   📄 Payload preview: ...
   ```

3. **If NO logs appear**:
   - ClickPay is not reaching your webhook
   - Set up ngrok for local testing
   - OR deploy to production/staging with public URL

4. **If logs show errors**:
   - Share the exact error message
   - We can fix signature validation or data parsing issues

## Files Modified

| File | Change |
|------|--------|
| `backend/src/Controllers/PaymentsController.cs` | ✅ Added detailed webhook logging |
| `backend/src/Services/ClickPayGateway.cs` | ✅ Added step-by-step processing logs |

## Quick Fixes for Common Issues

### Issue: Old Orders Have No Items

**Fix**: These orders were created before OrderItems fix. They will always be empty.

**Solution**: Create new orders to test - new orders will have items.

### Issue: Webhook Not Received

**Fix 1 - Use ngrok** (for local testing):
```bash
ngrok http 5000
# Copy the https URL (e.g., https://abc123.ngrok.io)
```

Update `appsettings.json`:
```json
"App": {
  "BaseUrl": "https://abc123.ngrok.io"
}
```

**Fix 2 - Deploy to Production**: Webhooks work in production with real domain.

### Issue: Webhook Signature Invalid

Check `appsettings.json`:
```json
"ClickPay": {
  "WebhookSecret": "get-this-from-clickpay-dashboard"
}
```

## Summary

✅ **Webhook Logging**: Added comprehensive emoji-based logging  
⚠️ **Order Items**: Old orders have no items - test with NEW order  
⚠️ **Webhook Reception**: Check backend logs during payment  
📋 **Next Steps**: 
   1. Restart backend
   2. Create new order
   3. Complete payment and watch logs
   4. Share any error messages you see

The enhanced logging will tell us exactly where the webhook is failing! 🔍

