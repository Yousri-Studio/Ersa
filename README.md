# Ersa Training Platform

A comprehensive bilingual e-learning platform built with Next.js frontend and ASP.NET Core backend, featuring course management, user authentication, admin dashboard, and complete content management system with Arabic and English support.

## 🚀 Features

### Core Features
- **Bilingual Content Management** - Complete support for Arabic and English content with RTL support
- **User Authentication & Authorization** - JWT-based auth with role-based access control
- **Course Management** - Full CRUD operations with binary image storage
- **Admin Dashboard** - Comprehensive admin interface with statistics and management tools
- **Multi-language Support** - Seamless Arabic and English localization
- **Invoice System** - Professional PDF invoice generation with Ersa branding
- **Checkout Process** - Secure checkout with role-based access control
- **Responsive Design** - Mobile-first responsive UI with RTL support
- **Content Management** - Dynamic content editing for all website sections

### User Experience
- **Bilingual Interface**: Seamless switching between Arabic and English with RTL support
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with gradient text styling and animations
- **SEO Optimized**: Server-side rendering with Next.js App Router
- **Real-time Updates**: React Query for efficient data fetching and caching
- **Accessibility**: ARIA labels and semantic HTML for better accessibility
- **Performance Optimized**: Code splitting and lazy loading for fast page loads

### Admin Features
- **Comprehensive Dashboard**: Real-time statistics, user analytics, and geographic insights
- **Course Management**: Create, edit, and manage live sessions and PDF courses with bilingual support
- **User Management**: Complete user account management with role-based permissions (User, Admin, SuperAdmin)
- **Order & Invoice Management**: Complete order tracking with PDF invoice generation
- **Content Management**: Dynamic website content editing with live preview
- **Bilingual Support**: Manage content in both Arabic and English with RTL support
- **Security**: Role-based access control with JWT authentication
- **System Settings**: Configure platform-wide settings and defaults

## 🏗️ Architecture

### Frontend (Next.js 15)
- **Framework**: Next.js 15 with App Router and Server Components
- **Internationalization**: next-intl for comprehensive bilingual support (Arabic/English)
- **Styling**: Tailwind CSS with custom gradient utilities and RTL support
- **State Management**: Zustand for client state, React Query for server state
- **Form Handling**: React Hook Form with validation
- **PDF Generation**: html2canvas and jsPDF for invoice generation
- **UI Components**: Reusable, accessible components with TypeScript support
- **Animations**: Framer Motion for smooth transitions and interactions

### Backend (ASP.NET Core 8)
- **Framework**: ASP.NET Core 8 Web API
- **Database**: Entity Framework Core with SQLite (development) and SQL Server (production)
- **Authentication**: JWT token-based authentication with role-based authorization
- **API Design**: RESTful endpoints with proper HTTP status codes and validation
- **CORS**: Configured for cross-origin requests from frontend
- **Logging**: Structured logging with Serilog
- **Data Transfer**: DTOs with validation and mapping using AutoMapper
- **File Handling**: Binary file storage with proper content type handling

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **.NET 8 SDK**
- **SQLite** (for development database)
- **SQL Server** (for production)
- **Git** (for version control)
- **Code Editor** (VS Code with C# and TypeScript extensions recommended)
- **Font Awesome Pro** (for premium icons)

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/Ersa.git
cd Ersa
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend/src
dotnet restore
```

#### Configure Settings
Create `backend/src/appsettings.Development.json` (this file is gitignored for security):
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=ErsaTraining.db"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long",
    "Issuer": "ErsaTraining.API",
    "Audience": "ErsaTraining.Web"
  }
}
```

#### Run Database Migrations
```bash
cd backend/src
dotnet ef database update
```

#### Start the API
```bash
dotnet run
```
The API will be available at `http://localhost:5002`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Configure Environment
Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api
```

#### Start the Development Server
```bash
npm run dev
# or run on specific port
npx next dev -p 8080
```
The frontend will be available at `http://localhost:3000` (or `http://localhost:8080` if using custom port)

## 🌐 API Documentation

The API includes Swagger documentation available at `http://localhost:5002/swagger` when running in development mode.

### Key Endpoints

#### Authentication & User Management
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh
- `GET /api/users/me` - Get current user profile

#### Courses
- `GET /api/courses` - List courses with optional filters
  - Query parameters: `type`, `activeOnly`, `query`, `category`
- `GET /api/courses/{slug}` - Get course details by slug
- `GET /api/courses/{id}` - Get course by ID

#### Content Management
- `GET /api/content/{section}` - Get content for a specific section
- `POST /api/content/update` - Update content (Admin only)
- `GET /api/content/templates` - Get available content templates

#### Orders & Invoices
- `POST /api/orders` - Create a new order
- `GET /api/orders/{orderId}` - Get order details
- `GET /api/orders/{orderId}/invoice` - Generate invoice PDF

#### Admin Endpoints
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/users` - List users (Admin only)
- `PUT /api/admin/users/{userId}/role` - Update user role (Super Admin only)

## 🎨 UI/UX Guidelines

### Typography
- **Headlines**: Gradient text with "The Year of Handicrafts" font
- **Body Text**: Cairo font (supports Arabic and Latin scripts)
- **Monospace**: Fira Code for code snippets and technical content
- **Icons**: Font Awesome 6 Pro (Solid, Regular, Light styles)
- **Gradient**: `linear-gradient(270deg, #00AC96 31.94%, #693EB0 59.68%)`

### Colors
- **Primary**: Green tones (`#00AC96` to `#22c55e`)
- **Secondary**: Purple tones (`#693EB0` to `#a855f7`)
- **Accent**: Gradient from teal to purple
- **Background**: Light mode (`#ffffff`) and dark mode (`#0f172a`)
- **Text**: High contrast for readability (`#1e293b` for light, `#f8fafc` for dark)

### Responsive Design
- Mobile-first approach with progressive enhancement
- Breakpoints: 
  - `sm`: 640px
  - `md`: 768px  
  - `lg`: 1024px
  - `xl`: 1280px
  - `2xl`: 1536px
- RTL support for Arabic content with automatic layout flipping
- Touch-friendly interactive elements (minimum 44×44px)
- Reduced motion preferences respected

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation support
- ARIA labels and roles
- Color contrast ratio ≥ 4.5:1 for normal text
- Skip to main content links
- Focus indicators for keyboard users
- Reduced motion support

## 📚 Documentation

For detailed documentation, please refer to the following resources:

- [Workflow Diagrams](./docs/workflow-diagrams.md) - Visual representations of key processes and system architecture
- [Admin Dashboard Guide](./ADMIN_DASHBOARD_README.md) - Complete admin interface documentation
- [Frontend Documentation](./frontend/README.md) - Frontend development guide
- [Backend Documentation](./backend/README.md) - Backend API documentation
- [API Documentation](http://localhost:5002/swagger) - Interactive API documentation (when running locally)

## 🔧 Development

### Project Structure

```
Ersa/
├── backend/                    # .NET Core API
│   ├── src/                   # Main API project
│   │   ├── Controllers/       # API controllers
│   │   │   ├── Admin/        # Admin-specific endpoints
│   │   │   ├── Auth/         # Authentication endpoints
│   │   │   ├── Content/      # Content management
│   │   │   ├── Courses/      # Course management
│   │   │   └── Users/        # User management
│   │   ├── Data/             # EF Core context and entities
│   │   ├── DTOs/             # Data transfer objects
│   │   ├── Services/         # Business logic services
│   │   ├── Middleware/       # Custom middleware
│   │   └── Configuration/    # App configuration
│   ├── Utilities/            # Utility applications
│   └── VerifySuperAdminApp/  # Admin verification tool
│
├── frontend/                  # Next.js application
│   ├── app/                  # Next.js app router
│   │   ├── [locale]/         # Internationalized routes
│   │   │   ├── (auth)/      # Authentication pages
│   │   │   ├── admin/       # Admin dashboard
│   │   │   ├── courses/     # Course pages
│   │   │   ├── checkout/    # Checkout process
│   │   │   └── ...
│   │   └── api/             # API routes
│   │
│   ├── components/           # Reusable UI components
│   │   ├── admin/           # Admin components
│   │   ├── auth/            # Authentication components
│   │   ├── cart/            # Shopping cart components
│   │   ├── checkout/        # Checkout components
│   │   ├── courses/         # Course components
│   │   ├── invoice/         # Invoice generation
│   │   ├── layout/          # Layout components
│   │   └── ui/              # Base UI components
│   │
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and stores
│   │   ├── api/            # API clients
│   │   ├── auth/           # Authentication logic
│   │   └── stores/         # State management
│   │
│   ├── locales/             # Translation files
│   │   ├── ar/             # Arabic translations
│   │   └── en/             # English translations
│   │
│   ├── public/              # Static assets
│   └── styles/              # Global styles and themes
│
├── .github/                 # GitHub workflows and templates
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── README.md               # Main project documentation
└── ADMIN_DASHBOARD_README.md # Admin dashboard documentation
```

### Development Best Practices

#### Code Quality
- **Type Safety**: Full TypeScript implementation with strict mode
- **Code Style**: ESLint and Prettier for consistent code formatting
- **Testing**: Unit tests with Jest and React Testing Library
- **Documentation**: JSDoc for functions and components
- **Error Handling**: Consistent error handling with proper messages

#### Performance
- **Code Splitting**: Dynamic imports for route-based code splitting
- **Image Optimization**: Next.js Image component for optimized images
- **Bundle Analysis**: @next/bundle-analyzer for bundle size monitoring
- **Caching**: React Query for server state caching
- **Lazy Loading**: Components and libraries loaded on demand

#### Security
- **Input Validation**: Validate all user inputs on both client and server
- **Authentication**: JWT with secure HTTP-only cookies
- **CORS**: Configured to allow requests only from trusted origins
- **Dependencies**: Regular security updates with `npm audit`
- **Secrets**: Environment variables for sensitive data

#### Accessibility
- **Semantic HTML**: Proper use of HTML5 elements
- **Keyboard Navigation**: Full keyboard support
- **ARIA**: Proper ARIA attributes for complex components
- **Color Contrast**: WCAG 2.1 AA compliance
- **Screen Reader**: Tested with NVDA and VoiceOver

## 🚀 Deployment

### Frontend Deployment

#### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Set up build command: `npm run build`
4. Set output directory: `.next`
5. Enable automatic deployments from main branch

#### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com/api
NEXTAUTH_URL=https://your-frontend-url.com
NEXTAUTH_SECRET=your-secret-key
# Add other required environment variables
```

### Backend Deployment

#### Azure App Service
1. Create a new Web App in Azure Portal
2. Configure deployment from GitHub/GitHub Actions
3. Set application settings:
   - `ASPNETCORE_ENVIRONMENT=Production`
   - Database connection string
   - JWT secret key
   - Other required settings

#### Docker (Alternative)
```dockerfile
# Dockerfile for backend
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["backend/src/Ersa.API/Ersa.API.csproj", "backend/src/Ersa.API/"]
RUN dotnet restore "backend/src/Ersa.API/Ersa.API.csproj"
COPY . .
WORKDIR "/src/backend/src/Ersa.API"
RUN dotnet build "Ersa.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Ersa.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Ersa.API.dll"]
```

### Database Setup
1. **Development**: SQLite (included)
2. **Production**: 
   - Azure SQL Database
   - Configure connection string in app settings
   - Run migrations on startup

### CI/CD Pipeline
Example GitHub Actions workflow (`.github/workflows/deploy.yml`):
```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    # Setup .NET
    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 8.0.x
    
    # Restore dependencies
    - name: Restore dependencies
      run: dotnet restore
      working-directory: ./backend/src
    
    # Build
    - name: Build
      run: dotnet build --no-restore --configuration Release
      working-directory: ./backend/src
    
    # Publish
    - name: Publish
      run: |
        dotnet publish \
          --no-restore \
          --configuration Release \
          --output ../../publish
      working-directory: ./backend/src
    
    # Deploy to Azure Web App
    - name: Deploy to Azure Web App
      uses: azure/webapps-deploy@v2
      with:
        app-name: 'your-app-name'
        slot-name: 'production'
        publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
        package: ./publish
```

### Monitoring
1. **Application Insights**: For application performance monitoring
2. **Azure Monitor**: For infrastructure monitoring
3. **Logging**: Serilog with file and console sinks
4. **Error Tracking**: Sentry for error tracking and reporting

### Scaling
- **Horizontal Scaling**: Multiple instances behind a load balancer
- **Caching**: Distributed caching with Redis
- **CDN**: For static assets and media files
- **Database**: Read replicas for read-heavy workloads

### Backup Strategy
1. **Database**: Automated daily backups with 30-day retention
2. **Media Files**: Regular backup to Azure Blob Storage
3. **Configuration**: Version-controlled configuration with secrets in Azure Key Vault

### Maintenance
- **Updates**: Regular dependency updates with Dependabot
- **Security Patches**: Automatic security updates
- **Monitoring**: Uptime monitoring with status page
- **Documentation**: Keep documentation up-to-date with changes

### Environment Configuration

#### Development
- Backend runs on `http://localhost:5002`
- Frontend runs on `http://localhost:3000` or `http://localhost:8080`
- Uses LocalDB for database
- Test credentials for payment gateway

#### Production

**Backend Deployment:**
1. Configure production settings in `appsettings.Production.json`
2. Set up Azure SQL Database or SQL Server
3. Configure SendGrid and HyperPay production credentials
4. Deploy to Azure App Service or IIS
5. Ensure SSL certificates are properly configured

**Frontend Deployment:**
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting service
3. Configure environment variables for production API URL
4. Set up custom domain and SSL

### Git Workflow

```bash
# Clone the repository
git clone https://github.com/your-username/Ersa.git

# Create a feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "Add your feature description"

# Push to your branch
git push origin feature/your-feature-name

# Create a pull request on GitHub
```

## 🔒 Security

- JWT tokens with configurable expiration
- Password hashing with bcrypt
- SQL injection protection with EF Core
- XSS protection with Content Security Policy
- CORS configuration for allowed origins
- Secure file downloads with token validation
- Webhook signature verification

## 📧 Email Templates

The system includes bilingual email templates for:
- Welcome emails
- Live session details
- Session reminders (24h and 1h before)
- Course materials delivery
- Order confirmations

## 💳 Payment Integration

### Supported Payment Methods
- **HyperPay**: Credit cards, Apple Pay, Mada
- **Extensible**: Architecture supports adding Tabby, Tamara, and other providers

### Payment Flow
1. User adds items to cart
2. Creates order
3. Redirects to payment gateway
4. Webhook processes payment result
5. Creates enrollments on successful payment
6. Sends confirmation emails

## 📊 Analytics & Logging

- Structured logging with Serilog
- Email delivery tracking with SendGrid webhooks
- Download analytics for course materials
- User activity tracking
- Payment transaction logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🔄 Version Control

### Git Ignore
The project includes a comprehensive `.gitignore` file that excludes:
- **Node.js**: `node_modules/`, build artifacts, cache files
- **.NET**: `bin/`, `obj/`, user-specific files, build outputs
- **Database**: `*.db`, `*.sqlite` files
- **Environment**: `.env*` files with sensitive data
- **IDE**: `.vs/`, `.vscode/`, `.idea/` directories
- **OS**: `.DS_Store`, `Thumbs.db` system files

### Repository Structure
- **Main branch**: Production-ready code
- **Develop branch**: Integration branch for features
- **Feature branches**: Individual feature development
- **Release branches**: Preparation for production releases

## 📄 License

This project is proprietary software for Ersa Training.

## 📞 Support

For technical support or questions:
- **Email**: support@ersatraining.com
- **GitHub Issues**: Use the repository's issue tracker
- **Documentation**: See `ADMIN_DASHBOARD_README.md` for admin-specific docs
- **Wiki**: [Project Wiki](https://github.com/your-username/Ersa/wiki)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

---

**Built with ❤️ for Ersa Training**