# Enrollments Page - Feature Documentation

## Overview
The `/profile/enrollments` page displays all courses that the logged-in user has successfully enrolled in (paid orders). The page includes comprehensive search, filtering, and sorting capabilities.

## Features Implemented

### 🔍 Search Functionality
- **Real-time Search**: Search courses by title as you type
- **Bilingual Support**: Searches in both Arabic and English titles
- **Clear Button**: Quick clear button appears when search has text
- **Icon**: Search icon (Font Awesome) on the left (or right for RTL)

### 🎯 Filtering Options

#### 1. Category Filter
- Dynamic dropdown populated from enrolled courses
- Shows only if courses have categories
- Options: "All Categories" + unique categories from user's enrollments

#### 2. Status Filter
- Filter by enrollment status
- Options:
  - All Status
  - Active
  - Completed
  - In Progress

### 📊 Sorting Options
Sort courses by:
1. **Date** (default) - Newest enrollments first
2. **Name** - Alphabetical order (A-Z)
3. **Progress** - Highest progress first

### 🎨 UI/UX Features

#### Search & Filters Bar
- White card with shadow
- Responsive grid layout (1 col mobile, 4 cols desktop)
- Smooth animations on load
- Clear Filters button (appears when filters are active)
- Results counter showing "X of Y courses"

#### Course Cards
- **Responsive Grid**: 1 column (mobile), 2 columns (tablet), 3 columns (desktop)
- **Course Image**: Gradient placeholder if no image
- **Course Title**: Localized (Arabic/English)
- **Enrollment Date**: Formatted based on locale
- **Progress Bar**: Shows completion percentage (if available)
- **Status Badge**: Green "Enrolled" badge
- **Action Buttons**:
  - Start Course (primary button)
  - View Course (icon button)

#### Empty States
1. **No Enrollments**: Shows when user has no enrolled courses
   - Large icon
   - "Browse Courses" call-to-action button
   
2. **No Results**: Shows when filters return no results
   - Search icon
   - Helpful message
   - "Clear Filters" button

### 🌐 Localization
- Fully localized in Arabic and English
- RTL/LTR layout support
- Localized dates and numbers
- Proper text alignment for each language

### ⚡ Animations
- Page load animations with stagger effect
- Card animations on scroll
- Smooth hover effects
- Transition animations on filter changes

### 🔐 Authentication
- Redirects to login if not authenticated
- Redirects back to enrollments after login
- Shows loading state during authentication check

## API Integration

### Endpoint
```typescript
enrollmentsApi.getMyEnrollments()
```

### Expected Response Format
```typescript
interface Enrollment {
  id: string;
  courseId: string;
  courseTitleEn: string;
  courseTitleAr: string;
  courseImage?: string;
  orderId: string;
  enrolledAt: string;        // ISO date string
  status: string;             // 'active' | 'completed' | 'in-progress'
  progress?: number;          // 0-100
  category?: string;          // Optional category name
}
```

## File Location
```
frontend/app/[locale]/profile/enrollments/page.tsx
```

## Routes
- Arabic: `http://localhost:3000/ar/profile/enrollments`
- English: `http://localhost:3000/en/profile/enrollments`

## Dependencies
- `next-intl` - Internationalization
- `@/lib/auth-store` - Authentication state
- `@/lib/api` - API calls
- `@/components/ui/icon` - Icons (Font Awesome 6 Pro)
- `@/lib/use-animations` - Animation hooks
- `@/components/scroll-animations` - Scroll animations

## Design System
- **Gradient Heading**: Uses the standard gradient style
  - `linear-gradient(270deg, #27E8B1 31.94%, #693EB0 59.68%)`
  - Font: "The Year of Handicrafts"
- **Font**: Cairo for all text
- **Icons**: Font Awesome 6 Pro
- **Primary Color**: Teal (#00AC96)
- **Secondary Color**: Purple (#693EB0)

## User Flow
1. User navigates to `/profile/enrollments`
2. System checks authentication
3. If not authenticated → Redirect to login
4. If authenticated → Fetch enrollments
5. Display courses in grid layout
6. User can:
   - Search by course name
   - Filter by category
   - Filter by status
   - Sort by date/name/progress
   - Click "Start Course" to begin learning
   - Click "View All Orders" to see order history

## Filter Logic
The filtering system works as follows:
1. **Search** is applied first (case-insensitive, searches course title)
2. **Category filter** is applied to search results
3. **Status filter** is applied to category-filtered results
4. **Sorting** is applied last to the final filtered set

## Performance Considerations
- Filters are applied client-side for instant feedback
- Animations use stagger for better perceived performance
- Lazy loading for course images
- Efficient re-rendering with React hooks

## Future Enhancements (Optional)
- [ ] Pagination for large number of enrollments
- [ ] Certificate download button for completed courses
- [ ] Course rating and review
- [ ] Favorite/bookmark courses
- [ ] Export enrollments as PDF
- [ ] Email notifications for course updates
- [ ] Course completion percentage in list view
- [ ] Filter by date range
- [ ] Multi-select category filter

## Testing Checklist
- [ ] Page loads correctly for authenticated users
- [ ] Redirects to login for unauthenticated users
- [ ] Search works in both Arabic and English
- [ ] Category filter shows correct options
- [ ] Status filter works correctly
- [ ] Sort options work (date, name, progress)
- [ ] Clear filters button resets all filters
- [ ] Empty state shows when no enrollments
- [ ] No results state shows when filters return nothing
- [ ] Card hover effects work
- [ ] Start Course button navigates correctly
- [ ] RTL layout works for Arabic
- [ ] LTR layout works for English
- [ ] Mobile responsive design works
- [ ] Animations play smoothly

