# Ersa Training Frontend - Production Deployment Package

## 📦 Quick Start

This is a **production-ready** deployment package with **proxy-based backend connection**.

### 🚀 Deploy in 3 Steps

```bash
# 1. Install dependencies
npm install --production

# 2. Verify configuration
cat .env.production

# 3. Start the application
npm start
```

The application will be available at `http://localhost:3000`

## 📖 Documentation

- **[DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)** - Complete deployment guide
- **[BACKEND_CONNECTION_GUIDE.md](./BACKEND_CONNECTION_GUIDE.md)** - Backend connection details
- **[CHUNKERROR_FIX_DEPLOYMENT.md](./CHUNKERROR_FIX_DEPLOYMENT.md)** - Fix for ChunkLoadError (Oct 2025)

## ⚙️ Configuration

**Current Setup:** ✅ Proxy-based connection

```bash
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

**To change backend URL:** Edit `.env.production`

## 🔧 Production Commands

```bash
# Start production server
npm start

# Start with PM2 (recommended)
npm install -g pm2
pm2 start npm --name "ersa-frontend" -- start

# View logs
pm2 logs ersa-frontend
```

## 📋 System Requirements

- Node.js 18.x or later
- 2GB RAM minimum
- 500MB disk space

## 🌐 Deployment Platforms

✅ Node.js Server  
✅ Docker  
✅ Vercel  
✅ Netlify  
✅ Any platform supporting Next.js

## 📞 Support

See **DEPLOYMENT_INSTRUCTIONS.md** for detailed help.

---

## 🔧 Recent Updates

### October 9, 2025 - ChunkLoadError Fix
- **Fresh Build Generated:** BUILD_ID `Ch721H3E1gyDRUbZYA3GV`
- **Issue Fixed:** Static chunk 500 errors
- **web.config Updated:** Improved error handling
- **Deployment Guide:** See `CHUNKERROR_FIX_DEPLOYMENT.md`

---

**Build Date:** October 9, 2025  
**Version:** Production Ready (ChunkError Fixed)  
**Backend Connection:** Proxy ✅


