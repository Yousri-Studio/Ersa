# 🚀 Production Deployment Package - Proxy Ready

This is a production-ready deployment package for the Ersa Training Frontend, configured to use **proxy-based backend connection**.

## 📦 Package Contents

```
ProxyDeploymentReady/
├── .next/                      # Production build output
├── public/                     # Static assets (images, fonts, etc.)
├── messages/                   # Internationalization messages (en, ar)
├── locales/                    # Locale configurations
├── package.json                # Dependencies list
├── package-lock.json           # Locked dependency versions
├── next.config.js              # Next.js configuration
├── .env.production             # Production environment variables (PROXY ENABLED)
├── i18n.ts                     # i18n configuration
├── middleware.ts               # Next.js middleware
├── tsconfig.json               # TypeScript configuration
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── DEPLOYMENT_INSTRUCTIONS.md  # This file
└── BACKEND_CONNECTION_GUIDE.md # Backend connection documentation
```

## 🔧 Pre-Deployment Configuration

### ✅ Current Configuration (Proxy-Based)

The package is **already configured** to use the proxy approach:

**File: `.env.production`**
```bash
NODE_ENV=production
NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=
BACKEND_API_URL=http://api.ersa-training.com/api
```

This means:
- Frontend will call: `/api/proxy?endpoint=/courses`
- Proxy will forward to: `http://api.ersa-training.com/api/courses`
- No CORS issues, backend URL hidden from client

### 🔄 Change Backend URL (if needed)

If your backend URL is different, edit `.env.production`:

```bash
# For HTTP backend
BACKEND_API_URL=http://your-backend-url.com/api

# For HTTPS backend (recommended)
BACKEND_API_URL=https://your-backend-url.com/api
```

**Important:** Keep `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=` unchanged to use the proxy!

## 📋 Deployment Steps

### Option 1: Node.js Server Deployment

#### Step 1: Install Node.js
Ensure Node.js 18.x or later is installed on your server:
```bash
node --version  # Should be v18.x or higher
```

#### Step 2: Upload Files
Upload the entire `ProxyDeploymentReady` folder to your server.

#### Step 3: Install Dependencies
```bash
cd ProxyDeploymentReady
npm install --production
```

#### Step 4: Start the Application
```bash
# Production mode
npm start

# Or with PM2 (recommended for production)
npm install -g pm2
pm2 start npm --name "ersa-frontend" -- start
pm2 save
pm2 startup
```

The application will run on **port 3000** by default.

#### Step 5: Configure Reverse Proxy (Nginx/Apache)

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name ersa-training.com www.ersa-training.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Option 2: Docker Deployment

Create a `Dockerfile` in the `ProxyDeploymentReady` folder:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy build output and configs
COPY .next ./.next
COPY public ./public
COPY messages ./messages
COPY locales ./locales
COPY next.config.js ./
COPY .env.production ./.env.production
COPY i18n.ts ./
COPY middleware.ts ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
```

**Build and run:**
```bash
docker build -t ersa-frontend .
docker run -p 3000:3000 ersa-frontend
```

### Option 3: Vercel/Netlify Deployment

1. Upload the `ProxyDeploymentReady` folder to your Git repository
2. Connect your repository to Vercel/Netlify
3. Set environment variables in the platform:
   - `NODE_ENV=production`
   - `NEXT_PUBLIC_API_BASE_URL=/api/proxy?endpoint=`
   - `BACKEND_API_URL=http://api.ersa-training.com/api`
4. Deploy!

## 🔍 Verify Deployment

### Test Proxy Connection

After deployment, test the proxy endpoint:

```bash
# Test if proxy is working
curl https://your-domain.com/api/proxy?endpoint=courses

# Should return courses data from backend
```

### Test Frontend Pages

Visit these URLs to verify:
- `https://your-domain.com/en` - English homepage
- `https://your-domain.com/ar` - Arabic homepage
- `https://your-domain.com/en/courses` - Courses page
- `https://your-domain.com/en/admin-login` - Admin login

## 🔒 Security Checklist

- [ ] HTTPS enabled (SSL certificate installed)
- [ ] Environment variables secured (not committed to Git)
- [ ] Backend URL is not exposed to client
- [ ] CORS properly configured on backend (if needed)
- [ ] Rate limiting configured on reverse proxy
- [ ] Firewall rules configured

## 📊 Monitoring & Logs

### View Application Logs

**With PM2:**
```bash
pm2 logs ersa-frontend
pm2 monit
```

**Docker:**
```bash
docker logs <container-id>
```

### Check Proxy Logs

Proxy logs will show in the application console:
```
[API Proxy GET] /courses
[API Proxy POST] /auth/login
```

## 🐛 Troubleshooting

### Issue: API calls returning 404
**Solution:** Verify proxy route exists and `.env.production` is properly configured

### Issue: Backend connection failed
**Solution:** Check `BACKEND_API_URL` in `.env.production` is correct and backend is accessible

### Issue: CORS errors
**Solution:** With proxy approach, CORS should not be an issue. If you see CORS errors, ensure you're using the proxy configuration correctly.

### Issue: Static assets not loading
**Solution:** Ensure `public` folder is copied and accessible

## 🔄 Updates & Rebuilds

When you need to update the frontend:

1. Make changes in development
2. Build again: `npm run build`
3. Replace `.next` folder in deployment package
4. Restart the application:
   ```bash
   # With PM2
   pm2 restart ersa-frontend
   
   # Without PM2
   # Stop the current process and run:
   npm start
   ```

## 📞 Support

For issues related to:
- **Backend connection**: See `BACKEND_CONNECTION_GUIDE.md`
- **Deployment**: This document
- **Development**: See main `README.md` in frontend folder

## 🎯 Performance Tips

1. **Use CDN** for static assets in `public/` folder
2. **Enable Gzip/Brotli** compression in Nginx/Apache
3. **Cache static files** with long expiry headers
4. **Use PM2 cluster mode** for better performance:
   ```bash
   pm2 start npm --name "ersa-frontend" -i max -- start
   ```

## 🌐 Environment Variables Reference

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Sets Node environment |
| `NEXT_PUBLIC_API_BASE_URL` | `/api/proxy?endpoint=` | Frontend API base URL (uses proxy) |
| `BACKEND_API_URL` | `http://api.ersa-training.com/api` | Actual backend URL (hidden from client) |

## ✅ Deployment Checklist

Before going live:

- [ ] Build completed successfully
- [ ] All files copied to deployment package
- [ ] `.env.production` configured with correct backend URL
- [ ] Dependencies installed (`npm install --production`)
- [ ] Application starts successfully (`npm start`)
- [ ] Proxy endpoint tested and working
- [ ] All pages load correctly
- [ ] SSL certificate installed and HTTPS working
- [ ] Reverse proxy (Nginx/Apache) configured
- [ ] PM2 or similar process manager configured
- [ ] Monitoring and logging set up
- [ ] Backup strategy in place

---

**Package Build Date:** October 5, 2025  
**Next.js Version:** 15.5.4  
**Node.js Required:** 18.x or later  
**Configuration:** Proxy-based backend connection ✅


