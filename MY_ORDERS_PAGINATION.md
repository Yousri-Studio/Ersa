# My Orders Pagination Feature

## Overview
Added comprehensive pagination functionality to the My Orders page (`/my-orders`) with customizable items per page and intuitive page navigation.

## Features Implemented

### 1. **Items Per Page Selector**
Users can choose how many orders to display per page:
- 10 items (default)
- 25 items
- 50 items
- 100 items
- All (shows all orders on one page)

### 2. **Page Navigation**
- **Previous/Next buttons**: Navigate between pages with disabled state when at boundaries
- **Page numbers**: Direct navigation to specific pages
- **Smart ellipsis**: Shows `...` for large page ranges to keep UI clean
- **Current page highlight**: Active page is highlighted in teal color

### 3. **Pagination Info Display**
- **Top panel**: Shows "Showing X - Y of Z orders" with items per page selector
- **Bottom panel**: Shows "Page X of Y" with navigation controls

### 4. **Responsive Design**
- Mobile-friendly layout with stacked elements on small screens
- Maintains readability and usability across all device sizes

## User Experience Improvements

### Visual Feedback
- Current page highlighted with `bg-teal-600` color
- Disabled buttons shown with reduced opacity
- Hover states for interactive elements
- Smooth scroll to top when changing pages

### Smart Pagination Logic
The pagination intelligently displays page numbers:
- If ≤5 pages: Shows all page numbers (1, 2, 3, 4, 5)
- If >5 pages and near start: Shows (1, 2, 3, 4, ..., N)
- If >5 pages and in middle: Shows (1, ..., X-1, X, X+1, ..., N)
- If >5 pages and near end: Shows (1, ..., N-3, N-2, N-1, N)

### Reset on Change
When changing items per page, pagination automatically resets to page 1 to avoid showing empty pages.

## Files Modified

### 1. `frontend/app/[locale]/my-orders/page.tsx`
**Added State:**
```typescript
const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage, setItemsPerPage] = useState(10);
```

**Added Functions:**
- `handlePageChange(page)`: Navigate to specific page with smooth scroll
- `handleItemsPerPageChange(value)`: Change items per page and reset to page 1
- `getPageNumbers()`: Generate smart page number array with ellipsis

**Added Variables:**
- `totalOrders`: Total count of orders
- `totalPages`: Calculated number of pages
- `startIndex` / `endIndex`: Current page bounds
- `currentOrders`: Sliced array of orders for current page

**UI Components:**
- Top pagination panel with items per page selector and info
- Bottom pagination panel with page navigation (only shown if >1 page)

### 2. `frontend/locales/en.json`
Added new `pagination` section:
```json
"pagination": {
  "items-per-page": "Items per page",
  "all": "All",
  "showing": "Showing",
  "of": "of",
  "orders": "orders",
  "page": "Page",
  "previous": "Previous",
  "next": "Next"
}
```

### 3. `frontend/locales/ar.json`
Added Arabic translations:
```json
"pagination": {
  "items-per-page": "عدد العناصر في الصفحة",
  "all": "الكل",
  "showing": "عرض",
  "of": "من",
  "orders": "طلب",
  "page": "صفحة",
  "previous": "السابق",
  "next": "التالي"
}
```

## Usage Examples

### Default View (10 items per page)
```
┌─────────────────────────────────────────────────────┐
│ Items per page: [10 ▾]    Showing 1 - 10 of 25 orders │
└─────────────────────────────────────────────────────┘
│ [Order 1]                                           │
│ [Order 2]                                           │
│ ...                                                 │
│ [Order 10]                                          │
└─────────────────────────────────────────────────────┘
│ Page 1 of 3        [◄] [1] [2] [3] [►]            │
└─────────────────────────────────────────────────────┘
```

### Large Dataset (100+ orders)
```
┌─────────────────────────────────────────────────────┐
│ Items per page: [25 ▾]    Showing 26 - 50 of 150 orders │
└─────────────────────────────────────────────────────┘
│ [Order 26]                                          │
│ ...                                                 │
│ [Order 50]                                          │
└─────────────────────────────────────────────────────┘
│ Page 2 of 6    [◄] [1] [...] [2] [3] [...] [6] [►] │
└─────────────────────────────────────────────────────┘
```

### Show All Orders
```
┌─────────────────────────────────────────────────────┐
│ Items per page: [All ▾]   Showing 1 - 25 of 25 orders │
└─────────────────────────────────────────────────────┘
│ [Order 1]                                           │
│ [Order 2]                                           │
│ ...                                                 │
│ [Order 25]                                          │
└─────────────────────────────────────────────────────┘
```

## Technical Details

### Pagination Calculation
```typescript
const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalOrders / itemsPerPage);
const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage;
const endIndex = itemsPerPage === -1 ? totalOrders : startIndex + itemsPerPage;
const currentOrders = orders.slice(startIndex, endIndex);
```

### Items Per Page Values
- `10`, `25`, `50`, `100`: Standard pagination values
- `-1`: Special value representing "All" items

### Icon Dependencies
Uses existing FontAwesome icons from the Icon component:
- `chevron-left`: Previous page button
- `chevron-right`: Next page button

## Accessibility Features

1. **Disabled States**: Previous/Next buttons disabled appropriately
2. **Visual Feedback**: Clear indication of current page and available actions
3. **Keyboard Navigation**: All controls are keyboard accessible
4. **Smooth Scrolling**: Auto-scroll to top on page change for better UX
5. **RTL Support**: Uses `rtl:` Tailwind classes for Arabic layout

## Testing Checklist

- [✓] Pagination shows correctly with 10 items per page (default)
- [✓] Can switch between 10, 25, 50, 100, and All options
- [✓] Page navigation works correctly
- [✓] Previous button disabled on first page
- [✓] Next button disabled on last page
- [✓] Current page highlighted correctly
- [✓] Ellipsis shows for large page counts
- [✓] Page resets to 1 when changing items per page
- [✓] Smooth scroll to top on page change
- [✓] Translations work in both English and Arabic
- [✓] Responsive design works on mobile and desktop
- [✓] Pagination hidden when showing all orders (1 page)

## Future Enhancements (Optional)

1. **URL Parameters**: Store page and items per page in URL query params
2. **Sorting**: Add sort options (date, amount, status)
3. **Filtering**: Filter by status or date range
4. **Search**: Search orders by ID or course name
5. **Keyboard Shortcuts**: Arrow keys for page navigation
6. **Local Storage**: Remember user's items per page preference

## Notes

- Pagination only shows when there's more than one page
- "All" option works efficiently even with large datasets (browser handles rendering)
- Consider server-side pagination if order count exceeds 1000+ for performance

