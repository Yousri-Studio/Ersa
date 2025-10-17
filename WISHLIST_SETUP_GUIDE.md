# 🚀 Wishlist Feature - Quick Setup Guide

## **Prerequisites**

✅ Database tables already exist (Wishlists and WishlistItems)  
✅ Backend API is running  
✅ Frontend is running  
✅ User authentication is working  

---

## **Quick Start**

### **1. Verify Database Tables**

The wishlist tables should already exist in your database. If they don't, run:

```sql
-- Check if tables exist
SELECT * FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_NAME IN ('Wishlists', 'WishlistItems');
```

If tables don't exist, they will be created automatically by Entity Framework when you run the backend.

---

### **2. Start Backend API**

```bash
cd backend/src
dotnet run
```

The API should start on `http://localhost:5002` (or your configured port).

---

### **3. Start Frontend**

```bash
cd frontend
npm run dev
```

The frontend should start on `http://localhost:3000`.

---

## **Testing the Wishlist Feature**

### **Test 1: View Empty Wishlist**

1. Navigate to `http://localhost:3000/en/wishlist` (or `/ar/wishlist`)
2. If not logged in, you should see the empty state with a "Login Required" button
3. If logged in, you should see the empty wishlist state

**Expected Result**: Empty state with appropriate message and call-to-action buttons

---

### **Test 2: Add Course to Wishlist**

1. Login to the application
2. Navigate to a course detail page (e.g., `/en/courses/[course-id]`)
3. Click the "Add to Wishlist" button (heart icon)
4. The button should change to "Remove from Wishlist" with a red heart

**Expected Result**: Course is added to wishlist, button state changes immediately

---

### **Test 3: View Wishlist with Items**

1. After adding courses to wishlist, navigate to `/en/wishlist`
2. You should see all your wishlisted courses in a grid layout
3. Each course should show:
   - Course image
   - Title and description
   - Price (with discount if applicable)
   - Rating and student count
   - Instructor name
   - Duration and level
   - "Add to Cart" and "View Details" buttons

**Expected Result**: All wishlisted courses are displayed correctly

---

### **Test 4: Remove from Wishlist**

1. On the wishlist page, click the heart icon on any course card
2. The course should be removed from the wishlist immediately
3. If it was the last course, the empty state should appear

**Expected Result**: Course is removed, UI updates immediately

---

### **Test 5: Add to Cart from Wishlist**

1. On the wishlist page, click "Add to Cart" on any course
2. Navigate to the cart page
3. The course should appear in your cart

**Expected Result**: Course is added to cart successfully

---

### **Test 6: Profile Wishlist Page**

1. Navigate to `/en/profile/wishlist`
2. You should see the same wishlist with a different layout
3. All functionality should work the same as the public wishlist page

**Expected Result**: Profile wishlist works identically to public wishlist

---

### **Test 7: Persistence**

1. Add some courses to your wishlist
2. Close the browser tab
3. Open a new tab and login again
4. Navigate to the wishlist page
5. Your wishlist should still contain the same courses

**Expected Result**: Wishlist persists across sessions

---

## **API Testing with cURL**

### **Get Wishlist**

```bash
# Replace YOUR_JWT_TOKEN with your actual JWT token
curl -X GET "http://localhost:5002/api/wishlist/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "items": [...],
  "totalCount": 2
}
```

---

### **Add to Wishlist**

```bash
# Replace YOUR_JWT_TOKEN and YOUR_COURSE_ID
curl -X POST "http://localhost:5002/api/wishlist/items" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"courseId": "YOUR_COURSE_ID"}'
```

**Expected Response:**
```json
{
  "message": "Course added to wishlist successfully",
  "itemId": "..."
}
```

---

### **Remove from Wishlist**

```bash
# Replace YOUR_JWT_TOKEN and YOUR_COURSE_ID
curl -X DELETE "http://localhost:5002/api/wishlist/items/YOUR_COURSE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "message": "Course removed from wishlist successfully"
}
```

---

### **Check if Course is in Wishlist**

```bash
# Replace YOUR_JWT_TOKEN and YOUR_COURSE_ID
curl -X GET "http://localhost:5002/api/wishlist/check/YOUR_COURSE_ID" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
```json
{
  "isInWishlist": true
}
```

---

## **Troubleshooting**

### **Issue: Empty wishlist even after adding courses**

**Solution:**
1. Check browser console for errors
2. Verify JWT token is valid
3. Check backend logs for API errors
4. Clear localStorage and try again: `localStorage.clear()`

---

### **Issue: 401 Unauthorized error**

**Solution:**
1. Verify you're logged in
2. Check JWT token is being sent in Authorization header
3. Verify token hasn't expired
4. Try logging out and logging back in

---

### **Issue: Wishlist not persisting**

**Solution:**
1. Check if localStorage is working: `console.log(localStorage.getItem('wishlist-storage'))`
2. Verify database connection is working
3. Check backend logs for database errors

---

### **Issue: Duplicate courses in wishlist**

**Solution:**
This shouldn't happen due to unique constraint on (WishlistId, CourseId). If it does:
1. Check database constraints
2. Clear wishlist and try again
3. Check backend logs for errors

---

## **Common Errors and Solutions**

| Error | Cause | Solution |
|-------|-------|----------|
| `Course not found` | Invalid course ID | Verify the course exists in database |
| `User not authenticated` | No JWT token | Login first |
| `Course already in wishlist` | Duplicate add attempt | This is expected behavior |
| `Wishlist not found` | First-time user | Wishlist is created automatically |

---

## **Development Tips**

### **View Wishlist Data in Database**

```sql
-- View all wishlists
SELECT * FROM Wishlists;

-- View all wishlist items with course details
SELECT 
    wi.Id as WishlistItemId,
    wi.CreatedAt,
    u.Email as UserEmail,
    c.TitleEn as CourseTitle,
    c.Price
FROM WishlistItems wi
JOIN Wishlists w ON wi.WishlistId = w.Id
JOIN AspNetUsers u ON w.UserId = u.Id
JOIN Courses c ON wi.CourseId = c.Id;
```

---

### **Reset Wishlist for Testing**

```sql
-- Clear all wishlist items (keeps wishlists)
DELETE FROM WishlistItems;

-- Clear all wishlists (also clears items due to CASCADE)
DELETE FROM Wishlists;
```

---

### **Clear Frontend Storage**

```javascript
// In browser console
localStorage.removeItem('wishlist-storage');
// or
localStorage.clear();
```

---

## **Next Steps**

After verifying the wishlist feature works:

1. ✅ Add wishlist icon to course cards on listing pages
2. ✅ Add wishlist count badge to navigation header
3. ✅ Implement email notifications for price drops
4. ✅ Add analytics tracking for wishlist actions
5. ✅ Implement sharing wishlist feature

---

## **Support**

For issues or questions:
- Check backend logs: `backend/logs/`
- Check browser console for frontend errors
- Review API documentation: `WISHLIST_IMPLEMENTATION.md`

---

**Last Updated**: October 17, 2025

