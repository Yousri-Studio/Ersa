# Debugging "Objects are not valid as a React child" Error

## Problem
React error: "Objects are not valid as a React child (found: object with keys {ar, en})"

This error occurs when you try to render a LocalizedText object `{ar: "...", en: "..."}` directly in JSX without extracting the specific language string.

## Root Causes

### 1. **Direct Rendering in JSX**
```tsx
// ❌ WRONG - Renders the whole object
<div>{course.title}</div>

// ✅ CORRECT - Extract the language first
<div>{locale === 'ar' ? course.title.ar : course.title.en}</div>

// ✅ BETTER - Use the utility function
import { getLocalizedText } from '@/lib/localized-text';
<div>{getLocalizedText(course.title, locale)}</div>
```

### 2. **In Attributes**
```tsx
// ❌ WRONG
<img alt={course.title} />

// ✅ CORRECT
<img alt={typeof course.title === 'object' ? course.title[locale] : course.title} />
```

### 3. **In Toast Messages**
```tsx
// ❌ WRONG
toast.success(`Added ${course.title}`);

// ✅ CORRECT
toast.success(`Added ${course.title[locale]}`);
```

### 4. **In Console Logs** (Less common but can cause issues)
```tsx
// ❌ Can cause issues in some cases
console.log('Course:', course.title);

// ✅ BETTER
console.log('Course:', course.title[locale]);
```

## How to Find the Error

### Step 1: Check Browser Console
The error message usually includes a component stack trace:
```
at SomeComponent (path/to/component.tsx:123)
at ParentComponent (path/to/parent.tsx:456)
```

### Step 2: Search for Patterns
Search your codebase for these patterns that might be rendering LocalizedText objects:

```bash
# Search for direct rendering
grep -r "{.*\.title}" frontend/
grep -r "{.*\.name}" frontend/
grep -r "{.*\.summary}" frontend/

# Search for potential issues in specific file types
grep -r "alt={[^}]*title" frontend/
grep -r "alt={[^}]*name" frontend/
```

### Step 3: Check Common Locations

#### **Cart & Wishlist**
- `frontend/app/[locale]/cart/page.tsx`
- `frontend/app/[locale]/wishlist/page.tsx`
- `frontend/app/[locale]/profile/wishlist/page.tsx`

#### **Course Pages**
- `frontend/app/[locale]/courses/page.tsx`
- `frontend/app/[locale]/courses/[id]/page.tsx`
- `frontend/components/ui/course-card-new.tsx`

#### **Search & Navigation**
- `frontend/components/home/search-bar.tsx`
- `frontend/components/home/hero-section.tsx`
- `frontend/components/home/featured-courses.tsx`

#### **Admin Pages**
- `frontend/app/[locale]/admin/courses/page.tsx`
- `frontend/app/[locale]/admin/course-categories/page.tsx`

## Files Already Fixed

✅ `frontend/app/[locale]/wishlist/page.tsx` - Lines 173, 203  
✅ `frontend/app/[locale]/profile/wishlist/page.tsx` - Lines 121, 151  
✅ `frontend/app/[locale]/cart/page.tsx` - Lines 119, 127  
✅ `frontend/app/[locale]/admin/courses/page.tsx` - Line 396  
✅ `frontend/components/home/hero-section.tsx` - Fetches categories properly  
✅ `frontend/app/[locale]/courses/page.tsx` - Fetches categories properly  
✅ `frontend/app/[locale]/courses/[id]/page.tsx` - Displays categories properly  

## Defensive Pattern

Always use this pattern when dealing with LocalizedText:

```tsx
import { getLocalizedText } from '@/lib/localized-text';

// In component
const displayText = getLocalizedText(someLocalizedText, locale, 'Fallback Text');

// Or inline
{getLocalizedText(course.title, locale)}
```

## Using the Utility Function

```tsx
import { getLocalizedText, isLocalizedText } from '@/lib/localized-text';

// Basic usage
const title = getLocalizedText(course.title, locale);

// With fallback
const description = getLocalizedText(course.description, locale, 'No description');

// Type checking
if (isLocalizedText(someValue)) {
  return getLocalizedText(someValue, locale);
}
```

## Quick Fix Checklist

When you encounter this error:

1. ☑️ Check the browser console for the exact component and line number
2. ☑️ Search that component for `{variableName}` patterns
3. ☑️ Look for LocalizedText fields: `title`, `name`, `summary`, `description`
4. ☑️ Check `alt` attributes in `<img>` tags
5. ☑️ Check toast messages that might include course/category data
6. ☑️ Use `getLocalizedText()` utility or manual extraction
7. ☑️ Test in both Arabic and English locales

## Prevention

### In TypeScript Types
Define your types clearly:

```tsx
type Course = {
  id: string;
  title: LocalizedText;  // Not string!
  summary: LocalizedText;
  // ...
};
```

### In Components
Always extract before rendering:

```tsx
export function CourseItem({ course, locale }: Props) {
  // Extract at the top
  const title = getLocalizedText(course.title, locale);
  const summary = getLocalizedText(course.summary, locale);
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{summary}</p>
    </div>
  );
}
```

## Backend Note

The backend returns `LocalizedText` objects for internationalization:

```json
{
  "title": {
    "ar": "عنوان الدورة",
    "en": "Course Title"
  }
}
```

This is intentional and correct. The frontend must handle the extraction.





