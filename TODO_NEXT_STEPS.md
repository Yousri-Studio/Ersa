# Payment Gateway Integration - Next Steps Checklist

## 🎉 Completed ✅

- [x] Multi-gateway architecture implemented
- [x] `IPaymentGateway` interface created
- [x] `HyperPayGateway` implementation
- [x] `ClickPayGateway` implementation  
- [x] `PaymentService` refactored to orchestrate gateways
- [x] Configuration system (`GatewayMethod`) implemented
- [x] Backend API endpoints created
- [x] DTOs updated with payment provider support
- [x] Dependency injection configured
- [x] Frontend API types added
- [x] Comprehensive documentation written
- [x] No linter errors

---

## 📋 TODO: Configuration & Credentials

### Backend Configuration

- [ ] **Add Real ClickPay Credentials**
  - Open: `backend/src/appsettings.json`
  - Update `ClickPay` section:
    - [ ] `ProfileId` - Get from ClickPay merchant dashboard
    - [ ] `ServerKey` - Get from ClickPay merchant dashboard
    - [ ] `WebhookSecret` - Generate and configure in ClickPay

- [ ] **Verify HyperPay Credentials**
  - Check `HyperPay` section is correct
  - Ensure using production URLs if deploying to prod

- [ ] **Set Gateway Configuration**
  ```json
  "PaymentGateway": {
    "GatewayMethod": 0,  // 0=Both, 1=HyperPay, 2=ClickPay
    "DefaultGateway": "HyperPay"
  }
  ```

### Environment Variables (Production)

- [ ] Set up environment variables instead of hardcoding
  ```bash
  PaymentGateway__GatewayMethod=0
  ClickPay__ProfileId=${CLICKPAY_PROFILE_ID}
  ClickPay__ServerKey=${CLICKPAY_SERVER_KEY}
  ClickPay__WebhookSecret=${CLICKPAY_WEBHOOK_SECRET}
  HyperPay__EntityId=${HYPERPAY_ENTITY_ID}
  HyperPay__AccessToken=${HYPERPAY_ACCESS_TOKEN}
  HyperPay__WebhookSecret=${HYPERPAY_WEBHOOK_SECRET}
  ```

---

## 📋 TODO: Frontend Implementation

### Create Payment Selector Component

- [ ] **Create Component: `PaymentGatewaySelector.tsx`**
  ```tsx
  Location: frontend/components/PaymentGatewaySelector.tsx
  
  Features needed:
  - Fetch payment config on mount
  - Display radio buttons if showSelector is true
  - Show gateway logos
  - Handle selection state
  - Pass selected gateway to parent
  ```

- [ ] **Update Checkout Page**
  - File: `frontend/app/[locale]/checkout/page.tsx` (or similar)
  - [ ] Import `PaymentGatewaySelector`
  - [ ] Add state for selected gateway
  - [ ] Pass gateway to checkout API call
  - [ ] Handle loading state
  - [ ] Show error messages

### Example Implementation

```tsx
'use client';

import { useState, useEffect } from 'react';
import { paymentsApi, PaymentConfig } from '@/lib/api';

export default function CheckoutPage() {
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [selectedGateway, setSelectedGateway] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await paymentsApi.getConfig();
        setPaymentConfig(response.data);
        setSelectedGateway(response.data.defaultGateway);
      } catch (error) {
        console.error('Failed to fetch payment config:', error);
      }
    };
    fetchConfig();
  }, []);

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.createCheckout({
        orderId: 'your-order-id',
        returnUrl: `${window.location.origin}/checkout/return`,
        paymentProvider: selectedGateway,
      });
      window.location.href = response.data.redirectUrl;
    } catch (error) {
      console.error('Checkout failed:', error);
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      {paymentConfig?.showSelector && (
        <div className="payment-method-selector">
          <h3>Select Payment Method</h3>
          {paymentConfig.availableGateways.map((gateway) => (
            <label key={gateway} className="gateway-option">
              <input
                type="radio"
                name="gateway"
                value={gateway}
                checked={selectedGateway === gateway}
                onChange={(e) => setSelectedGateway(e.target.value)}
              />
              <span className="gateway-name">{gateway}</span>
              {gateway === 'HyperPay' && <span>💳</span>}
              {gateway === 'ClickPay' && <span>🏦</span>}
            </label>
          ))}
        </div>
      )}
      
      <button onClick={handleCheckout} disabled={loading}>
        {loading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  );
}
```

### Styling

- [ ] Add CSS for payment selector
- [ ] Add gateway logos (HyperPay, ClickPay)
- [ ] Make responsive for mobile
- [ ] Add loading states
- [ ] Add error states

---

## 📋 TODO: Gateway Configuration

### ClickPay Merchant Dashboard

- [ ] **Login to ClickPay Merchant Portal**
  - URL: https://merchant.clickpay.com.sa (or test portal)

- [ ] **Configure Webhook URL**
  - Navigate to Settings → Webhooks
  - Add webhook URL: `https://api.ersa-training.com/api/payments/clickpay/webhook`
  - Save webhook secret in `appsettings.json`

- [ ] **Get API Credentials**
  - Navigate to Settings → API Keys
  - Copy `Profile ID`
  - Copy `Server Key`
  - Save in `appsettings.json`

- [ ] **Test Mode vs Production**
  - Verify if using test or production credentials
  - Update API URL accordingly

### HyperPay Merchant Dashboard

- [ ] **Verify Webhook URL**
  - Login to HyperPay dashboard
  - Check webhook URL: `https://api.ersa-training.com/api/payments/hyperpay/webhook`
  - Verify webhook is active

- [ ] **Verify Credentials**
  - Entity ID is correct
  - Access Token is valid
  - Using correct environment (test/production)

---

## 📋 TODO: Testing

### Unit Tests (Optional but Recommended)

- [ ] **Test `HyperPayGateway`**
  - Test payment initiation
  - Test webhook processing
  - Test refund

- [ ] **Test `ClickPayGateway`**
  - Test payment initiation
  - Test webhook processing
  - Test refund

- [ ] **Test `PaymentService`**
  - Test gateway selection logic
  - Test GetAvailableGateways()
  - Test GetDefaultGateway()

### Integration Tests

- [ ] **Test Configuration Endpoint**
  ```bash
  curl http://localhost:5002/api/payments/config
  ```
  Expected: Returns config based on GatewayMethod

- [ ] **Test HyperPay Checkout**
  ```bash
  curl -X POST http://localhost:5002/api/payments/checkout \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"orderId":"GUID","returnUrl":"http://localhost:3000/return","paymentProvider":"HyperPay"}'
  ```

- [ ] **Test ClickPay Checkout**
  ```bash
  curl -X POST http://localhost:5002/api/payments/checkout \
    -H "Authorization: Bearer TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"orderId":"GUID","returnUrl":"http://localhost:3000/return","paymentProvider":"ClickPay"}'
  ```

- [ ] **Test Webhook Endpoints**
  - Use gateway's test webhook feature
  - Or manually POST test payload

### End-to-End Tests

- [ ] **Test Complete HyperPay Flow**
  1. Create order
  2. Select HyperPay
  3. Complete payment with test card
  4. Verify webhook received
  5. Verify order status updated
  6. Verify enrollment created

- [ ] **Test Complete ClickPay Flow**
  1. Create order
  2. Select ClickPay
  3. Complete payment with test card
  4. Verify webhook received
  5. Verify order status updated
  6. Verify enrollment created

- [ ] **Test Gateway Selection**
  - Set GatewayMethod = 0, verify both shown
  - Set GatewayMethod = 1, verify only HyperPay
  - Set GatewayMethod = 2, verify only ClickPay

- [ ] **Test Refunds**
  - Complete HyperPay payment, then refund
  - Complete ClickPay payment, then refund

---

## 📋 TODO: Deployment

### Staging Environment

- [ ] **Deploy Backend**
  ```bash
  cd backend/src
  dotnet publish -c Release
  # Deploy to staging server
  ```

- [ ] **Deploy Frontend**
  ```bash
  cd frontend
  npm run build
  # Deploy to staging server
  ```

- [ ] **Update Configuration**
  - Set correct API URLs
  - Set correct credentials
  - Set GatewayMethod

- [ ] **Configure Webhooks**
  - Point webhooks to staging URLs
  - Test webhook delivery

### Production Environment

- [ ] **Update appsettings.json**
  - Use production API URLs
  - Use production credentials
  - Use environment variables

- [ ] **Configure Webhooks**
  - HyperPay: `https://api.ersa-training.com/api/payments/hyperpay/webhook`
  - ClickPay: `https://api.ersa-training.com/api/payments/clickpay/webhook`

- [ ] **Deploy Backend**
  - Build and deploy
  - Run migrations if any
  - Verify health checks

- [ ] **Deploy Frontend**
  - Build production bundle
  - Deploy
  - Verify frontend can reach backend

- [ ] **Smoke Tests**
  - [ ] Hit `/api/payments/config` - should return config
  - [ ] Create test order
  - [ ] Try checkout with both gateways
  - [ ] Verify webhooks work
  - [ ] Test refund

---

## 📋 TODO: Monitoring & Maintenance

### Set Up Monitoring

- [ ] **Application Logs**
  - Configure log aggregation (e.g., ELK, Splunk)
  - Set up alerts for payment errors
  - Monitor webhook failures

- [ ] **Database Queries**
  - Set up dashboard for payment metrics
  - Track success rate by gateway
  - Monitor average processing time

- [ ] **Gateway Dashboards**
  - Monitor HyperPay merchant dashboard
  - Monitor ClickPay merchant dashboard
  - Set up alerts for high failure rates

### Create Monitoring Queries

- [ ] **Success Rate Query**
  ```sql
  SELECT 
    Provider,
    COUNT(CASE WHEN Status = 3 THEN 1 END) * 100.0 / COUNT(*) as SuccessRate,
    COUNT(*) as TotalPayments
  FROM Payments
  WHERE CreatedAt > DATEADD(DAY, -30, GETDATE())
  GROUP BY Provider
  ```

- [ ] **Revenue by Gateway**
  ```sql
  SELECT 
    p.Provider,
    SUM(o.Amount) as TotalRevenue,
    COUNT(DISTINCT o.Id) as TotalOrders
  FROM Payments p
  JOIN Orders o ON p.OrderId = o.Id
  WHERE p.Status = 3 AND p.CreatedAt > DATEADD(DAY, -30, GETDATE())
  GROUP BY p.Provider
  ```

### Regular Maintenance

- [ ] **Weekly**
  - Check payment success rates
  - Review error logs
  - Verify webhooks are being received

- [ ] **Monthly**
  - Review gateway performance
  - Compare gateway success rates
  - Analyze user preferences
  - Review refund requests

---

## 📋 TODO: Documentation for Team

- [ ] **Share Documentation**
  - [ ] `MULTI_GATEWAY_PAYMENT_IMPLEMENTATION.md`
  - [ ] `PAYMENT_GATEWAY_QUICK_START.md`
  - [ ] `PAYMENT_GATEWAY_SUMMARY.md`
  - [ ] `PAYMENT_FLOW_DIAGRAM.md`

- [ ] **Team Training**
  - Walk through architecture
  - Explain configuration options
  - Show how to add new gateways
  - Demonstrate testing procedures

- [ ] **Operations Runbook**
  - How to handle payment failures
  - How to process refunds
  - How to switch gateways
  - Emergency contacts for gateway support

---

## 📋 TODO: Future Enhancements

### Short Term

- [ ] Add gateway logos to frontend
- [ ] Improve payment selector UI/UX
- [ ] Add loading animations
- [ ] Add payment method icons
- [ ] Implement retry logic for failed webhooks

### Medium Term

- [ ] Add more payment gateways (Tabby, Tamara)
- [ ] Implement installment payments
- [ ] Add payment analytics dashboard
- [ ] A/B test gateway selection
- [ ] Optimize for mobile payment experience

### Long Term

- [ ] Machine learning for gateway recommendation
- [ ] Automatic gateway failover
- [ ] Multi-currency support
- [ ] Subscription/recurring payments
- [ ] Wallet/saved payment methods

---

## ✅ Quick Start Commands

### Start Backend
```bash
cd backend/src
dotnet restore
dotnet run
```

### Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### Test Configuration Endpoint
```bash
curl http://localhost:5002/api/payments/config
```

### Build for Production
```bash
# Backend
cd backend/src
dotnet publish -c Release -o ./publish

# Frontend
cd frontend
npm run build
```

---

## 📞 Support Resources

### ClickPay Support
- **Documentation:** https://support.clickpay.com.sa
- **Support Email:** support@clickpay.com.sa
- **Test Environment:** Available in merchant dashboard

### HyperPay Support
- **Documentation:** https://wordpresshyperpay.docs.oppwa.com/
- **Support:** Through merchant portal

### Internal Team
- **Developer:** Check documentation files
- **Operations:** See operations runbook (when created)
- **Product:** Review `PAYMENT_GATEWAY_SUMMARY.md`

---

## 🎯 Priority Order

### Immediate (Do First)
1. ✅ Backend implementation (DONE)
2. ✅ Frontend API updates (DONE)
3. ⏳ Add ClickPay credentials to appsettings.json
4. ⏳ Create payment selector UI component
5. ⏳ Test configuration endpoint

### High Priority (Do Soon)
6. ⏳ Test complete payment flows
7. ⏳ Configure webhooks in gateway dashboards
8. ⏳ Deploy to staging
9. ⏳ End-to-end testing

### Medium Priority (Before Production)
10. ⏳ Set up monitoring
11. ⏳ Create operations runbook
12. ⏳ Team training
13. ⏳ Production deployment

### Low Priority (After Launch)
14. ⏳ Optimize UI/UX
15. ⏳ Add analytics
16. ⏳ Consider additional gateways

---

**Last Updated:** October 13, 2025  
**Status:** Implementation Complete - Ready for Configuration & Testing

