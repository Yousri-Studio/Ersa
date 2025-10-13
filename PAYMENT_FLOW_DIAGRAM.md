# Payment Gateway Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (Next.js)                       │
│  ┌────────────────┐         ┌──────────────────┐               │
│  │  Checkout Page │────────▶│ Payment Selector │               │
│  └────────────────┘         └──────────────────┘               │
│         │                            │                           │
│         │ GET /api/payments/config   │                           │
│         └────────────────────────────┘                           │
│                     │                                            │
└─────────────────────┼────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (.NET)                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  PaymentsController                       │  │
│  │  • GET  /api/payments/config                             │  │
│  │  • POST /api/payments/checkout                           │  │
│  │  • POST /api/payments/hyperpay/webhook                   │  │
│  │  • POST /api/payments/clickpay/webhook                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                      │                                           │
│                      ▼                                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  PaymentService                           │  │
│  │  • GetAvailableGateways()                                │  │
│  │  • GetDefaultGateway()                                   │  │
│  │  • CreateCheckoutUrlAsync(provider)                      │  │
│  │  • ProcessWebhookAsync(provider)                         │  │
│  │  • RefundPaymentAsync()                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│              │                              │                    │
│              ▼                              ▼                    │
│  ┌──────────────────────┐      ┌──────────────────────┐        │
│  │  HyperPayGateway     │      │  ClickPayGateway     │        │
│  │  • ProviderName      │      │  • ProviderName      │        │
│  │  • InitiatePayment   │      │  • InitiatePayment   │        │
│  │  • ProcessWebhook    │      │  • ProcessWebhook    │        │
│  │  • RefundAsync       │      │  • RefundAsync       │        │
│  └──────────────────────┘      └──────────────────────┘        │
│              │                              │                    │
└──────────────┼──────────────────────────────┼────────────────────┘
               │                              │
               ▼                              ▼
    ┌──────────────────┐          ┌──────────────────┐
    │  HyperPay API    │          │  ClickPay API    │
    │  oppwa.com       │          │  clickpay.com.sa │
    └──────────────────┘          └──────────────────┘
```

---

## Payment Initiation Flow

### Configuration-Based Flow (GatewayMethod = 0)

```
┌──────────┐
│  User    │
└────┬─────┘
     │ 1. Navigate to Checkout
     ▼
┌────────────────────┐
│  Checkout Page     │
└────┬───────────────┘
     │ 2. Fetch Payment Config
     │ GET /api/payments/config
     ▼
┌────────────────────┐
│ PaymentsController │
└────┬───────────────┘
     │ 3. Query Configuration
     ▼
┌────────────────────┐
│  PaymentService    │
│  GetAvailableGateways()
└────┬───────────────┘
     │ 4. Return Config
     │ { showSelector: true,
     │   availableGateways: ["HyperPay", "ClickPay"] }
     ▼
┌────────────────────┐
│  Checkout Page     │
│  [Shows Selector]  │
│  ○ HyperPay       │
│  ● ClickPay       │
│  [Checkout Button] │
└────┬───────────────┘
     │ 5. User Selects & Clicks Checkout
     │ POST /api/payments/checkout
     │ { orderId, returnUrl, paymentProvider: "ClickPay" }
     ▼
┌────────────────────┐
│ PaymentsController │
└────┬───────────────┘
     │ 6. Validate Order & Gateway
     ▼
┌────────────────────┐
│  PaymentService    │
│  CreateCheckoutUrlAsync()
└────┬───────────────┘
     │ 7. Route to ClickPayGateway
     ▼
┌────────────────────┐
│ ClickPayGateway    │
│ InitiatePaymentAsync()
└────┬───────────────┘
     │ 8. API Call to ClickPay
     │ POST https://secure.clickpay.com.sa/payment/request
     ▼
┌────────────────────┐
│   ClickPay API     │
└────┬───────────────┘
     │ 9. Return Checkout URL
     │ { tran_ref, redirect_url }
     ▼
┌────────────────────┐
│ ClickPayGateway    │
└────┬───────────────┘
     │ 10. Create Payment Record in DB
     ▼
┌────────────────────┐
│   Database         │
│   Payments Table   │
│   Provider: ClickPay
│   Status: Pending  │
└────┬───────────────┘
     │ 11. Return Redirect URL
     ▼
┌────────────────────┐
│  Checkout Page     │
│  window.location.href = redirectUrl
└────┬───────────────┘
     │ 12. Browser Redirects
     ▼
┌────────────────────┐
│ ClickPay Checkout  │
│ [Payment Form]     │
└────────────────────┘
```

---

## Webhook Processing Flow

```
┌────────────────────┐
│  Payment Gateway   │
│  (HyperPay/ClickPay)
└────┬───────────────┘
     │ 1. Payment Completed
     │ POST /api/payments/{provider}/webhook
     │ Headers: X-Signature
     │ Body: { cart_id, tran_ref, respCode, ... }
     ▼
┌────────────────────┐
│ PaymentsController │
│ {Provider}Webhook()│
└────┬───────────────┘
     │ 2. Extract Payload & Signature
     ▼
┌────────────────────┐
│  PaymentService    │
│  ProcessWebhookAsync(provider)
└────┬───────────────┘
     │ 3. Route to Correct Gateway
     ▼
┌────────────────────┐
│  {Provider}Gateway │
│  ProcessWebhookAsync()
└────┬───────────────┘
     │ 4. Validate Signature (HMAC-SHA256)
     ├─── Valid ────┐
     │              │
     ▼              ▼ Invalid
┌────────────────────┐   ┌──────────┐
│ Parse Webhook Data │   │  Return  │
└────┬───────────────┘   │  False   │
     │ 5. Extract Order ID└──────────┘
     ▼
┌────────────────────┐
│  Query Database    │
│  Find Order/Payment│
└────┬───────────────┘
     │ 6. Update Payment Status
     │    respCode "00"/"000" → Completed
     │    Other codes → Failed
     ▼
┌────────────────────┐
│  Database          │
│  UPDATE Payments   │
│  SET Status = ...  │
│      ProviderRef = tran_ref
│      CapturedAt = NOW
└────┬───────────────┘
     │ 7. Update Order Status
     ▼
┌────────────────────┐
│  Database          │
│  UPDATE Orders     │
│  SET Status = Paid │
└────┬───────────────┘
     │ 8. Update Bill (if exists)
     ▼
┌────────────────────┐
│  BillService       │
│  UpdateBillStatusAsync()
└────┬───────────────┘
     │ 9. Create Enrollments
     ▼
┌────────────────────┐
│ EnrollmentService  │
│ CreateEnrollmentsFromOrderAsync()
└────┬───────────────┘
     │ 10. Grant Course Access
     ▼
┌────────────────────┐
│  Database          │
│  INSERT Enrollments│
│  (User gets access)│
└────┬───────────────┘
     │ 11. Return Success
     ▼
┌────────────────────┐
│ Payment Gateway    │
│ [Webhook Acknowledged]
└────────────────────┘
```

---

## Configuration Decision Tree

```
                  ┌─────────────────────┐
                  │  GatewayMethod = ?  │
                  └──────────┬──────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌────────┐          ┌────────┐         ┌────────┐
    │   0    │          │   1    │         │   2    │
    │  Both  │          │HyperPay│         │ClickPay│
    └───┬────┘          └───┬────┘         └───┬────┘
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────────┐ ┌──────────────┐  ┌──────────────┐
│ availableGateways │ │availableGateways│availableGateways
│ = [HyperPay,      │ │= [HyperPay]  │  │= [ClickPay]  │
│    ClickPay]      │ │              │  │              │
│                   │ │              │  │              │
│ showSelector      │ │showSelector  │  │showSelector  │
│ = true            │ │= false       │  │= false       │
│                   │ │              │  │              │
│ Frontend shows    │ │Frontend auto-│  │Frontend auto-│
│ radio buttons for │ │selects       │  │selects       │
│ user to choose    │ │HyperPay      │  │ClickPay      │
└───────────────────┘ └──────────────┘  └──────────────┘
```

---

## Gateway Selection Flow (GatewayMethod = 0)

```
┌──────────────────────────────────────┐
│       Checkout Page                  │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Payment Method                │ │
│  │                                │ │
│  │  ○ HyperPay                    │ │
│  │    [Logo] Visa, Mastercard...  │ │
│  │                                │ │
│  │  ● ClickPay                    │ │
│  │    [Logo] MADA, Visa, Apple Pay│ │
│  │                                │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │      [Proceed to Payment]      │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
         │
         │ User clicks Proceed
         │
         ▼
POST /api/payments/checkout
{
  orderId: "abc-123",
  returnUrl: "https://site.com/return",
  paymentProvider: "ClickPay"  ← Selected gateway
}
         │
         ▼
Backend validates & creates checkout
         │
         ▼
Returns: { redirectUrl: "https://clickpay.com.sa/checkout/xyz" }
         │
         ▼
Browser redirects to ClickPay
```

---

## Gateway Selection Flow (GatewayMethod = 1 or 2)

```
┌──────────────────────────────────────┐
│       Checkout Page                  │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Payment Method: HyperPay      │ │
│  │  [No selector shown]           │ │
│  └────────────────────────────────┘ │
│                                      │
│  ┌────────────────────────────────┐ │
│  │      [Proceed to Payment]      │ │
│  └────────────────────────────────┘ │
└──────────────────────────────────────┘
         │
         │ User clicks Proceed
         │
         ▼
POST /api/payments/checkout
{
  orderId: "abc-123",
  returnUrl: "https://site.com/return"
  // No paymentProvider - uses default
}
         │
         ▼
Backend automatically uses configured gateway
         │
         ▼
Returns checkout URL for that gateway
```

---

## Refund Flow

```
┌──────────────┐
│ Admin/System │
└──────┬───────┘
       │ 1. Initiate Refund
       │ POST /api/payments/{paymentId}/refund
       │ { amount: 100.00 }  // Optional partial refund
       ▼
┌────────────────────┐
│ PaymentsController │
└──────┬─────────────┘
       │ 2. Validate Payment Status
       │    Must be "Completed"
       ▼
┌────────────────────┐
│  PaymentService    │
│  RefundPaymentAsync()
└──────┬─────────────┘
       │ 3. Get Payment from DB
       │    Include Order details
       ▼
┌────────────────────┐
│    Database        │
│    Payments Table  │
│    Provider: ClickPay
│    Status: Completed
└──────┬─────────────┘
       │ 4. Route to Correct Gateway
       ▼
┌────────────────────┐
│  ClickPayGateway   │
│  RefundAsync()     │
└──────┬─────────────┘
       │ 5. Call ClickPay Refund API
       │ POST /payment/request
       │ { tran_type: "refund", tran_ref: "..." }
       ▼
┌────────────────────┐
│   ClickPay API     │
└──────┬─────────────┘
       │ 6. Process Refund
       │    respCode: "00" = Success
       ▼
┌────────────────────┐
│  ClickPayGateway   │
└──────┬─────────────┘
       │ 7. Update Payment Status
       ▼
┌────────────────────┐
│    Database        │
│  UPDATE Payments   │
│  SET Status = Refunded
│  UPDATE Orders     │
│  SET Status = Refunded
└──────┬─────────────┘
       │ 8. Return Success
       ▼
┌────────────────────┐
│ Admin/System       │
│ [Refund Confirmed] │
└────────────────────┘
```

---

## Database Schema

```
┌─────────────────────────────────────┐
│            Orders                   │
├─────────────────────────────────────┤
│ Id (PK)                            │
│ UserId (FK)                        │
│ Amount                             │
│ Currency                           │
│ Status (enum)                      │
│   - New                            │
│   - PendingPayment                 │
│   - Paid ←──────────────────┐     │
│   - UnderProcess             │     │
│   - Processed                │     │
│   - Expired                  │     │
│   - Failed                   │     │
│   - Refunded                 │     │
│ CreatedAt                    │     │
│ UpdatedAt                    │     │
└─────────────────────────────────────┘
         │                      │
         │ 1:N                  │
         ▼                      │
┌─────────────────────────────────────┐
│           Payments                  │
├─────────────────────────────────────┤
│ Id (PK)                            │
│ OrderId (FK)                       │
│ Provider ◄─────────┐              │
│   - "HyperPay"     │              │
│   - "ClickPay"     │  Key Field!  │
│   - "Tabby"        │              │
│   - "Tamara"       │              │
│ ProviderRef        │              │
│ Status (enum) ─────┼──────────────┘
│   - Pending                        │
│   - Processing                     │
│   - Completed                      │
│   - Failed                         │
│   - Cancelled                      │
│   - Refunded                       │
│ CapturedAt                         │
│ RawPayload (JSON)                  │
│ CreatedAt                          │
│ UpdatedAt                          │
└─────────────────────────────────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────┐
│         Enrollments                 │
├─────────────────────────────────────┤
│ Id (PK)                            │
│ UserId (FK)                        │
│ CourseId (FK)                      │
│ OrderId (FK)                       │
│ Status                             │
│ EnrolledAt                         │
└─────────────────────────────────────┘
```

---

## Error Handling Flow

```
                  ┌──────────────────┐
                  │  User Action     │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  API Request     │
                  └────────┬─────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
   ┌──────────┐      ┌──────────┐     ┌──────────┐
   │Validation│      │Gateway   │     │Network   │
   │  Error   │      │  Error   │     │  Error   │
   └────┬─────┘      └────┬─────┘     └────┬─────┘
        │                 │                 │
        │                 │                 │
        ▼                 ▼                 ▼
   ┌────────────────────────────────────────────┐
   │         Exception Middleware               │
   │  • Logs error details                      │
   │  • Returns appropriate HTTP status         │
   │  • Masks sensitive information             │
   └────────┬───────────────────────────────────┘
            │
            ▼
   ┌─────────────────────┐
   │  Error Response     │
   │  {                  │
   │    "error": "msg"   │
   │  }                  │
   └──────────┬──────────┘
              │
              ▼
   ┌─────────────────────┐
   │  Frontend           │
   │  • Display error    │
   │  • Log to console   │
   │  • Allow retry      │
   └─────────────────────┘
```

---

## Monitoring & Logging

```
┌────────────────────────────────────────────────────────┐
│                  Application Logs                      │
└────────────────────────────────────────────────────────┘
         │
         ├─── [INF] Payment checkout created for order {OrderId} using {Provider}
         ├─── [INF] HyperPay payment initiated successfully for order {OrderId}
         ├─── [INF] ClickPay payment completed for order {OrderId}
         ├─── [WRN] Invalid webhook signature from {Provider}
         ├─── [ERR] Error processing {Provider} webhook: {Exception}
         └─── [ERR] Failed to create payment checkout: {Error}

┌────────────────────────────────────────────────────────┐
│                  Database Queries                      │
└────────────────────────────────────────────────────────┘

-- Payment success rate by gateway
SELECT Provider, 
       COUNT(CASE WHEN Status = 3 THEN 1 END) * 100.0 / COUNT(*) as SuccessRate
FROM Payments
WHERE CreatedAt > DATEADD(DAY, -30, GETDATE())
GROUP BY Provider

-- Average processing time
SELECT Provider,
       AVG(DATEDIFF(SECOND, CreatedAt, CapturedAt)) as AvgSeconds
FROM Payments
WHERE Status = 3
GROUP BY Provider

-- Revenue by gateway
SELECT p.Provider,
       COUNT(*) as TotalPayments,
       SUM(o.Amount) as TotalRevenue
FROM Payments p
JOIN Orders o ON p.OrderId = o.Id
WHERE p.Status = 3
GROUP BY p.Provider
```

---

## Summary

This multi-gateway payment system provides:

✅ **Flexibility** - Support multiple payment providers  
✅ **Scalability** - Easy to add more gateways  
✅ **Reliability** - Redundancy through multiple providers  
✅ **Security** - Webhook validation and authorization  
✅ **Monitoring** - Comprehensive logging and metrics  
✅ **User Choice** - Let users select preferred payment method  

For more details, see:
- `MULTI_GATEWAY_PAYMENT_IMPLEMENTATION.md` - Full documentation
- `PAYMENT_GATEWAY_QUICK_START.md` - Quick reference guide
- `PAYMENT_GATEWAY_SUMMARY.md` - Implementation summary

