# Hide Shipping Information in ClickPay Payment Page

## Issue
The ClickPay payment page was showing shipping information fields (shipping name, address, city, etc.), but the platform sells **digital training courses** that don't require shipping.

## Solution
Added `hide_shipping: true` parameter to the ClickPay API request to hide shipping-related fields from the payment page.

### Change Made

**File**: `backend/src/Services/ClickPayGateway.cs`

#### Before:
```csharp
var requestData = new
{
    profile_id = profileId,
    tran_type = "sale",
    tran_class = "ecom",
    cart_id = order.Id.ToString(),
    cart_description = $"Order {order.Id}",
    cart_currency = order.Currency ?? "SAR",
    cart_amount = order.Amount.ToString("F2"),
    callback = $"{_configuration["App:BaseUrl"]}/api/payments/clickpay/webhook",
    @return = returnUrl,
    customer_details = new
    {
        name = order.User.FullName,
        email = order.User.Email,
        phone = order.User.PhoneNumber ?? "",
        street1 = "N/A",
        city = "Riyadh",
        state = "SA",
        country = config["MerchantCountryCode"] ?? "SA",
        zip = "00000"
    }
};
```

#### After:
```csharp
var requestData = new
{
    profile_id = profileId,
    tran_type = "sale",
    tran_class = "ecom",
    cart_id = order.Id.ToString(),
    cart_description = $"Training Course Order {order.Id}",  // More descriptive
    cart_currency = order.Currency ?? "SAR",
    cart_amount = order.Amount.ToString("F2"),
    callback = $"{_configuration["App:BaseUrl"]}/api/payments/clickpay/webhook",
    @return = returnUrl,
    hide_shipping = true,  // ✅ Hide shipping for digital products
    customer_details = new
    {
        name = order.User.FullName,
        email = order.User.Email,
        phone = order.User.PhoneNumber ?? "",
        street1 = "N/A",
        city = "Riyadh",
        state = "SA",
        country = config["MerchantCountryCode"] ?? "SA",
        zip = "00000"
    }
};
```

## What This Does

### ClickPay Payment Page Behavior

**Before** (with shipping):
- ✅ Card holder's name
- ✅ Payment details
- ✅ Edit billing info
- ✅ Edit shipping info ← **Showed these fields**
- ✅ Shipping Name
- ✅ Email
- ✅ Shipping Address
- ✅ City, Country, Region, Zip

**After** (without shipping):
- ✅ Card holder's name
- ✅ Payment details
- ✅ Edit billing info
- ❌ ~~Edit shipping info~~ ← **Hidden**
- ❌ ~~Shipping Name~~ ← **Hidden**
- ❌ ~~Email~~ ← **Hidden**
- ❌ ~~Shipping Address~~ ← **Hidden**
- ❌ ~~City, Country, etc~~ ← **Hidden**

Only payment-related fields will be shown, making the checkout process cleaner and more appropriate for digital products.

## Additional Improvements Made

1. **Better Order Description**: Changed from `"Order {order.Id}"` to `"Training Course Order {order.Id}"` for clearer transaction descriptions in payment records.

2. **Code Comment**: Added inline comment explaining why shipping is hidden.

## Why This Matters

### For Digital Products (Training Courses):
- ✅ **Cleaner checkout**: No confusing shipping fields
- ✅ **Better UX**: Faster checkout process
- ✅ **Professional**: Shows this is a digital/service purchase
- ✅ **Reduced errors**: Users can't enter incorrect shipping info

### For Physical Products:
If you ever need to sell physical products (books, materials, etc.), you can:
- Remove the `hide_shipping = true` line
- Or make it conditional based on product type

## Testing

1. **Restart your backend**:
   ```powershell
   cd D:\Data\work\Ersa\backend\src
   dotnet run
   ```

2. **Go through checkout flow**:
   - Add course to cart
   - Go to checkout
   - Click "Proceed to Payment"

3. **Verify ClickPay page**:
   - Should see payment card fields
   - Should see billing info edit option
   - Should **NOT** see shipping info section
   - Should **NOT** see shipping address fields

## Files Modified

| File | Change |
|------|--------|
| `backend/src/Services/ClickPayGateway.cs` | Added `hide_shipping: true` to payment request |

## Alternative: HyperPay Configuration

If you're using HyperPay, similar configuration might be needed. Check `HyperPayGateway.cs` and add equivalent parameters based on HyperPay API documentation.

## Summary

✅ **Shipping fields hidden** from ClickPay payment page  
✅ **Cleaner checkout** for digital training courses  
✅ **Better order description** in payment records  
✅ **Professional user experience**  

The payment page will now only show relevant fields for digital product purchases! 🎉

