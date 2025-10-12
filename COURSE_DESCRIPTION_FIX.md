# Course Description Display Fix

## Issue
The course description was not showing on the frontend public course details page. Instead, the course summary was being displayed in both places (at the top under the title AND in the "About This Course" section).

## Root Cause
The issue was in the `transformApiCourse` function in `frontend/lib/content-hooks.ts`. It was incorrectly mapping the `description` field to use the `summary` value instead of the actual `description` field from the API response.

### Before (Incorrect Code)
```typescript
description: typeof apiCourse.summary === 'object' 
  ? apiCourse.summary
  : {
      ar: apiCourse.summary || 'وصف الدورة',
      en: apiCourse.summary || 'Course description'
    },
```

## Changes Made

### 1. Added description field to Course interface
**File:** `frontend/lib/types/api.ts`

Added the `description` field to the `Course` interface:
```typescript
export interface Course {
  id: string;
  slug: string;
  title: LocaleString;
  summary: LocaleString;
  description?: LocaleString;  // ← Added this field
  price: number;
  // ... rest of interface
}
```

### 2. Fixed transformApiCourse function
**File:** `frontend/lib/content-hooks.ts`

Updated the description mapping logic to use the actual `description` field from the API:
```typescript
description: apiCourse.description && (apiCourse.description.ar || apiCourse.description.en)
  ? apiCourse.description
  : (typeof apiCourse.summary === 'object' 
      ? apiCourse.summary
      : {
          ar: apiCourse.summary || 'وصف الدورة',
          en: apiCourse.summary || 'Course description'
        }),
```

This now:
1. First checks if `apiCourse.description` exists and has content
2. If yes, uses the description
3. If not, falls back to summary (for backward compatibility)

## How It Works Now

The course details page (`frontend/app/[locale]/courses/[id]/page.tsx`) displays:

1. **Course Summary** - Shown at the top under the course title (line 129-131)
   ```typescript
   <p className="text-lg text-gray-600 mb-6 font-cairo">
     {summary}
   </p>
   ```

2. **Course Description** - Shown in the "About This Course" section (line 504-506)
   ```typescript
   <p className="text-gray-600 leading-relaxed font-cairo">
     {course.description ? (locale === 'ar' ? course.description.ar : course.description.en) : (locale === 'ar' ? course.summary.ar : course.summary.en)}
   </p>
   ```

## Backend Structure
The backend already correctly sends both fields:
- **Summary** (`SummaryAr`, `SummaryEn`) - Max 2000 characters
- **Description** (`DescriptionAr`, `DescriptionEn`) - Max 5000 characters

Both are returned in the `CourseDetailDto` from the API at `/api/courses/{slug}`.

## Testing
To verify the fix:
1. Navigate to any course details page: `https://ersa-training.com/en/courses/{course-slug}`
2. Check that the summary appears under the title (short text)
3. Scroll down to "About This Course" section
4. Verify that the full description appears there (longer text, different from summary)

## Files Modified
1. `frontend/lib/types/api.ts` - Added `description?: LocaleString` to Course interface
2. `frontend/lib/content-hooks.ts` - Fixed transformApiCourse to use description field

No backend changes were needed as it was already sending the correct data.

