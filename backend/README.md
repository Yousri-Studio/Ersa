# Ersa Training Platform - Backend API

ASP.NET Core 9.0 RESTful API for the Ersa Training Platform, providing comprehensive course management, user authentication, and administrative functionality.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with role management
- **Course Management** - Full CRUD operations with binary image storage
- **User Management** - User registration, profile management, and role assignment
- **Admin Dashboard** - Statistics and analytics endpoints
- **File Upload** - Binary image storage for course thumbnails
- **Database Migrations** - Entity Framework Core with SQLite
- **API Documentation** - Swagger/OpenAPI integration
- **CORS Support** - Cross-origin resource sharing configuration

## 🏗️ Architecture

```
backend/src/
├── Controllers/          # API Controllers
│   ├── AuthController.cs     # Authentication endpoints
│   ├── CoursesController.cs  # Course management
│   ├── UsersController.cs    # User management
│   ├── AdminController.cs    # Admin dashboard
│   └── FileUploadController.cs # File upload handling
├── Data/                # Data Layer
│   ├── Entities/            # Entity models
│   ├── ErsaTrainingContext.cs # DbContext
│   └── Migrations/          # EF Core migrations
├── DTOs/                # Data Transfer Objects
│   ├── AuthDTOs.cs          # Authentication DTOs
│   ├── CourseDTOs.cs        # Course DTOs
│   └── UserDTOs.cs          # User DTOs
├── Configuration/       # App Configuration
│   └── JwtSettings.cs       # JWT configuration
└── Program.cs          # Application entry point
```

## 🛠️ Technology Stack

- **Framework**: ASP.NET Core 9.0
- **Database**: SQLite with Entity Framework Core
- **Authentication**: JWT Bearer tokens
- **Documentation**: Swagger/OpenAPI
- **Logging**: Built-in .NET logging
- **Validation**: Data Annotations and FluentValidation

## 🚀 Getting Started

### Prerequisites

- .NET SDK 9.0 or higher
- SQLite (included with .NET)

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend/src
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update database**
   ```bash
   dotnet ef database update
   ```

4. **Run the application**
   ```bash
   dotnet run
   ```

The API will be available at:
- **HTTP**: `http://localhost:5002`
- **Swagger UI**: `http://localhost:5002/swagger`

### Environment Configuration

#### appsettings.json
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ErsaTrainingDB.db"
  },
  "JwtSettings": {
    "SecretKey": "your-256-bit-secret-key-here",
    "Issuer": "ErsaTraining",
    "Audience": "ErsaTraining",
    "ExpirationInMinutes": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

#### appsettings.Development.json
```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

## 📊 Database Schema

### Core Entities

#### Users
```csharp
public class User
{
    public string Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string PasswordHash { get; set; }
    public UserRole Role { get; set; }
    public UserStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
```

#### Courses
```csharp
public class Course
{
    public string Id { get; set; }
    public string Slug { get; set; }
    public string TitleAr { get; set; }
    public string TitleEn { get; set; }
    public string SummaryAr { get; set; }
    public string SummaryEn { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; }
    public CourseType Type { get; set; }
    public CourseLevel Level { get; set; }
    public CourseCategory Category { get; set; }
    public byte[] Photo { get; set; } // Binary image storage
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}
```

### Database Migrations

```bash
# Create new migration
dotnet ef migrations add MigrationName

# Update database
dotnet ef database update

# Remove last migration
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script
```

## 🔐 Authentication & Authorization

### JWT Configuration
The API uses JWT Bearer tokens for authentication with the following claims:
- `sub` - User ID
- `email` - User email
- `role` - User role (User, Admin, SuperAdmin)
- `exp` - Token expiration

### Roles & Permissions
- **User** - Basic platform access
- **Admin** - Course and user management
- **SuperAdmin** - Full system access including user role management

### Protected Endpoints
```csharp
[Authorize(Roles = "Admin,SuperAdmin")]
public class AdminController : ControllerBase
{
    // Admin-only endpoints
}
```

## 📱 API Endpoints

### Authentication
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/refresh      # Token refresh
POST /api/auth/logout       # User logout
```

### Courses
```
GET    /api/courses              # Get courses (public)
GET    /api/courses/{id}         # Get course by ID
POST   /api/courses              # Create course (Admin)
PUT    /api/courses/{id}         # Update course (Admin)
DELETE /api/courses/{id}         # Delete course (Admin)
```

### Users (Admin only)
```
GET    /api/users               # Get users list
GET    /api/users/{id}          # Get user by ID
PUT    /api/users/{id}          # Update user
DELETE /api/users/{id}          # Delete user
```

### Admin Dashboard
```
GET /api/admin/dashboard-stats  # Dashboard statistics
GET /api/admin/users           # Admin user management
GET /api/admin/courses         # Admin course management
```

### File Upload
```
POST /api/fileupload/image          # Upload image file
POST /api/fileupload/convert-base64 # Convert base64 to binary
```

## 📝 API Documentation

### Swagger Integration
The API includes comprehensive Swagger documentation available at `/swagger` when running in development mode.

### Response Format
All API responses follow a consistent format:

**Success Response:**
```json
{
  "data": { ... },
  "message": "Success message",
  "success": true
}
```

**Error Response:**
```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "success": false
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🧪 Development

### Code Structure
- **Controllers** - Handle HTTP requests and responses
- **DTOs** - Data transfer objects for API communication
- **Entities** - Database entity models
- **Services** - Business logic layer
- **Repositories** - Data access layer

### Validation
Input validation using Data Annotations:
```csharp
public class CreateCourseRequest
{
    [Required]
    [MaxLength(200)]
    public string TitleEn { get; set; }
    
    [Required]
    [Range(0, double.MaxValue)]
    public decimal Price { get; set; }
}
```

### Error Handling
Global exception handling middleware for consistent error responses:
```csharp
app.UseMiddleware<ExceptionHandlingMiddleware>();
```

## 🚀 Deployment

### Production Build
```bash
dotnet publish -c Release -o ./publish
```

### Docker Support
```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY ./publish .
ENTRYPOINT ["dotnet", "ErsaTraining.API.dll"]
```

### Environment Variables
```bash
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="your-production-connection-string"
JwtSettings__SecretKey="your-production-secret-key"
```

## 📋 Testing

### Unit Tests
```bash
dotnet test
```

### Integration Tests
```bash
dotnet test --filter Category=Integration
```

### API Testing
Use tools like Postman or curl to test endpoints:
```bash
curl -X GET "http://localhost:5002/api/courses" \
  -H "Authorization: Bearer your-jwt-token"
```

## 🔧 Configuration

### CORS Policy
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
```

### Database Connection
SQLite database file is created automatically in the project directory as `ErsaTrainingDB.db`.

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   dotnet ef database update
   ```

2. **JWT Secret Key Error**
   - Ensure JWT secret key is at least 256 bits (32 characters)

3. **CORS Issues**
   - Check frontend URL in CORS policy configuration

4. **Migration Issues**
   ```bash
   dotnet ef migrations remove
   dotnet ef migrations add NewMigration
   ```

## 📞 Support

For technical issues:
1. Check the logs in the console output
2. Verify database connectivity
3. Ensure all required environment variables are set
4. Check Swagger documentation for API usage

## 🔄 Version History

- **v1.0.0** - Initial API with basic CRUD operations
- **v1.1.0** - Added JWT authentication and authorization
- **v1.2.0** - Implemented binary image storage and file upload
- **v1.3.0** - Enhanced admin dashboard with statistics

---

**Ersa Training Platform Backend API - Built with ASP.NET Core 9.0**
