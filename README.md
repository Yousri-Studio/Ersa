# Ersa Training - Bilingual E-Learning Platform

A comprehensive bilingual (Arabic/English) e-learning platform built with Next.js and ASP.NET Core, featuring live sessions, PDF courses, secure payment processing, and automated email delivery.

## 🚀 Features

### Core Features
- **Bilingual Support**: Full Arabic and English localization with RTL support
- **Course Types**: Live sessions with Teams integration and self-paced PDF materials
- **Secure Payments**: HyperPay integration with Apple Pay, Mada support (extensible for Tabby/Tamara)
- **Email Automation**: SendGrid-powered bilingual email templates and notifications
- **Secure Content Delivery**: Protected PDF downloads with revocable links and download logging
- **Shopping Cart**: Guest and authenticated user cart management with merge functionality
- **Wishlist**: Authenticated user wishlist management
- **Interactive Maps**: Leaflet-powered geographic visualization for user analytics

### User Experience
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern UI**: Clean, professional interface with gradient text styling
- **SEO Optimized**: Server-side rendering with Next.js App Router
- **Real-time Updates**: React Query for efficient data fetching and caching
- **React Hooks Compliance**: All components follow React Rules of Hooks for consistent behavior

### Admin Features
- **Comprehensive Dashboard**: Real-time statistics, user analytics, and geographic insights
- **Course Management**: Create, edit, and manage live sessions and PDF courses with bilingual support
- **User Management**: Complete user account management with role-based permissions
- **Order Tracking**: Complete order and payment history with status management
- **Content Management**: Dynamic website content editing with multilingual support
- **Email Logs**: Track email delivery, opens, and clicks
- **Content Security**: Revokable download links with usage analytics

## 🏗️ Architecture

### Frontend (Next.js 14)
- **Framework**: Next.js with App Router
- **Internationalization**: next-intl for bilingual support
- **Styling**: Tailwind CSS with custom gradient utilities
- **State Management**: Zustand for auth and cart state
- **Data Fetching**: React Query for server state management
- **Forms**: React Hook Form with validation
- **Notifications**: React Hot Toast

### Backend (ASP.NET Core 8)
- **Framework**: ASP.NET Core Web API
- **Database**: Entity Framework Core with SQL Server
- **Authentication**: JWT with Identity framework
- **Email**: SendGrid with webhook support
- **Payments**: HyperPay integration (extensible architecture)
- **Storage**: Azure Blob Storage or local file storage
- **Logging**: Serilog with structured logging

## 📋 Prerequisites

- **Node.js** 18+ and npm/yarn
- **.NET 8 SDK**
- **SQL Server** (LocalDB for development)
- **SendGrid Account** (for emails)
- **HyperPay Account** (for payments)
- **Font Awesome 6 Pro License** (for icons)
- **Azure Storage Account** (optional, for cloud storage)
- **Git** (for version control)

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
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=ErsaTrainingDB;Trusted_Connection=true;MultipleActiveResultSets=true"
  },
  "Jwt": {
    "SecretKey": "your-super-secret-jwt-key-that-should-be-at-least-32-characters-long",
    "Issuer": "ErsaTraining.API",
    "Audience": "ErsaTraining.Web"
  },
  "SendGrid": {
    "ApiKey": "your-sendgrid-api-key",
    "FromEmail": "noreply@ersatraining.com",
    "FromName": "Ersa Training"
  },
  "HyperPay": {
    "ApiUrl": "https://test.oppwa.com",
    "EntityId": "your-hyperpay-entity-id",
    "AccessToken": "your-hyperpay-access-token"
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
FONTAWESOME_NPM_AUTH_TOKEN=your-fontawesome-pro-token
```

#### Font Awesome Pro Setup
You need a Font Awesome Pro license:
1. Get your npm token from https://fontawesome.com/account
2. Set the environment variable above

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

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh-token` - Token refresh

#### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/{slug}` - Get course details
- `GET /api/courses/{id}/sessions` - Get course sessions

#### Cart & Orders
- `POST /api/cart/init` - Initialize cart
- `POST /api/cart/items` - Add item to cart
- `POST /api/orders` - Create order
- `POST /api/payments/checkout` - Create payment checkout

#### Secure Content
- `GET /api/secure/materials/{token}` - Download protected materials

## 🎨 UI/UX Guidelines

### Typography
- **Headlines**: Use gradient text with "The Year of Handicrafts" font
- **Body Text**: Cairo font for all text content (supports Arabic and Latin)
- **Icons**: Font Awesome 6 Pro (Solid, Regular, Light styles)
- **Gradient**: `linear-gradient(270deg, #00AC96 31.94%, #693EB0 59.68%)`

### Colors
- **Primary**: Green tones (#22c55e family)
- **Secondary**: Purple tones (#a855f7 family)
- **Accent**: Gradient from teal to purple

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- RTL support for Arabic content

## 🔧 Development

### Project Structure

```
Ersa/
├── backend/                    # .NET Core API
│   ├── src/                   # Main API project
│   │   ├── Controllers/       # API controllers
│   │   ├── Data/             # EF Core context and entities
│   │   ├── DTOs/             # Data transfer objects
│   │   ├── Services/         # Business logic services
│   │   ├── Middleware/       # Custom middleware
│   │   └── Configuration/    # App configuration
│   ├── Utilities/            # Utility applications
│   └── VerifySuperAdminApp/  # Admin verification tool
├── frontend/                  # Next.js application
│   ├── app/[locale]/         # Next.js app router pages
│   │   ├── admin/           # Admin dashboard
│   │   ├── ar/              # Arabic locale
│   │   └── en/              # English locale
│   ├── components/           # React components
│   │   ├── auth/            # Authentication components
│   │   ├── forms/           # Form components
│   │   └── examples/        # Example components
│   ├── lib/                 # Utilities and stores
│   ├── locales/            # Translation files
│   └── styles/             # Global styles
├── .gitignore                # Git ignore rules
├── README.md                 # Main project documentation
└── ADMIN_DASHBOARD_README.md # Admin dashboard documentation
```

### Best Practices
- Use TypeScript for type safety
- Follow REST API conventions
- Implement proper error handling
- Use semantic HTML and ARIA labels
- Optimize for performance and SEO

## 🚀 Deployment

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