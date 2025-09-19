# Ersa Training Admin Dashboard

## Overview

The Ersa Training Admin Dashboard is a comprehensive management system for the e-learning platform, providing administrators with powerful tools to manage courses, users, content, and system settings. The dashboard is fully integrated into the main Next.js 15 application with role-based access control and supports both Arabic and English languages.

**Repository**: [GitHub - Ersa Training Platform](https://github.com/your-username/Ersa)  
**Live Demo**: [Admin Dashboard](https://your-domain.com/admin)  
**Documentation**: [API Documentation](https://your-domain.com/api-docs)

> **Note**: The admin dashboard is only accessible to users with Admin or Super Admin privileges.

## ✨ Key Features

### 🔐 Security & Authentication
- **Role-based access control**: User, Admin, and Super Admin roles
- **JWT-based authentication**: Secure token-based authentication with refresh tokens
- **Protected routes**: All admin routes require proper authorization
- **Session management**: 8-hour session timeout with automatic logout
- **Activity logging**: Track admin actions for security and auditing

### 📊 Dashboard Overview
- **Real-time statistics**: Users, courses, orders, and revenue metrics
- **Visual analytics**: Charts and graphs for key performance indicators
- **Recent activity**: Latest user registrations, course enrollments, and orders
- **System health**: Monitor API status and server resources
- **Quick actions**: Common tasks accessible from the dashboard

### 👥 User Management
- **User directory**: View all users with advanced filtering and search
- **User profiles**: Detailed user information and activity history
- **Role management**: Assign and revoke admin privileges (Super Admin only)
- **Status control**: Activate, deactivate, or suspend user accounts
- **Bulk operations**: Import/export users, bulk status updates
- **Admin notes**: Add private notes about users (visible to admins only)
- **Password reset**: Force password reset for users

### 📚 Course Management
- **Course catalog**: Comprehensive list of all courses with filtering
- **Bilingual support**: Manage course content in Arabic and English
- **Course creation**: Step-by-step wizard for adding new courses
- **Media management**: Upload and manage course images and resources
- **Pricing & discounts**: Set course prices and manage discount codes
- **Categories & tags**: Organize courses with categories and tags
- **Batch operations**: Publish/unpublish multiple courses at once

### 🛒 Order & Payment Management
- **Order processing**: View and manage all orders in one place
- **Payment tracking**: Monitor payment status and history
- **Invoice generation**: Download professional PDF invoices
- **Refund processing**: Process full or partial refunds
- **Transaction history**: Detailed record of all financial transactions
- **Export capabilities**: Export order data to CSV/Excel

### 🎨 Content Management System
- **Page builder**: Drag-and-drop interface for creating pages
- **Bilingual editing**: Edit content in both Arabic and English with RTL support
- **Section templates**: Pre-built sections for common content types
- **Media library**: Centralized storage for all media files
- **Version control**: Track changes and revert to previous versions
- **Scheduled publishing**: Set future publish/unpublish dates
- **SEO management**: Meta tags and OpenGraph settings

### 📊 Reports & Analytics
- **Sales reports**: Revenue, orders, and conversion metrics
- **User analytics**: Engagement and retention statistics
- **Course performance**: Popular courses and completion rates
- **Custom reports**: Create and save custom report filters
- **Data export**: Export reports in multiple formats (PDF, CSV, Excel)

### ⚙️ System Configuration (Super Admin Only)
- **General settings**: Site name, logo, and contact information
- **Email templates**: Customize system emails
- **Payment gateways**: Configure payment providers and settings
- **API keys**: Manage third-party integrations
- **Maintenance mode**: Take the site offline for maintenance
- **Backup & restore**: Database and media backup tools

## 🔒 Access Control

### User Roles

#### Admin
- **Dashboard**: View all statistics and reports
- **User Management**: View and manage regular users
- **Course Management**: Full CRUD operations for courses
- **Content Management**: Edit website content and pages
- **Order Management**: Process orders and view transactions
- **Reports**: Generate and view reports

#### Super Admin
- **All Admin permissions**
- **User Management**: Create and manage admin users
- **Role Management**: Assign and revoke admin roles
- **System Configuration**: Access to all system settings
- **API Management**: Manage API keys and integrations
- **Audit Logs**: View system activity and admin actions

### Permission Matrix

| Feature | User | Admin | Super Admin |
|---------|------|-------|-------------|
| View Dashboard | ❌ | ✅ | ✅ |
| Manage Users | ❌ | Limited | ✅ |
| Manage Courses | ❌ | ✅ | ✅ |
| Manage Content | ❌ | ✅ | ✅ |
| Process Orders | ❌ | ✅ | ✅ |
| View Reports | ❌ | ✅ | ✅ |
| System Settings | ❌ | ❌ | ✅ |
| Manage Admins | ❌ | ❌ | ✅ |
| View Audit Logs | ❌ | Limited | ✅ |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- .NET 8 SDK
- SQL Server (or SQLite for development)
- Font Awesome Pro license (for icons)

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
cd ../../frontend
npm install
npm run dev
```

### 2. Access the Dashboard

1. Navigate to `http://localhost:3000/en/admin` or `http://localhost:3000/ar/admin`
2. Login with the default super admin credentials:
   - **Email**: superadmin@ersatraining.com
   - **Password**: ChangeMe123!

> **Security Note**: Change the default password immediately after first login.

### 3. Initial Setup

1. **Update Admin Profile**:
   - Change the default password
   - Add your contact information
   - Upload a profile picture

2. **Configure System Settings**:
   - Set up your organization details
   - Configure email settings
   - Set up payment gateways
   - Configure tax rates

3. **Create Additional Admin Users**:
   - Navigate to Users > Add New
   - Fill in user details
   - Assign appropriate role (Admin/Super Admin)
   - Set a strong temporary password

### 4. Environment Configuration

#### Development (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ErsaTraining;Trusted_Connection=True;MultipleActiveResultSets=true"
  },
  "JwtSettings": {
    "Secret": "your-jwt-secret-key-32-characters-minimum",
    "TokenLifetimeMinutes": 480,
    "RefreshTokenLifetimeDays": 7
  },
  "AdminSettings": {
    "DefaultSuperAdminEmail": "superadmin@ersatraining.com",
    "SessionTimeoutMinutes": 480,
    "RequireEmailVerification": false
  },
  "EmailSettings": {
    "FromEmail": "noreply@ersatraining.com",
    "FromName": "Ersa Training",
    "SmtpServer": "smtp.example.com",
    "Port": 587,
    "Username": "your-email@example.com",
    "Password": "your-email-password"
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

#### Production
For production, use environment variables or Azure Key Vault for sensitive information.

### 5. First Steps After Setup

1. **Customize the Dashboard**:
   - Upload your organization logo
   - Set your preferred color scheme
   - Configure dashboard widgets

2. **Set Up Content**:
   - Create your homepage content
   - Add your organization's about page
   - Set up contact information

3. **Create Your First Course**:
   - Navigate to Courses > Add New
   - Fill in course details in both languages
   - Upload course materials
   - Set pricing and availability

4. **Test the Checkout Process**:
   - Place a test order
   - Verify payment processing
   - Check email notifications

## 🔌 API Reference

### Authentication
- `POST /api/auth/login` - Admin login
  - Request: `{ "email": "admin@example.com", "password": "password" }`
  - Response: `{ "token": "jwt-token", "refreshToken": "refresh-token" }`

- `POST /api/auth/refresh-token` - Refresh JWT token
  - Request: `{ "token": "expired-jwt", "refreshToken": "refresh-token" }`
  - Response: `{ "token": "new-jwt", "refreshToken": "new-refresh-token" }`

### Dashboard
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
  - Response: 
    ```json
    {
      "totalUsers": 1250,
      "activeUsers": 843,
      "totalCourses": 45,
      "activeCourses": 38,
      "totalOrders": 567,
      "revenue": 125000,
      "recentOrders": [
        { "id": 1001, "user": "John Doe", "amount": 199.99, "status": "Completed" },
        { "id": 1002, "user": "Jane Smith", "amount": 149.99, "status": "Processing" }
      ]
    }
    ```

### Users
- `GET /api/admin/users` - Get paginated user list
  - Query Params: `page=1&pageSize=10&search=john&role=user&status=active`
  - Response: 
    ```json
    {
      "items": [
        {
          "id": "user-id",
          "email": "user@example.com",
          "fullName": "John Doe",
          "role": "user",
          "status": "active",
          "createdAt": "2023-01-01T00:00:00Z",
          "lastLogin": "2023-05-15T14:30:00Z"
        }
      ],
      "totalCount": 1,
      "page": 1,
      "pageSize": 10,
      "totalPages": 1
    }
    ```

- `GET /api/admin/users/{userId}` - Get user details
- `POST /api/admin/users` - Create new user
- `PUT /api/admin/users/{userId}` - Update user
- `DELETE /api/admin/users/{userId}` - Delete user (soft delete)
- `PUT /api/admin/users/{userId}/status` - Update user status
- `PUT /api/admin/users/{userId}/role` - Update user role (Super Admin only)

### Courses
- `GET /api/admin/courses` - Get paginated course list
  - Query Params: `page=1&pageSize=10&search=react&status=active&category=web`
  - Response: Similar paginated structure as users

- `GET /api/admin/courses/{courseId}` - Get course details
- `POST /api/admin/courses` - Create new course
- `PUT /api/admin/courses/{courseId}` - Update course
- `DELETE /api/admin/courses/{courseId}` - Delete course (soft delete)
- `POST /api/admin/courses/{courseId}/media` - Upload course media

### Orders
- `GET /api/admin/orders` - Get paginated order list
  - Query Params: `page=1&pageSize=10&status=completed&from=2023-01-01&to=2023-12-31`

- `GET /api/admin/orders/{orderId}` - Get order details
- `PUT /api/admin/orders/{orderId}/status` - Update order status
- `POST /api/admin/orders/{orderId}/refund` - Process refund
- `GET /api/admin/orders/{orderId}/invoice` - Generate invoice PDF

### Content Management
- `GET /api/admin/content/sections` - List all content sections
- `GET /api/admin/content/sections/{sectionId}` - Get section content
- `PUT /api/admin/content/sections/{sectionId}` - Update section content
- `GET /api/admin/content/history/{sectionId}` - Get section history
- `POST /api/admin/content/media` - Upload media file

### Reports
- `GET /api/admin/reports/sales` - Generate sales report
- `GET /api/admin/reports/users` - Generate user activity report
- `GET /api/admin/reports/courses` - Generate course performance report

### System Settings
- `GET /api/admin/settings` - Get all settings (Super Admin only)
- `PUT /api/admin/settings` - Update settings (Super Admin only)
- `GET /api/admin/settings/email-templates` - Get email templates
- `PUT /api/admin/settings/email-templates/{templateId}` - Update email template

## 🔒 Security Best Practices

### Authentication & Authorization
- **JWT Tokens**: Short-lived access tokens (8 hours) with refresh tokens (7 days)
- **Secure Storage**: Tokens stored in HTTP-only, Secure, SameSite=Strict cookies
- **Password Policy**: 
  - Minimum 12 characters
  - Require uppercase, lowercase, numbers, and special characters
  - Password history (last 5 passwords)
  - Account lockout after 5 failed attempts (30-minute lockout)

### Data Protection
- **Encryption**: All sensitive data encrypted at rest
- **Input Validation**: Whitelist input validation on all endpoints
- **CSRF Protection**: Anti-forgery tokens for state-changing operations
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Strict CORS policy allowing only trusted origins

### Audit & Logging
- **Activity Logs**: All admin actions are logged with timestamps and IP addresses
- **Sensitive Operations**: Critical operations require re-authentication
- **File Uploads**: Strict file type validation and virus scanning
- **Error Handling**: Generic error messages to prevent information leakage

### Secure Development
- **Dependencies**: Regular security updates with `npm audit` and `dotnet list package --vulnerable`
- **Secrets Management**: Environment variables for sensitive data, never committed to source control
- **API Security**:
  - All API responses include security headers (CSP, XSS-Protection, etc.)
  - No sensitive data in URLs (use POST body or headers)
  - Versioned API endpoints

### Regular Security Tasks
1. **Monthly**:
   - Rotate JWT signing keys
   - Review admin user access
   - Audit API keys and permissions

2. **Quarterly**:
   - Security penetration testing
   - Review and update dependencies
   - Rotate database credentials

3. **Annually**:
   - Security policy review
   - Staff security training
   - Full security audit

### Incident Response
1. **Detection**: Monitor for unusual activity
2. **Containment**: Isolate affected systems
3. **Eradication**: Remove threat and patch vulnerabilities
4. **Recovery**: Restore from clean backups
5. **Review**: Post-incident analysis and documentation

### Compliance
- **GDPR**: Right to be forgotten, data portability
- **PCI DSS**: Secure handling of payment information
- **Accessibility**: WCAG 2.1 AA compliance

## 🗄️ Database Schema

### Core Entities

#### User
```csharp
public class User : IdentityUser<Guid>
{
    // Identity fields
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? ProfileImageUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    public bool IsActive { get; set; } = true;
    
    // Admin fields
    public bool IsAdmin { get; set; }
    public bool IsSuperAdmin { get; set; }
    public string? AdminNotes { get; set; }
    public string? LastIpAddress { get; set; }
    public string? TimeZone { get; set; }
    
    // Navigation properties
    public ICollection<Course> CreatedCourses { get; set; } = new List<Course>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<ContentEdit> ContentEdits { get; set; } = new List<ContentEdit>();
    public ICollection<AuditLog> AuditLogs { get; set; } = new List<AuditLog>();
}
```

#### Course
```csharp
public class Course
{
    public Guid Id { get; set; }
    public string Slug { get; set; } = string.Empty;
    
    // Bilingual content
    public string TitleEn { get; set; } = string.Empty;
    public string TitleAr { get; set; } = string.Empty;
    public string DescriptionEn { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    
    // Course details
    public decimal Price { get; set; }
    public decimal? SalePrice { get; set; }
    public DateTime? SaleStartDate { get; set; }
    public DateTime? SaleEndDate { get; set; }
    public string? ImageUrl { get; set; }
    public string? VideoUrl { get; set; }
    public int DurationHours { get; set; }
    public int? MaxStudents { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; }
    public int SortOrder { get; set; }
    
    // Relationships
    public Guid? CategoryId { get; set; }
    public Category? Category { get; set; }
    public ICollection<Module> Modules { get; set; } = new List<Module>();
    public ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    
    // Audit fields
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public string? CreatedById { get; set; }
    public User? CreatedBy { get; set; }
}
```

#### Order
```csharp
public class Order
{
    public Guid Id { get; set; }
    public string OrderNumber { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public User User { get; set; } = null!;
    public decimal Subtotal { get; set; }
    public decimal TaxAmount { get; set; }
    public decimal DiscountAmount { get; set; }
    public decimal Total { get; set; }
    public string Currency { get; set; } = "SAR";
    public string Status { get; set; } = "Pending"; // Pending, Processing, Completed, Cancelled, Refunded
    public string? PaymentMethod { get; set; }
    public string? PaymentId { get; set; }
    public string? BillingAddress { get; set; }
    public string? ShippingAddress { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation properties
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Payment> Payments { get; set; } = new List<Payment>();
}
```

### JWT Claims
Admin roles and permissions are included in JWT tokens:

```csharp
// Add user claims
var claims = new List<Claim>
{
    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    new Claim(ClaimTypes.Email, user.Email ?? string.Empty),
    new Claim(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
    new Claim(ClaimTypes.Surname, user.LastName ?? string.Empty),
    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
    new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), 
        ClaimValueTypes.Integer64)
};

// Add admin role claims
if (user.IsSuperAdmin)
{
    claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin"));
    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
    claims.Add(new Claim("permissions", "all"));
}
else if (user.IsAdmin)
{
    claims.Add(new Claim(ClaimTypes.Role, "Admin"));
    // Add specific admin permissions
    claims.Add(new Claim("permissions", "manage_users,manage_courses,manage_orders"));
}
else
{
    claims.Add(new Claim(ClaimTypes.Role, "User"));
}

// Add custom claims
if (!string.IsNullOrEmpty(user.TimeZone))
{
    claims.Add(new Claim("timezone", user.TimeZone));
}
```

### Database Migrations

#### Create a new migration:
```bash
dotnet ef migrations add AddAdminFeatures
```

#### Apply migrations:
```bash
dotnet ef database update
```

#### Generate SQL script:
```bash
dotnet ef migrations script -o ./Migrations/script.sql
```

### Indexes
Key database indexes for performance:
1. Users: `Email`, `IsActive`, `IsAdmin`, `IsSuperAdmin`
2. Courses: `Slug`, `IsActive`, `IsFeatured`, `CategoryId`
3. Orders: `OrderNumber`, `UserId`, `Status`, `CreatedAt`
4. Content: `SectionKey`, `Language`, `IsActive`

### Data Seeding
Initial admin user is created during first run if no users exist:

```csharp
if (!_userManager.Users.Any())
{
    var adminUser = new User
    {
        UserName = "superadmin@ersatraining.com",
        Email = "superadmin@ersatraining.com",
        FirstName = "Super",
        LastName = "Admin",
        EmailConfirmed = true,
        IsActive = true,
        IsAdmin = true,
        IsSuperAdmin = true,
        CreatedAt = DateTime.UtcNow
    };

    var result = await _userManager.CreateAsync(adminUser, "ChangeMe123!");
    
    if (result.Succeeded)
    {
        _logger.LogInformation("Created default admin user");
    }
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
