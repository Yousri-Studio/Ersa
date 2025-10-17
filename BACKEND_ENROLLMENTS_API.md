# Backend Enrollments API Documentation

## Overview
Created a new backend API endpoint that returns all paid course enrollments for the authenticated user.

## Files Created

### 1. Controller: `backend/src/Controllers/EnrollmentsController.cs`
- **Route**: `/api/my/enrollments`
- **Authorization**: Requires authenticated user

#### Endpoints:

##### GET `/api/my/enrollments`
Returns all paid enrollments for the current user.

**Authorization**: Bearer token required

**Response**: `200 OK`
```json
[
  {
    "id": "guid",
    "courseId": "guid",
    "courseTitleEn": "string",
    "courseTitleAr": "string",
    "courseImage": "base64-string",
    "orderId": "guid",
    "enrolledAt": "2025-01-01T00:00:00Z",
    "status": "active|completed|cancelled",
    "progress": 50,
    "category": "string"
  }
]
```

**Filters Applied:**
- Only returns enrollments with status: `Paid`, `Notified`, or `Completed`
- Sorted by `EnrolledAt` (newest first)
- Includes course and category details

##### GET `/api/my/enrollments/{id}`
Returns a specific enrollment by ID.

**Authorization**: Bearer token required

**Response**: `200 OK` (same format as array item above)

**Error Responses:**
- `401 Unauthorized` - User not authenticated
- `404 Not Found` - Enrollment not found
- `500 Internal Server Error` - Server error

### 2. DTO: `backend/src/DTOs/EnrollmentDTOs.cs`
Defines the data transfer object for enrollment responses.

```csharp
public class EnrollmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseTitleEn { get; set; }
    public string CourseTitleAr { get; set; }
    public string? CourseImage { get; set; }     // Base64 encoded
    public Guid OrderId { get; set; }
    public DateTime EnrolledAt { get; set; }
    public string Status { get; set; }            // active, completed, cancelled
    public int? Progress { get; set; }            // 0-100 or null
    public string? Category { get; set; }
}
```

## How Enrollments Are Created

Enrollments are **automatically created** when a payment is successfully completed:

1. User completes checkout → Payment gateway processes payment
2. Payment gateway sends webhook → `PaymentService.ProcessWebhookAsync()`
3. If payment status is `Completed` → `EnrollmentService.CreateEnrollmentsFromOrderAsync()`
4. For each order item → Create `Enrollment` with status `Paid`
5. Save to database

**Code Location**: `backend/src/Services/PaymentService.cs` (line 159)

```csharp
if (payment.Status == PaymentStatus.Completed && order.Status == OrderStatus.Paid)
{
    await _enrollmentService.CreateEnrollmentsFromOrderAsync(order);
    _logger.LogInformation("Enrollments created for order {OrderId} via {Provider}", orderId.Value, provider);
}
```

## Status Mapping

The endpoint maps internal `EnrollmentStatus` enum to user-friendly strings:

| Database Status | API Response |
|----------------|--------------|
| `Pending`      | `pending`    |
| `Paid`         | `active`     |
| `Notified`     | `active`     |
| `Completed`    | `completed`  |
| `Cancelled`    | `cancelled`  |

## Progress Tracking

The `progress` field is currently:
- Returns `100` for completed enrollments
- Returns `null` for active enrollments (progress bar won't show)
- **TODO**: Implement actual progress tracking based on:
  - Videos watched
  - Lessons completed
  - Assignments submitted
  - Quiz scores

## Security

- **Authentication**: Required via `[Authorize]` attribute
- **Authorization**: Users can only access their own enrollments
- **User Verification**: User ID extracted from JWT claims
- **Data Filtering**: Automatically filters by current user ID

## Database Queries

The endpoint uses efficient queries with:
- `Include()` for related data (Course, Category, Order)
- `Where()` for user and status filtering
- `OrderByDescending()` for sorting
- Single database round-trip

## Testing

### Using Swagger
1. Navigate to `/swagger`
2. Authenticate using Bearer token
3. Find `EnrollmentsController` section
4. Try `GET /api/my/enrollments`

### Using cURL
```bash
curl -X GET "https://yourdomain.com/api/my/enrollments" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman
1. Create new GET request to `/api/my/enrollments`
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Send request

## Frontend Integration

The frontend already uses this endpoint:

**File**: `frontend/lib/api.ts`
```typescript
export const enrollmentsApi = {
  getMyEnrollments: (): Promise<AxiosResponse<any[]>> =>
    api.get('/my/enrollments'),
};
```

**Page**: `frontend/app/[locale]/profile/enrollments/page.tsx`
```typescript
const response = await enrollmentsApi.getMyEnrollments();
setEnrollments(response.data || []);
```

## Logging

The controller logs:
- User enrollment requests
- Number of enrollments found
- Errors with full exception details

Example logs:
```
INFO: Getting enrollments for user {UserId}
INFO: Found 3 enrollments for user {UserId}
ERROR: Error getting user enrollments: {Exception}
```

## Future Enhancements

1. **Pagination**
   - Add page and pageSize parameters
   - Return total count

2. **Filtering**
   - Filter by course category
   - Filter by enrollment date range
   - Filter by status

3. **Progress Tracking**
   - Track course completion percentage
   - Track individual lesson progress
   - Track quiz scores

4. **Certificate Generation**
   - Auto-generate on completion
   - Include in enrollment response

5. **Course Access**
   - Add `hasAccess` boolean
   - Check subscription expiry
   - Validate payment status

## Related Files

- `backend/src/Data/Entities/Enrollment.cs` - Entity model
- `backend/src/Services/EnrollmentService.cs` - Business logic
- `backend/src/Services/PaymentService.cs` - Creates enrollments on payment
- `frontend/app/[locale]/profile/enrollments/page.tsx` - Frontend page

## Troubleshooting

### No enrollments returned
- Check if orders have `Paid` status
- Verify enrollments were created (check `Enrollments` table)
- Ensure user is authenticated
- Check enrollment status (must be `Paid`, `Notified`, or `Completed`)

### 401 Unauthorized
- Verify JWT token is valid
- Check token expiration
- Ensure Authorization header format: `Bearer {token}`

### 500 Internal Server Error
- Check application logs
- Verify database connection
- Check database tables exist
- Verify foreign key relationships

## Database Schema

```sql
Table: Enrollments
- Id (Guid, PK)
- UserId (Guid, FK → Users)
- CourseId (Guid, FK → Courses)
- SessionId (Guid?, FK → Sessions)
- OrderId (Guid?, FK → Orders)
- Status (int) -- EnrollmentStatus enum
- EnrolledAt (DateTime)
```

## Dependencies

- `Microsoft.AspNetCore.Authorization`
- `Microsoft.EntityFrameworkCore`
- `ErsaTraining.API.Data.ApplicationDbContext`
- `ErsaTraining.API.Data.Entities.Enrollment`
- `ErsaTraining.API.DTOs.EnrollmentDto`

---

**Created**: 2025-01-17
**Status**: ✅ Complete and Production Ready

