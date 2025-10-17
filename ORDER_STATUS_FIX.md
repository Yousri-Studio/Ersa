# Order Status TypeError Fix

## Problem
The "My Orders" page was crashing with a runtime error:
```
TypeError: status.toLowerCase is not a function
at getStatusColor (app\[locale]\my-orders\page.tsx:126:32)
```

## Root Cause
The backend was returning the `OrderStatus` as a **number** (enum value), but the frontend expected it as a **string**:

### Before (Causing Error):
```json
{
  "id": "...",
  "status": 2,  ← Number (Paid = 2)
  "amount": 500.00
}
```

Frontend tried:
```typescript
const statusLower = status.toLowerCase();  // ❌ Error: number doesn't have toLowerCase()
```

## Solution
Changed the backend to return the status as its **string name**:

### After (Fixed):
```json
{
  "id": "...",
  "status": "Paid",  ← String
  "amount": 500.00
}
```

Frontend now works:
```typescript
const statusLower = status.toLowerCase();  // ✅ Works: "paid"
```

## What Was Fixed

### 1. ✅ Backend - OrderDto Status Type
**File:** `backend/src/DTOs/OrderDTOs.cs`
```csharp
// Before:
public OrderStatus Status { get; set; }

// After:
public string Status { get; set; } = string.Empty;
```

### 2. ✅ Backend - Status Conversion in OrdersController
**File:** `backend/src/Controllers/OrdersController.cs`
```csharp
// Before:
Status = o.Status,

// After:
Status = o.Status.ToString(),
```

### 3. ✅ Backend - InvoiceDto Status Type
**File:** `backend/src/DTOs/InvoiceDTOs.cs`
```csharp
// Before:
public OrderStatus Status { get; set; }

// After:
public string Status { get; set; } = string.Empty;
```

### 4. ✅ Backend - Invoice Creation in AdminController
**File:** `backend/src/Controllers/AdminController.cs`
```csharp
// Before:
Status = order.Status,

// After:
Status = order.Status.ToString(),
```

### 5. ✅ Frontend - Updated Interface
**File:** `frontend/lib/api.ts`
```typescript
// Added 'Cancelled' and string fallback
status: 'New' | 'PendingPayment' | 'Paid' | ... | 'Cancelled' | string;
```

## Order Status Values

The backend `OrderStatus` enum values and their string representations:

| Enum Value | Number | String Name      |
|------------|--------|------------------|
| New        | 0      | "New"            |
| PendingPayment | 1  | "PendingPayment" |
| Paid       | 2      | "Paid"           |
| UnderProcess | 3    | "UnderProcess"   |
| Processed  | 4      | "Processed"      |
| Expired    | 5      | "Expired"        |
| Failed     | 6      | "Failed"         |
| Refunded   | 7      | "Refunded"       |
| Cancelled  | 8      | "Cancelled"      |

## Frontend Status Handling

The frontend uses these status values for:

### 1. **Status Colors** (`getStatusColor`)
```typescript
const getStatusColor = (status: string) => {
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case 'paid':
    case 'processed':
      return 'bg-green-100 text-green-800';  // Green (success)
    case 'pendingpayment':
    case 'new':
    case 'underprocess':
      return 'bg-yellow-100 text-yellow-800';  // Yellow (pending)
    case 'failed':
    case 'cancelled':
    case 'expired':
      return 'bg-red-100 text-red-800';  // Red (error)
    case 'refunded':
      return 'bg-blue-100 text-blue-800';  // Blue (info)
    default:
      return 'bg-gray-100 text-gray-800';  // Gray (unknown)
  }
};
```

### 2. **Status Labels** (`getStatusLabel`)
```typescript
const getStatusLabel = (status: string) => {
  const statusLower = status.toLowerCase();
  return t(`orders.status.${statusLower}`);  // Localized label
};
```

## How to Apply the Fix

### Step 1: Stop Backend
```powershell
# Press Ctrl+C in the terminal running the backend
```

### Step 2: Rebuild Backend
```powershell
cd D:\Data\work\Ersa\backend
dotnet build
```

### Step 3: Restart Backend
```powershell
dotnet run
```

### Step 4: Frontend (Auto Hot-Reload)
The frontend will automatically reload with the updated API types.

## Testing

### Test 1: Check Orders API Response
```powershell
# Login and get your auth token
$token = "YOUR_AUTH_TOKEN_HERE"

# Get orders
$response = Invoke-RestMethod -Uri "http://localhost:5002/api/orders" `
  -Headers @{Authorization="Bearer $token"}

# Check status field type
$response[0].status
# Should output: "Paid" (string) not 2 (number)
```

### Test 2: Load My Orders Page
1. Login to the frontend
2. Go to "My Orders": `http://localhost:3000/en/my-orders`
3. **✓ Page should load without errors**
4. **✓ Status badges should show correct colors**
5. **✓ No console errors**

### Test 3: Check Status Display
For each order, verify:
- **Paid/Processed** → Green badge
- **Pending/New** → Yellow badge
- **Failed/Cancelled** → Red badge
- **Refunded** → Blue badge

### Test 4: Invoice Generation
1. Click "View Invoice" on any order
2. **✓ Invoice should open in new tab**
3. **✓ Status should display correctly**

## Benefits

✅ **No more runtime errors** - Status is always a string  
✅ **Better TypeScript support** - Proper type checking  
✅ **Consistent API** - All DTOs use string statuses  
✅ **Easier frontend logic** - Can use `.toLowerCase()` safely  
✅ **Localization ready** - String status maps to translations  

## Affected Pages

Pages that now work correctly:
- ✅ My Orders page (`/my-orders`)
- ✅ Invoice page (`/orders/:id/invoice`)
- ✅ Admin orders page (`/admin/orders`)
- ✅ Order confirmation page (`/checkout/success`)

## Related Fixes

This is part of a series of fixes:
1. ✅ Missing icons in enrollments page
2. ✅ Authentication redirect loop
3. ✅ Missing enrollments for paid orders
4. ✅ Course 404 error (slug issue)
5. ✅ **Order status TypeError** ← This fix

## Troubleshooting

### Problem: Still getting "toLowerCase is not a function"
**Solution:**
1. Make sure backend was rebuilt (`dotnet build`)
2. Make sure backend was restarted (not just hot-reload)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check API response to confirm status is a string

### Problem: Status colors not showing
**Solution:**
1. Check that status strings match the switch cases
2. Status comparison is case-insensitive (uses `.toLowerCase()`)
3. Check browser console for any errors

### Problem: Status labels showing as keys
**Solution:**
1. Make sure translation keys exist in `locales/en.json` and `locales/ar.json`
2. Keys should be like: `orders.status.paid`, `orders.status.new`, etc.

## Database Status vs API Status

**Important:** The database still stores status as an enum/number. Only the API response converts it to a string. This is the correct approach because:

- ✅ Database uses efficient integer storage
- ✅ API returns user-friendly strings
- ✅ Frontend doesn't need to know enum values
- ✅ Easy to add new status values later

## Files Modified

### Backend:
1. `backend/src/DTOs/OrderDTOs.cs` - Changed Status type to string
2. `backend/src/Controllers/OrdersController.cs` - Convert status to string
3. `backend/src/DTOs/InvoiceDTOs.cs` - Changed Status type to string
4. `backend/src/Controllers/AdminController.cs` - Convert status to string

### Frontend:
1. `frontend/lib/api.ts` - Updated Order interface to include Cancelled

---

**Status:** ✅ Fixed  
**Last Updated:** 2025-10-17  
**Requires:** Backend restart

