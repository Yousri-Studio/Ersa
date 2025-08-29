# Ersa Training Admin Dashboard

## Overview

The Ersa Training Admin Dashboard is a comprehensive management system that allows administrators and super administrators to manage all aspects of the e-learning platform. The dashboard is integrated into the main Next.js application but requires proper authentication and authorization to access.

**Repository**: [GitHub - Ersa Training Platform](https://github.com/your-username/Ersa)
**Live Demo**: [Admin Dashboard](https://your-domain.com/admin)

## Features

### 🔐 Security & Authentication
- **Role-based access control**: Admin and Super Admin roles
- **JWT-based authentication**: Secure token-based authentication
- **Protected routes**: All admin routes require proper authorization
- **Session management**: Automatic token refresh and logout
- **React Hooks Compliance**: All components follow React Rules of Hooks for consistent behavior

### 📊 Dashboard Overview
- **Real-time statistics**: Total users, courses, orders, and revenue
- **Recent activity**: Latest users and orders
- **Performance metrics**: Active users, course completion rates
- **Revenue tracking**: Total and average order values
- **Geographic analytics**: Interactive Leaflet maps showing user distribution
- **Fallback data**: Graceful handling of API failures with demo data

### 👥 User Management
- **User listing**: View all users with pagination and search
- **User status management**: Activate, deactivate, or suspend users
- **Role management**: Assign admin and super admin roles (Super Admin only)
- **User details**: View user information, registration date, last login
- **Admin notes**: Add internal notes about users
- **User creation**: Add new users with role assignment
- **Bulk operations**: Manage multiple users efficiently

### 📚 Course Management
- **Course listing**: View all courses with pagination and search
- **Course status**: Activate or deactivate courses
- **Course details**: View course information, pricing, and status
- **Course editing**: Full CRUD operations with bilingual support
- **Course creation**: Add new courses with Arabic and English titles/descriptions
- **Price management**: Set and update course pricing

### 🛒 Order Management
- **Order listing**: View all orders with filtering and pagination
- **Order status management**: Update order status (Pending, Processing, Completed, etc.)
- **Order details**: View order information, customer details, and amounts
- **Date filtering**: Filter orders by date range
- **Invoice generation**: Download order invoices (coming soon)
- **Real-time updates**: Status changes reflect immediately

### 🎨 Content Management
- **Dynamic content editing**: Manage website content sections
- **Bilingual support**: Edit content in both Arabic and English
- **Section management**: Hero, FAQ, testimonials, and more
- **Live preview**: See changes before publishing
- **Content versioning**: Track content modification history

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

### 1. Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/your-username/Ersa.git
cd Ersa

# Backend setup
cd backend/src
dotnet restore
dotnet ef database update
dotnet run

# Frontend setup (in new terminal)
cd frontend
npm install
npm run dev
```

### 2. Access the Dashboard

1. Navigate to `http://localhost:8080/en/admin` or `http://localhost:8080/ar/admin`
2. Login with admin credentials:
   - **Email**: superadmin@ersatraining.com
   - **Password**: SuperAdmin123!

### 3. Create Additional Admin Users

Super admins can create additional admin users through the dashboard or by using the `VerifySuperAdminApp` utility in the backend.

### 4. Environment Configuration

Ensure your `appsettings.Development.json` includes admin-specific settings:
```json
{
  "AdminSettings": {
    "DefaultSuperAdminEmail": "admin@ersatraining.com",
    "SessionTimeoutMinutes": 480
  }
}
```

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
├── orders/
│   └── page.tsx        # Order management
└── settings/
    └── page.tsx        # System settings (Super Admin only)
```

### Component Structure
```
frontend/components/
├── auth/
│   ├── LoginForm.tsx   # Admin login form
│   └── AuthGuard.tsx   # Route protection
├── forms/
│   ├── UserForm.tsx    # User management forms
│   └── CourseForm.tsx  # Course management forms
└── admin/
    ├── Sidebar.tsx     # Admin navigation
    ├── Header.tsx      # Admin header
    └── Dashboard.tsx   # Dashboard components
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

### Git Workflow for Admin Features

```bash
# Create feature branch
git checkout -b feature/admin-new-feature

# Make changes
git add .
git commit -m "feat(admin): add new admin feature"

# Push and create PR
git push origin feature/admin-new-feature
```

### Adding New Features
1. **Backend**: Add endpoints in `backend/src/Controllers/AdminController.cs`
2. **DTOs**: Create corresponding DTOs in `backend/src/DTOs/AdminDTOs.cs`
3. **Services**: Add business logic in `backend/src/Services/AdminService.cs`
4. **Frontend API**: Add functions in `frontend/lib/admin-api.ts`
5. **Components**: Create React components in `frontend/components/admin/`
6. **Pages**: Add pages in `frontend/app/[locale]/admin/`
7. **Navigation**: Update `frontend/app/[locale]/admin/layout.tsx`

### File Organization
- **Controllers**: RESTful endpoints with proper HTTP status codes
- **Services**: Business logic separated from controllers
- **DTOs**: Data transfer objects for API communication
- **Components**: Reusable UI components with TypeScript
- **Pages**: Next.js pages with proper SEO and metadata

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
   - Ensure user has admin role in database
   - Check JWT token validity and expiration
   - Verify user status is Active
   - Clear browser cache and cookies

2. **API Connection Issues**
   - Verify backend is running on `http://localhost:5002`
   - Check CORS configuration in `Program.cs`
   - Ensure firewall isn't blocking connections
   - Check network connectivity

3. **Database Migration Issues**
   - Run `dotnet ef database update` in `backend/src/`
   - Check migration files in `Data/Migrations/`
   - Verify connection string in `appsettings.json`
   - Ensure SQL Server/LocalDB is running

4. **Frontend Build Issues**
   - Clear Next.js cache: `rm -rf .next`
   - Reinstall dependencies: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run type-check`

### Logs and Debugging
- **Backend logs**: `backend/src/logs/` directory
- **Frontend errors**: Browser developer console
- **Admin actions**: Logged to database audit table
- **API requests**: Network tab in browser dev tools

### Development Tools
- **Database**: Use SQL Server Management Studio or Azure Data Studio
- **API Testing**: Swagger UI at `http://localhost:5002/swagger`
- **Frontend**: React Developer Tools browser extension
- **Git**: Use GitHub Desktop or command line

## Future Enhancements

### Planned Features
- [ ] **Advanced Analytics**: Revenue charts, user engagement metrics
- [ ] **Bulk Operations**: Mass user management, course updates
- [ ] **Email Notifications**: Admin action notifications via SendGrid
- [ ] **Audit Trail**: Complete activity logging and history
- [ ] **Advanced Search**: Full-text search across all entities
- [ ] **Export Functionality**: CSV, PDF, Excel exports
- [ ] **Real-time Notifications**: WebSocket-based updates
- [ ] **Mobile Admin App**: React Native or PWA version
- [ ] **Content Management**: Rich text editor for course descriptions
- [ ] **File Management**: Upload and manage course materials

### Technical Improvements
- [ ] **Performance**: Redis caching, query optimization
- [ ] **Real-time Updates**: SignalR integration
- [ ] **Advanced Permissions**: Granular role-based access
- [ ] **Multi-language Admin**: Arabic/English admin interface
- [ ] **Dark Mode**: Theme switching capability
- [ ] **API Versioning**: Backward compatibility support
- [ ] **Unit Testing**: Comprehensive test coverage
- [ ] **CI/CD Pipeline**: Automated testing and deployment

### Infrastructure
- [ ] **Docker Support**: Containerized deployment
- [ ] **Monitoring**: Application performance monitoring
- [ ] **Backup Strategy**: Automated database backups
- [ ] **Security Scanning**: Automated vulnerability checks

## Version Control & Deployment

### Git Ignore
The admin dashboard files are included in the main project `.gitignore`:
- Configuration files with sensitive data are excluded
- Build artifacts and temporary files are ignored
- Database files and logs are not committed

### Deployment Checklist
- [ ] Update production configuration files
- [ ] Run database migrations
- [ ] Configure SSL certificates
- [ ] Set up monitoring and logging
- [ ] Test admin functionality in staging
- [ ] Configure backup procedures

## Support

For technical support or questions about the admin dashboard:

### Self-Help
1. **Check Logs**: Review backend logs in `backend/src/logs/`
2. **Verify Setup**: Ensure database migrations are applied
3. **Dependencies**: Confirm all packages are installed
4. **Documentation**: Review this README and main project docs

### Getting Help
- **GitHub Issues**: [Create an issue](https://github.com/your-username/Ersa/issues)
- **Email Support**: support@ersatraining.com
- **Development Team**: Contact via internal channels
- **Wiki**: [Project Wiki](https://github.com/your-username/Ersa/wiki)

### Reporting Bugs
When reporting issues, include:
- Steps to reproduce the problem
- Expected vs actual behavior
- Browser and version information
- Console error messages
- Screenshots if applicable

---

**Security Note**: This admin dashboard is designed for internal use only and should not be accessible to public users. Always ensure proper security measures are in place when deploying to production.

**Built with ❤️ for Ersa Training**
