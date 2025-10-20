# Enrollments Page Update

## Overview
Updated the public enrollments page to simplify the card actions and redirect users to their order details instead of the course page.

## Changes Made

### File Modified
- `frontend/app/[locale]/profile/enrollments/page.tsx`

### Changes (Lines 445-459)

#### Before:
- Had **two buttons**: 
  1. Green "Start Course" button with play icon (linked to course page)
  2. White eye button (linked to course page)
- Both buttons redirected to: `/${locale}/courses/${enrollment.courseSlug}`

#### After:
- Has **one button**:
  1. Green "View Order Details" button with eye icon
- Button redirects to: `/${locale}/profile/orders/${enrollment.orderId}`

### Specific Updates:

1. **Removed the separate eye button** - No more white bordered button on the right

2. **Updated the green button**:
   - Changed icon from `play` to `eye`
   - Changed label from:
     - English: "Start Course" → "View Order Details"
     - Arabic: "ابدأ الدورة" → "عرض تفاصيل الطلب"
   - Changed link from `/courses/{slug}` to `/profile/orders/{orderId}`
   - Made button full width (`w-full` class)

3. **Kept styling**:
   - Same green color (#00AC96)
   - Same button styling and animations
   - Same font size (14px) and weight (600)

## User Experience

### Before:
- Users saw two buttons but both went to the same place (course page)
- Confusing UX with redundant actions

### After:
- Users see one clear call-to-action button
- Button takes them to their order details page
- Order details page shows:
  - Enrollment information
  - Session details (for live courses)
  - Download links for course materials
  - Invoice access

## Example URL
When a user clicks the button, they are redirected to:
```
http://localhost:3000/en/profile/orders/5bb5909d-c669-4ffa-8b81-0f609ecaa839
```

## Visual Changes
- Cleaner card layout with single prominent action button
- Better alignment and use of space
- Clear indication of what the button does ("View Order Details")

## Date: October 20, 2025

