# Ersa Training Admin Dashboard

## Overview

The Ersa Training Admin Dashboard is a comprehensive management system that allows administrators and super administrators to manage all aspects of the e-learning platform. The dashboard is completely separate from the public website and requires proper authentication and authorization.

## Features

### 🔐 Security & Authentication
- **Role-based access control**: Admin and Super Admin roles
- **JWT-based authentication**: Secure token-based authentication
- **Protected routes**: All admin routes require proper authorization
- **Session management**: Automatic token refresh and logout

### 📊 Dashboard Overview
- **Real-time statistics**: Total users, courses, orders, and revenue
- **Recent activity**: Latest users and orders
- **Performance metrics**: Active users, course completion rates
- **Revenue tracking**: Total and average order values

### 👥 User Management
- **User listing**: View all users with pagination and search
- **User status management**: Activate, deactivate, or suspend users
- **Role management**: Assign admin and super admin roles (Super Admin only)
- **User details**: View user information, registration date, last login
- **Admin notes**: Add internal notes about users

### 📚 Course Management
- **Course listing**: View all courses with pagination and search
- **Course status**: Activate or deactivate courses
- **Course details**: View course information, pricing, and status
- **Course editing**: Edit course information (coming soon)
- **Course creation**: Add new courses (coming soon)

### 🛒 Order Management
- **Order listing**: View all orders with filtering and pagination
- **Order status management**: Update order status (Pending, Processing, Completed, etc.)
- **Order details**: View order information, customer details, and amounts
- **Date filtering**: Filter orders by date range
- **Invoice generation**: Download order invoices (coming soon)

### 🔧 System Settings (Super Admin Only)
- **Platform configuration**: System-wide settings
- **Admin user management**: Manage other admin users
- **System logs**: View system activity logs (coming soon)

## Access Control

### Admin Role
- View dashboard statistics
- Manage users (except other admins)
- Manage courses
- Manage orders
- View system information

### Super Admin Role
- All Admin permissions
- Manage other admin users
- Assign admin roles
- Access system settings
- Full system control

## Getting Started

### 1. Backend Setup

The admin dashboard backend is already integrated into the main API. To start the backend:

```bash
cd backend/src
dotnet run
```

### 2. Frontend Setup

The admin dashboard frontend is integrated into the main Next.js application. To start the frontend:

```bash
cd frontend
npm run dev
```

### 3. Access the Dashboard

1. Navigate to `http://localhost:3000/en/admin` or `http://localhost:3000/ar/admin`
2. Login with admin credentials:
   - **Email**: admin@ersatraining.com
   - **Password**: Admin123!

### 4. Create Additional Admin Users

Super admins can create additional admin users through the dashboard or by directly updating the database.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with admin credentials
- `POST /api/auth/refresh-token` - Refresh JWT token

### Dashboard
- `GET /api/admin/dashboard-stats` - Get dashboard statistics

### Users
- `GET /api/admin/users` - Get paginated user list
- `PUT /api/admin/users/{userId}/status` - Update user status
- `PUT /api/admin/users/{userId}/admin-role` - Update admin role (Super Admin only)

### Courses
- `GET /api/admin/courses` - Get paginated course list

### Orders
- `GET /api/admin/orders` - Get paginated order list
- `PUT /api/admin/orders/{orderId}/status` - Update order status

## Security Considerations

### Authentication
- All admin endpoints require JWT authentication
- Tokens expire after 7 days
- Automatic token refresh on frontend

### Authorization
- Role-based access control on all endpoints
- Super Admin can manage other admins
- Regular admins cannot modify admin users

### Data Protection
- Admin notes are stored separately from user data
- Sensitive operations are logged
- Input validation on all endpoints

## Database Schema

### User Entity Updates
The User entity has been extended with admin fields:

```csharp
public class User : IdentityUser<Guid>
{
    // ... existing fields ...
    
    // Admin properties
    public bool IsAdmin { get; set; } = false;
    public bool IsSuperAdmin { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }
    public string? AdminNotes { get; set; }
}
```

### JWT Claims
Admin roles are included in JWT tokens:

```csharp
// Add admin role claims
if (user.IsSuperAdmin)
{
    claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin"));
    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
}
else if (user.IsAdmin)
{
    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
}
```

## Frontend Architecture

### Layout Structure
```
frontend/app/[locale]/admin/
├── layout.tsx          # Admin layout with navigation
├── page.tsx            # Dashboard overview
├── users/
│   └── page.tsx        # User management
├── courses/
│   └── page.tsx        # Course management
└── orders/
    └── page.tsx        # Order management
```

### Key Components
- **AdminLayout**: Main layout with sidebar navigation
- **Dashboard**: Overview with statistics and recent activity
- **UserManagement**: User listing, filtering, and management
- **CourseManagement**: Course listing and management
- **OrderManagement**: Order listing and status updates

### State Management
- **Auth Store**: User authentication and admin status
- **Admin API**: Centralized admin API functions
- **Toast Notifications**: User feedback for actions

## Development

### Adding New Features
1. Add backend endpoints in `AdminController.cs`
2. Create corresponding DTOs in `AdminDTOs.cs`
3. Add frontend API functions in `admin-api.ts`
4. Create frontend components and pages
5. Update navigation in `admin/layout.tsx`

### Styling
The admin dashboard uses Tailwind CSS with a consistent design system:
- **Colors**: Blue primary, green success, red danger, yellow warning
- **Components**: Cards, tables, modals, forms
- **Icons**: Font Awesome 6 Pro icons
- **Typography**: Cairo font family

### Responsive Design
- Mobile-first approach
- Collapsible sidebar on mobile
- Responsive tables with horizontal scroll
- Touch-friendly interface

## Troubleshooting

### Common Issues

1. **Access Denied Error**
   - Ensure user has admin role
   - Check JWT token validity
   - Verify user status is Active

2. **API Connection Issues**
   - Check backend is running
   - Verify CORS configuration
   - Check network connectivity

3. **Database Migration Issues**
   - Run `dotnet ef database update`
   - Check migration files
   - Verify database connection

### Logs
- Backend logs are stored in `backend/src/logs/`
- Frontend errors are logged to browser console
- Admin actions are logged for audit purposes

## Future Enhancements

### Planned Features
- [ ] Advanced analytics and reporting
- [ ] Bulk operations (bulk user management, course updates)
- [ ] Email notifications for admin actions
- [ ] Audit trail and activity logs
- [ ] Advanced search and filtering
- [ ] Export functionality (CSV, PDF)
- [ ] Real-time notifications
- [ ] Mobile admin app

### Technical Improvements
- [ ] Caching for better performance
- [ ] Real-time updates with SignalR
- [ ] Advanced role permissions
- [ ] Multi-language admin interface
- [ ] Dark mode support

## Support

For technical support or questions about the admin dashboard:
1. Check the logs for error details
2. Verify database migrations are applied
3. Ensure all dependencies are installed
4. Contact the development team

---

**Note**: This admin dashboard is designed for internal use only and should not be accessible to public users. Always ensure proper security measures are in place when deploying to production.
