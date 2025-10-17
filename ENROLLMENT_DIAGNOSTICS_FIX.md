# Enrollment Diagnostics & Fix Guide

## Issue Summary
Users who have paid for courses are not seeing them in their enrollments page because enrollments weren't automatically created for some paid orders.

## What Was Fixed

### 1. Frontend Icon Issues
- ✅ Fixed missing `academic-cap` icon (changed to `graduation-cap`)
- ✅ Added missing `refresh` and `receipt` icons to the Icon component

### 2. Backend Diagnostic Tools (NEW)
Two new admin endpoints were added to help diagnose and fix enrollment issues:

#### A. Get Enrollment Diagnostics
**Endpoint:** `GET /api/admin/enrollment-diagnostics`

**Purpose:** Provides a comprehensive view of orders and enrollments in the system

**Response:**
```json
{
  "totalOrders": 100,
  "paidOrders": 50,
  "totalEnrollments": 45,
  "paidOrdersWithoutEnrollments": 5,
  "affectedOrders": [
    {
      "id": "order-guid",
      "userId": "user-guid",
      "amount": 500.00,
      "status": "Paid",
      "createdAt": "2025-01-01T00:00:00Z",
      "itemCount": 2
    }
  ]
}
```

#### B. Fix Missing Enrollments
**Endpoint:** `POST /api/admin/fix-missing-enrollments`

**Purpose:** Automatically creates enrollments for all paid orders that don't have them

**Response:**
```json
{
  "message": "Enrollment creation completed",
  "ordersProcessed": 5,
  "enrollmentsCreated": 10,
  "errors": 0
}
```

## How to Fix Missing Enrollments

### Option 1: Using PowerShell Script (Easiest)

1. Make sure your backend is running (`dotnet run` in the backend folder)

2. Get your admin JWT token:
   - Login to the admin panel
   - Open browser dev tools (F12)
   - Go to Application/Storage > Cookies
   - Copy the value of `auth-token`

3. Run the PowerShell script:
   ```powershell
   cd D:\Data\work\Ersa
   .\fix-enrollments.ps1
   ```

4. When prompted, paste your admin token

5. The script will:
   - Show diagnostic information
   - List all paid orders without enrollments
   - Ask if you want to fix them
   - Create the missing enrollments

### Option 2: Using curl/Postman

1. **Check Diagnostics:**
   ```bash
   curl -X GET "http://localhost:5002/api/admin/enrollment-diagnostics" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

2. **Fix Missing Enrollments:**
   ```bash
   curl -X POST "http://localhost:5002/api/admin/fix-missing-enrollments" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

### Option 3: Using Swagger UI

1. Navigate to `http://localhost:5002/swagger`
2. Click "Authorize" and enter your admin token
3. Find the Admin endpoints:
   - `GET /api/admin/enrollment-diagnostics`
   - `POST /api/admin/fix-missing-enrollments`
4. Execute them in order

## What the Fix Does

When you run the fix, the system will:

1. Find all orders with status = `Paid` that don't have enrollments
2. For each order:
   - Create an enrollment for each course in the order
   - Set the enrollment status to `Paid`
   - Send welcome emails (for Live courses) or deliver materials (for PDF courses)
3. Return a summary of what was created

## Understanding the Enrollment Flow

### Normal Flow (when payment webhook works):
```
User Pays → Payment Gateway → Webhook → Order Status = Paid → Enrollments Created Automatically
```

### What Happens If Webhook Fails:
```
User Pays → Payment Gateway → ❌ Webhook Failed → Order Status = Paid → ❌ No Enrollments Created
```

### How the Fix Helps:
```
Admin Runs Fix → Checks All Paid Orders → Creates Missing Enrollments → Users Can See Their Courses
```

## Verifying the Fix

After running the fix:

1. **Check the backend logs** for messages like:
   ```
   Created 2 enrollments for order {OrderId}
   ```

2. **Check the diagnostics endpoint again** - it should show:
   ```json
   {
     "paidOrdersWithoutEnrollments": 0
   }
   ```

3. **Have the user refresh their enrollments page** at:
   ```
   http://localhost:3000/en/profile/enrollments
   ```

4. They should now see all their purchased courses

## Preventing Future Issues

To prevent this issue from happening again:

1. **Ensure webhook URLs are properly configured**:
   - HyperPay webhook: Check your HyperPay dashboard
   - ClickPay webhook: Check your ClickPay dashboard

2. **Monitor webhook logs** in the backend console

3. **Run diagnostics periodically**:
   ```bash
   # Add to a daily cron job or scheduled task
   curl -X GET "http://localhost:5002/api/admin/enrollment-diagnostics" \
     -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
   ```

## Files Modified

- `frontend/app/[locale]/profile/enrollments/page.tsx` - Fixed icon names
- `frontend/components/ui/icon.tsx` - Added missing icons
- `backend/src/Controllers/AdminController.cs` - Added diagnostic and fix endpoints

## Testing the User Experience

After fixing the enrollments:

1. Login as the affected user
2. Navigate to "My Enrollments"
3. You should see all purchased courses
4. Each course card should show:
   - Course thumbnail or graduation cap icon
   - Course title
   - Enrollment date
   - "Start Course" button
   - Progress (if applicable)

## Troubleshooting

### "No enrollments found" after running fix
- Check that orders have status = `Paid` (not `PendingPayment`)
- Check backend logs for errors during enrollment creation
- Verify the user ID matches between orders and the logged-in user

### "Unauthorized" error when calling admin endpoints
- Ensure your auth token is from an admin account
- Check that the token hasn't expired (default: 7 days)
- Login to admin panel again to get a fresh token

### Enrollments created but emails not sent
- Check SendGrid configuration in `appsettings.json`
- Check backend logs for email sending errors
- Emails are sent asynchronously, so check the `EmailLogs` table in the database

## Need Help?

If you encounter any issues:

1. Check the backend console for error logs
2. Check the browser console for frontend errors
3. Run the diagnostics endpoint to see the current state
4. Check the database directly:
   ```sql
   SELECT * FROM Orders WHERE UserId = 'user-guid';
   SELECT * FROM Enrollments WHERE UserId = 'user-guid';
   ```

