# Ersa Training Frontend

This is the frontend application for the Ersa Training e-learning platform built with Next.js 14, featuring bilingual support (Arabic/English) and modern UI components.

## 🚀 Features

- **Bilingual Support**: Full Arabic and English localization with RTL support
- **Modern UI**: Cairo font family with Font Awesome 6 Pro icons
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **State Management**: Zustand for client state, React Query for server state
- **Authentication**: JWT-based auth with automatic cart merging

## 🛠️ Prerequisites

- Node.js 18+ and npm/yarn
- Font Awesome 6 Pro license and npm token

## 📦 Setup

### 1. Font Awesome Pro Setup

You need a Font Awesome Pro license to use the pro icons. Follow these steps:

1. Get your Font Awesome Pro npm token from https://fontawesome.com/account
2. Set the environment variable:
   ```bash
   export FONTAWESOME_NPM_AUTH_TOKEN=your-token-here
   ```
3. Or create a `.env.local` file:
   ```env
   FONTAWESOME_NPM_AUTH_TOKEN=your-token-here
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=https://localhost:7001/api
FONTAWESOME_NPM_AUTH_TOKEN=your-fontawesome-pro-token
```

### 4. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## 🎨 Design System

### Typography
- **Primary Font**: Cairo (Google Fonts) - Supports Arabic and Latin scripts
- **Gradient Headers**: "The Year of Handicrafts" font with custom gradient
- **Font Weights**: 200, 300, 400, 500, 600, 700, 800, 900

### Icons
- **Font Awesome 6 Pro**: Solid, Regular, and Light icon styles
- **Icon Usage**: Consistent sizing and styling across components

### Colors
- **Primary**: Green tones (#22c55e family)
- **Secondary**: Purple tones (#a855f7 family)
- **Gradient**: `linear-gradient(270deg, #00AC96 31.94%, #693EB0 59.68%)`

### Responsive Breakpoints
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px

## 🌐 Internationalization

### Supported Locales
- English (`en`) - Default
- Arabic (`ar`) - RTL support

### Route Structure
- English: `/en/...`
- Arabic: `/ar/...`

### Translation Files
- `locales/en.json` - English translations
- `locales/ar.json` - Arabic translations

## 📱 Components

### Layout Components
- `Header` - Navigation with language switcher and user menu
- `Footer` - Site footer with social links
- `LanguageSwitcher` - Locale switching component

### UI Components
- `CourseCard` - Course display card with actions
- `LoadingSpinner` - Loading state component
- Various form components with validation

### Page Components
- Home page with hero, featured courses, stats, and testimonials
- Authentication pages (login/register)
- Course catalog and detail pages
- Shopping cart and checkout flow
- User profile and dashboard

## 🔧 Development

### Code Structure
```
frontend/
├── app/[locale]/          # Next.js app router pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── home/             # Home page sections
│   ├── layout/           # Layout components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and stores
│   ├── api.ts            # API client and types
│   ├── auth-store.ts     # Authentication state
│   ├── cart-store.ts     # Shopping cart state
│   └── fontawesome.ts    # Font Awesome configuration
├── locales/              # Translation files
└── styles/               # Global styles
```

### State Management
- **Authentication**: Zustand store with persistence
- **Shopping Cart**: Zustand store with local storage
- **Server State**: React Query for API data fetching
- **Form State**: React Hook Form with validation

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: Pre-built component classes
- **RTL Support**: Automatic layout adjustment for Arabic
- **Dark Mode**: Ready for future implementation

## 🚀 Build and Deploy

### Build for Production
```bash
npm run build
```

### Start Production Server
```bash
npm start
```

### Deployment
The app can be deployed to:
- Vercel (recommended for Next.js)
- Netlify
- Any Node.js hosting service

## 🔍 Font Awesome Icons Used

### Navigation & UI
- `bars`, `xmark` - Mobile menu toggle
- `user`, `shopping-cart` - User and cart icons
- `language` - Language switcher
- `arrow-right`, `arrow-left` - Navigation arrows

### Course & Learning
- `graduation-cap` - Learning/education
- `heart` (regular) - Wishlist
- `clock` - Time/schedule
- `users` - Capacity/participants
- `video`, `book` - Course types

### Authentication
- `eye`, `eye-slash` - Password visibility toggle
- `envelope` - Email
- `lock` - Security/password

## 📄 License

This project is proprietary software for Ersa Training.

---

**Built with Cairo font and Font Awesome 6 Pro**