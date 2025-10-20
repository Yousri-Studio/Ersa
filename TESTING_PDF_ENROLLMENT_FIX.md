# Testing Guide: PDF Course Manual Fulfillment Fix

## Overview
This guide provides step-by-step testing instructions to verify that PDF course enrollments are no longer automatically fulfilled and require manual admin action.

## Pre-Testing Checklist

### 1. Ensure Backend is Running
```bash
cd backend/src
dotnet run
```

### 2. Ensure Frontend is Running
```bash
cd frontend
npm run dev
```

### 3. Test Data Requirements
- At least one PDF course with attachments in the database
- At least one test user account
- Payment gateway configured (ClickPay or PayTabs)

## Test Case 1: New Order with PDF Course - Verify No Auto-Delivery

### Objective
Confirm that purchasing a PDF course does NOT automatically create secure links or send materials.

### Steps

1. **Customer Flow:**
   - Login as a test customer
   - Browse to a PDF course
   - Add to cart
   - Proceed to checkout
   - Complete payment (use test payment gateway)

2. **Verify Payment Success:**
   - Check order confirmation page shows success
   - Note the Order ID

3. **Check Database (Before Admin Action):**
   ```sql
   -- Check enrollment status
   SELECT Id, UserId, CourseId, Status, EnrolledAt 
   FROM Enrollments 
   WHERE OrderId = 'YOUR-ORDER-ID';
   -- Expected: Status = 2 (Paid)
   
   -- Check secure links (should be NONE)
   SELECT COUNT(*) 
   FROM SecureLinks 
   WHERE EnrollmentId = 'YOUR-ENROLLMENT-ID';
   -- Expected: 0 rows
   ```

4. **Check Email Inbox:**
   - Customer should receive order confirmation
   - Customer should **NOT** receive materials delivery email
   - ✅ **PASS if no materials email sent**

5. **Check Backend Logs:**
   - Look for: "PDF course enrollment {EnrollmentId} created for course {CourseId}. Awaiting admin fulfillment."
   - Should **NOT** see: "Secure links created" or "Materials delivered"

### Expected Results
- ✅ Enrollment created with status `Paid`
- ✅ Order status is `Paid`
- ✅ NO secure links created
- ✅ NO materials delivery email sent
- ✅ Log message confirms awaiting admin fulfillment

## Test Case 2: Admin Manual Fulfillment

### Objective
Verify that admin can manually select attachments and fulfill the order.

### Steps

1. **Login to Admin Dashboard:**
   - Navigate to `/admin/login`
   - Login with admin credentials

2. **Navigate to Order:**
   - Go to Orders page
   - Find the order from Test Case 1
   - Order should show status "Paid"
   - Click on the order to view details

3. **Review Enrollment Card:**
   - Should see "Order Fulfillment" section
   - Should see enrollment for PDF course
   - Enrollment status badge should show "Paid" (blue)
   - Should see "Select Course Materials" section
   - Should see list of available attachments with checkboxes

4. **Select Attachments:**
   - Check 2 out of 3 attachments (simulate selective delivery)
   - Ensure "Send email notification" checkbox is checked
   - Click "Generate & Send Secure Links" button

5. **Wait for Processing:**
   - Button should show "Processing..." briefly
   - Should see success toast notification
   - Enrollment card should refresh

6. **Verify UI Updates:**
   - Enrollment status badge should now show "Completed" (green)
   - Should see "Materials Delivered" section (green background)
   - Should list the 2 attachments that were selected
   - Should show creation timestamp
   - Should NOT show the 3rd unselected attachment

7. **Verify Order Status:**
   - Order status at top should now show "Processed"
   - (If order has multiple courses, only changes to Processed when ALL are completed)

### Expected Results
- ✅ Admin can see all course attachments
- ✅ Admin can select specific attachments
- ✅ Secure links created only for selected attachments
- ✅ Email sent to customer
- ✅ Enrollment status changed to `Completed`
- ✅ Order status changed to `Processed`

## Test Case 3: Customer Receives Materials

### Objective
Verify that customer receives email with secure download links for selected materials only.

### Steps

1. **Check Customer Email:**
   - Open customer's email inbox
   - Should see "Course Materials - [Course Name]" email
   - Email should be in customer's preferred locale (Arabic or English)

2. **Verify Email Content:**
   - Should show course title
   - Should list 2 download links (the ones admin selected)
   - Should **NOT** show the 3rd unselected attachment
   - Links should be in format: `https://yourdomain.com/api/secure-download/{token}`

3. **Test Download Link:**
   - Click on one of the secure download links
   - Should download the PDF file
   - Verify it's the correct attachment

4. **Check Database:**
   ```sql
   -- Check secure links created
   SELECT sl.Id, sl.Token, a.FileName, sl.DownloadCount, sl.IsRevoked
   FROM SecureLinks sl
   JOIN Attachments a ON sl.AttachmentId = a.Id
   WHERE sl.EnrollmentId = 'YOUR-ENROLLMENT-ID';
   -- Expected: 2 rows (only selected attachments)
   
   -- Check download count incremented
   -- After clicking link, DownloadCount should increase
   ```

### Expected Results
- ✅ Email received with localized content
- ✅ Only selected attachments included
- ✅ Secure links work correctly
- ✅ Files download successfully
- ✅ Download count tracked in database

## Test Case 4: Multiple PDF Courses in One Order

### Objective
Verify that each PDF course enrollment is fulfilled independently.

### Steps

1. **Create Order with 2 PDF Courses:**
   - Add 2 different PDF courses to cart
   - Checkout and complete payment

2. **Verify Initial State:**
   - Both enrollments should have status `Paid`
   - No secure links for either enrollment
   - Order status is `Paid`

3. **Fulfill First Enrollment Only:**
   - Admin selects attachments for Course 1
   - Clicks "Generate & Send Secure Links"
   - Enrollment 1 status → `Completed`
   - Order status should **REMAIN** `Paid` (not all enrollments completed)

4. **Verify Partial Fulfillment:**
   - Customer receives email for Course 1 only
   - Enrollment 2 still shows as `Paid` with attachment selection UI
   - Order shows 1 of 2 enrollments completed

5. **Fulfill Second Enrollment:**
   - Admin selects attachments for Course 2
   - Clicks "Generate & Send Secure Links"
   - Enrollment 2 status → `Completed`
   - Order status should NOW change to `Processed`

### Expected Results
- ✅ Each enrollment fulfilled independently
- ✅ Order status updates only when all enrollments completed
- ✅ Customer receives separate emails for each course
- ✅ Admin has full control over each enrollment

## Test Case 5: Mixed Order (PDF + Live Courses)

### Objective
Verify that PDF and Live courses have different fulfillment workflows.

### Steps

1. **Create Order with PDF + Live Course:**
   - Add 1 PDF course and 1 Live course to cart
   - Checkout and complete payment

2. **Verify Initial State:**
   - PDF enrollment: status `Paid`, shows attachment selection UI
   - Live enrollment: status `Notified`, shows session creation UI
   - Customer should receive initial email for Live course automatically

3. **Fulfill PDF Course:**
   - Admin selects attachments and creates secure links
   - PDF enrollment status → `Completed`

4. **Create Live Session:**
   - Admin clicks "Add New Session" for Live enrollment
   - Fills in session details (title, date, Teams link)
   - Clicks "Create Session & Notify"
   - Customer receives session notification email

5. **Complete Live Enrollment:**
   - Admin clicks "Mark Course as Completed"
   - Live enrollment status → `Completed`

6. **Verify Order Completion:**
   - Order status should now be `Processed` (all enrollments completed)

### Expected Results
- ✅ PDF course requires manual attachment selection
- ✅ Live course sends initial email automatically
- ✅ Live course requires manual session creation
- ✅ Different workflows for different course types
- ✅ Order completes when both fulfilled

## Test Case 6: Edge Cases

### 6.1 No Attachments on Course

**Steps:**
1. Create a PDF course with no attachments
2. Customer purchases course
3. Admin views order

**Expected:**
- Shows warning: "No attachments found for this course. Please add attachments to the course first."
- No action possible until attachments added

### 6.2 All Attachments Revoked

**Steps:**
1. Create PDF course with attachments
2. Revoke all attachments
3. Customer purchases course
4. Admin views order

**Expected:**
- Shows available attachments but they're marked as revoked
- Admin can't select revoked attachments
- Or shows warning if all are revoked

### 6.3 Email Send Failure

**Steps:**
1. Disable SendGrid or use invalid API key
2. Admin fulfills enrollment with "Send email" checked

**Expected:**
- Secure links still created successfully
- Enrollment still marked as completed
- Error logged but doesn't block fulfillment
- Admin sees error toast notification

### 6.4 Enrollment Already Fulfilled

**Steps:**
1. Admin fulfills an enrollment
2. Admin tries to fulfill same enrollment again

**Expected:**
- Shows "Materials Delivered" section (green)
- No attachment selection UI
- Cannot create duplicate links
- (Or if links recreated, uses existing links)

## Test Case 7: Rollback Scenario

### Objective
Verify system behavior if we need to rollback the change.

**Note:** This is only for testing rollback procedure, not for production.

### Steps

1. **Restore Old Code:**
   ```csharp
   else if (course.Type == CourseType.PDF)
   {
       var attachments = await _context.Attachments
           .Where(a => a.CourseId == course.Id && !a.IsRevoked)
           .Select(a => a.Id)
           .ToListAsync();

       if (attachments.Any())
       {
           await DeliverMaterialsAsync(enrollment.Id, attachments);
       }
   }
   ```

2. **Test Order:**
   - Create new order with PDF course
   - Complete payment

3. **Verify Auto-Delivery Works Again:**
   - All attachments delivered automatically
   - Email sent automatically
   - Enrollment status → `Notified`
   - Admin sees "Materials Delivered" section immediately

## Backend Logging Verification

### Key Log Messages to Look For

#### ✅ Correct Behavior (After Fix)
```
INFO: PDF course enrollment {EnrollmentId} created for course {CourseId}. Awaiting admin fulfillment.
INFO: Created {Count} secure links for enrollment {EnrollmentId}
INFO: All enrollments completed, marking order {OrderId} as processed
```

#### ❌ Incorrect Behavior (Before Fix)
```
INFO: Delivering materials for enrollment {EnrollmentId}
INFO: Secure links created automatically
ERROR: Should NOT see automatic delivery
```

## Database Verification Queries

### Check Enrollment Status Flow
```sql
-- View enrollment status history (if you have audit table)
SELECT EnrollmentId, Status, ChangedAt, ChangedBy
FROM EnrollmentStatusHistory
WHERE EnrollmentId = 'YOUR-ENROLLMENT-ID'
ORDER BY ChangedAt;

-- Expected flow:
-- 1. Paid (when payment confirmed)
-- 2. Completed (when admin creates secure links)
```

### Check Secure Links Creation
```sql
-- View secure links for an enrollment
SELECT 
    sl.Id,
    sl.Token,
    a.FileName,
    sl.CreatedAt,
    sl.DownloadCount,
    sl.IsRevoked
FROM SecureLinks sl
JOIN Attachments a ON sl.AttachmentId = a.Id
WHERE sl.EnrollmentId = 'YOUR-ENROLLMENT-ID'
ORDER BY sl.CreatedAt;
```

### Check Order Processing
```sql
-- View order with all enrollments
SELECT 
    o.Id AS OrderId,
    o.Status AS OrderStatus,
    e.Id AS EnrollmentId,
    e.Status AS EnrollmentStatus,
    c.TitleEn AS CourseTitle,
    c.Type AS CourseType
FROM Orders o
JOIN Enrollments e ON e.OrderId = o.Id
JOIN Courses c ON c.Id = e.CourseId
WHERE o.Id = 'YOUR-ORDER-ID';
```

## Performance Testing

### Objective
Verify that manual fulfillment doesn't cause performance issues.

### Steps

1. **Create 10 Orders with PDF Courses**
2. **Bulk Fulfillment Test:**
   - Admin fulfills all 10 orders one by one
   - Measure time for each fulfillment
   - Check for any timeout errors

**Expected:**
- Each fulfillment completes in < 3 seconds
- No database locks or deadlocks
- All emails sent successfully
- No memory leaks

## Security Testing

### Test Token Generation
- Tokens should be cryptographically secure (32 bytes random)
- Tokens should be unique (no collisions)
- Tokens should be URL-safe (base64 encoded)

### Test Access Control
- Customer can only download their own secure links
- Expired tokens should be rejected
- Revoked tokens should be rejected
- Invalid tokens should return 404

## Acceptance Criteria

### Must Pass All:
- ✅ No automatic delivery for PDF courses
- ✅ Admin can select specific attachments
- ✅ Admin can control email sending
- ✅ Secure links created only for selected attachments
- ✅ Enrollment status correctly updated
- ✅ Order status correctly updated when all enrollments completed
- ✅ Customer receives email with correct links
- ✅ Secure download links work correctly
- ✅ Different workflows for PDF vs Live courses
- ✅ Multiple enrollments handled independently
- ✅ Edge cases handled gracefully

## Sign-Off

### Testing Completed By:
- Name: _______________
- Date: _______________
- Environment: [ ] Dev [ ] Staging [ ] Production

### Test Results:
- Test Case 1: [ ] Pass [ ] Fail
- Test Case 2: [ ] Pass [ ] Fail
- Test Case 3: [ ] Pass [ ] Fail
- Test Case 4: [ ] Pass [ ] Fail
- Test Case 5: [ ] Pass [ ] Fail
- Test Case 6: [ ] Pass [ ] Fail

### Issues Found:
_______________________________________
_______________________________________
_______________________________________

### Approval:
- [ ] All tests passed
- [ ] Ready for deployment
- [ ] Requires fixes before deployment

---

## Quick Test Checklist (For Rapid Verification)

Use this checklist for quick smoke testing:

1. [ ] Buy PDF course → No auto-email sent
2. [ ] Check enrollment status = Paid
3. [ ] Admin opens order → sees attachment selection
4. [ ] Admin selects 2 of 3 attachments
5. [ ] Admin clicks "Generate & Send Secure Links"
6. [ ] Enrollment status → Completed
7. [ ] Order status → Processed
8. [ ] Customer receives email with 2 links
9. [ ] Links work and download files
10. [ ] Database shows 2 secure links created

**If all 10 pass: Fix is working correctly! ✅**

