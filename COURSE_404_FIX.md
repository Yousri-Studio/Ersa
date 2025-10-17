# Course 404 Error Fix

## Problem
Users were getting a **404 error** when clicking on courses from the enrollments page:
```
AxiosError: Request failed with status code 404
at coursesApi.getCourse(slug)
```

## Root Cause
The enrollments page was linking to courses using **Course ID** (GUID) instead of **Course Slug**:

```typescript
// ❌ WRONG (was causing 404):
href={`/${locale}/courses/${enrollment.courseId}`}
// Example: /en/courses/2a80c2a8-4ef7-487a-a23a-c65de412cd72

// ✅ CORRECT (now fixed):
href={`/${locale}/courses/${enrollment.courseSlug}`}
// Example: /en/courses/power-bi
```

The backend endpoint expects a **slug**, not an ID:
```csharp
[HttpGet("{slug}")]
public async Task<ActionResult<CourseDetailDto>> GetCourseBySlug(string slug)
{
    var course = await _context.Courses
        .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive);
```

## What Was Fixed

### 1. ✅ Backend - Added slug to Enrollment API

**File:** `backend/src/DTOs/EnrollmentDTOs.cs`
```csharp
public class EnrollmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseSlug { get; set; } = string.Empty;  // ← ADDED
    public string CourseTitleEn { get; set; } = string.Empty;
    // ... rest of properties
}
```

**File:** `backend/src/Controllers/EnrollmentsController.cs`
```csharp
var enrollmentDtos = enrollments.Select(e => new EnrollmentDto
{
    Id = e.Id,
    CourseId = e.CourseId,
    CourseSlug = e.Course.Slug,  // ← ADDED
    CourseTitleEn = e.Course.TitleEn,
    // ... rest of mapping
}).ToList();
```

### 2. ✅ Frontend - Updated interface and links

**File:** `frontend/app/[locale]/profile/enrollments/page.tsx`

Added `courseSlug` to the interface:
```typescript
interface Enrollment {
  id: string;
  courseId: string;
  courseSlug: string;  // ← ADDED
  courseTitleEn: string;
  // ... rest of properties
}
```

Updated links to use slug:
```typescript
// Changed from: enrollment.courseId
// Changed to:   enrollment.courseSlug
<Link href={`/${locale}/courses/${enrollment.courseSlug}`}>
```

## How to Apply the Fix

### Step 1: Stop the Backend
Press `Ctrl+C` in the terminal running the backend.

### Step 2: Rebuild the Backend
```powershell
cd D:\Data\work\Ersa\backend
dotnet build
```

### Step 3: Restart the Backend
```powershell
dotnet run
```

### Step 4: Restart the Frontend (if needed)
The frontend will hot-reload automatically. If not:
```powershell
cd D:\Data\work\Ersa\frontend
# Stop with Ctrl+C if running
npm run dev
```

## Testing

### Test 1: Check Enrollments API Returns Slug
```powershell
# Make sure you're logged in and have auth token
$token = "YOUR_AUTH_TOKEN_HERE"
Invoke-RestMethod -Uri "http://localhost:5002/api/my/enrollments" `
  -Headers @{Authorization="Bearer $token"} | 
  Select-Object -First 1 | 
  Format-List courseId, courseSlug, courseTitleEn
```

**Expected Output:**
```
courseId      : 2a80c2a8-4ef7-487a-a23a-c65de412cd72
courseSlug    : power-bi
courseTitleEn : Power BI
```

### Test 2: Test Course Link from Enrollments
1. Login to the frontend
2. Go to "My Enrollments": `http://localhost:3000/en/profile/enrollments`
3. Click "Start Course" or the eye icon on any course
4. **✓ Should open the course details page successfully**
5. **✗ Should NOT get 404 error**

### Test 3: Check Browser Network Tab
1. Open DevTools (F12) → Network tab
2. Click on a course from enrollments
3. Look for the request to `/api/courses/{slug}`
4. **✓ Status should be 200 OK**
5. **✗ Status should NOT be 404**

### Test 4: Verify Course URL Format
When you click a course from enrollments, the URL should be:
```
✓ CORRECT: http://localhost:3000/en/courses/power-bi
✗ WRONG:   http://localhost:3000/en/courses/2a80c2a8-4ef7-487a-a23a-c65de412cd72
```

## Why This Matters

### Before the Fix:
- URL: `/en/courses/2a80c2a8-4ef7-487a-a23a-c65de412cd72`
- Backend tries: `WHERE slug = '2a80c2a8-4ef7-487a-a23a-c65de412cd72'`
- Result: No course found → **404 Error** ❌

### After the Fix:
- URL: `/en/courses/power-bi`
- Backend tries: `WHERE slug = 'power-bi'`
- Result: Course found → **200 OK** ✅

## Other Pages Verified

These pages correctly use slugs (no changes needed):
- ✅ Course listings page (`/courses`)
- ✅ Featured courses (home page)
- ✅ Course cards
- ✅ Course search results

## Files Modified

### Backend:
1. `backend/src/DTOs/EnrollmentDTOs.cs` - Added `CourseSlug` property
2. `backend/src/Controllers/EnrollmentsController.cs` - Map course slug in DTO

### Frontend:
1. `frontend/app/[locale]/profile/enrollments/page.tsx` - Use `courseSlug` instead of `courseId`

## Common Issues

### Issue: Still getting 404 after fix
**Solution:**
1. Make sure backend was rebuilt after code changes
2. Make sure backend was restarted (not just hot-reloaded)
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check that the enrollment API returns `courseSlug` field

### Issue: "courseSlug is undefined"
**Solution:**
1. The backend needs to be rebuilt and restarted
2. Try logging out and logging back in (to refresh auth token)
3. Check browser console for the enrollment API response

### Issue: Backend won't build - "file is locked"
**Solution:**
```powershell
# Stop the backend completely (Ctrl+C)
# Wait a few seconds
# Then rebuild
dotnet build
```

## API Comparison

### Before (Missing Slug):
```json
{
  "id": "...",
  "courseId": "2a80c2a8-4ef7-487a-a23a-c65de412cd72",
  "courseTitleEn": "Power BI",
  "courseTitleAr": "باور بي آي"
}
```

### After (With Slug):
```json
{
  "id": "...",
  "courseId": "2a80c2a8-4ef7-487a-a23a-c65de412cd72",
  "courseSlug": "power-bi",  ← ADDED
  "courseTitleEn": "Power BI",
  "courseTitleAr": "باور بي آي"
}
```

## Benefits

✅ **User-friendly URLs** - `/courses/power-bi` instead of `/courses/guid`  
✅ **SEO-friendly** - Slugs are better for search engines  
✅ **No 404 errors** - Links work correctly now  
✅ **Consistent routing** - Same URL pattern everywhere  

## Related Fixes

This issue was discovered while fixing:
1. ✅ Missing icons in enrollments page
2. ✅ Authentication redirect loop on page refresh
3. ✅ Missing enrollments for paid orders

All these issues are now resolved!

---

**Status:** ✅ Fixed  
**Last Updated:** 2025-10-17  
**Requires:** Backend restart + Frontend hot-reload

