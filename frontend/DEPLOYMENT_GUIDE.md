# Ersa Training Frontend - SmarterASP.NET Deployment Guide

## ✅ Build Status
**BUILD SUCCESSFUL** - All TypeScript compilation errors have been resolved!

## 📦 Deployment Package Ready
Your deployment package is ready in the `deployment` folder with the following structure:
```
deployment/
├── .next/              # Built Next.js application
├── public/             # Static assets
├── package.json        # Dependencies
├── package-lock.json   # Dependency versions
├── next.config.js      # Next.js configuration
├── web.config          # IIS configuration for SmarterASP.NET
├── start.js           # Node.js startup file
├── iisnode.yml        # Node.js configuration
└── .env.production    # Production environment variables
```

## 🚀 SmarterASP.NET Deployment Steps

### Step 1: Prepare Deployment Package
1. ✅ **COMPLETED**: Build has been successfully created
2. ✅ **COMPLETED**: Deployment folder is ready
3. **Next**: Compress the `deployment` folder into a ZIP file
   - Right-click on the `deployment` folder
   - Select "Send to" → "Compressed (zipped) folder"
   - Name it `ersa-frontend.zip`

### Step 2: Upload to SmarterASP.NET
1. **Login** to your SmarterASP.NET control panel
2. **Navigate** to "File Manager"
3. **Upload** the `ersa-frontend.zip` file to your domain's root directory
4. **Extract** the ZIP file in the root directory (wwwroot or public_html)
5. **Delete** the ZIP file after extraction

### Step 3: Configure Node.js in Control Panel
1. **Go to** "Node.js Manager" in your SmarterASP.NET control panel
2. **Enable** Node.js for your domain
3. **Set Configuration**:
   - **Startup File**: `start.js`
   - **Node.js Version**: Select the latest available (preferably 18.x or higher)
   - **Application Root**: Leave as default (root directory)

### Step 4: Environment Configuration
1. **Edit** `.env.production` file in your deployed files
2. **Update** the API URL to match your backend:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://yourdomain.smarterasp.net/api
   NODE_ENV=production
   PORT=3000
   ```
3. **Replace** `yourdomain.smarterasp.net` with your actual domain

### Step 5: Install Dependencies
SmarterASP.NET will automatically install dependencies when Node.js is enabled. If needed, you can also:
1. **Access** the "Node.js NPM" section in control panel
2. **Run** `npm install --production` if dependencies aren't automatically installed

### Step 6: Test Your Deployment
1. **Visit** your domain URL
2. **Verify** the application loads correctly
3. **Check** both English (`/en`) and Arabic (`/ar`) versions
4. **Test** key functionality like course browsing and navigation

## 🔧 Troubleshooting

### Common Issues and Solutions

**Issue**: Application doesn't start
- **Solution**: Check Node.js is enabled in control panel
- **Solution**: Verify `start.js` is set as startup file
- **Solution**: Check error logs in control panel

**Issue**: Static files (images, CSS) not loading
- **Solution**: Ensure `public` folder was uploaded correctly
- **Solution**: Check file permissions in File Manager

**Issue**: API calls failing
- **Solution**: Update `NEXT_PUBLIC_API_BASE_URL` in `.env.production`
- **Solution**: Ensure your backend API is deployed and accessible

**Issue**: Routes not working (404 errors)
- **Solution**: Check `web.config` is in the root directory
- **Solution**: Verify IIS URL rewrite rules are working

## 📱 Features Included
- ✅ Bilingual support (English/Arabic)
- ✅ Responsive design for all devices
- ✅ Course catalog and detailed course pages
- ✅ Shopping cart functionality
- ✅ User authentication
- ✅ Admin dashboard
- ✅ Contact and consultation forms
- ✅ FAQ section

## 🔗 Important URLs
After deployment, your application will be accessible at:
- **Homepage**: `https://yourdomain.smarterasp.net/`
- **English**: `https://yourdomain.smarterasp.net/en`
- **Arabic**: `https://yourdomain.smarterasp.net/ar`
- **Courses**: `https://yourdomain.smarterasp.net/en/courses`
- **Admin**: `https://yourdomain.smarterasp.net/en/admin`

## 🔄 Updates and Maintenance

### For Future Updates:
1. **Make changes** in your development environment
2. **Run build** process: `npm run build`
3. **Test locally** to ensure everything works
4. **Create new deployment package** with updated files
5. **Upload and replace** files on SmarterASP.NET
6. **Restart** Node.js application in control panel if needed

### Performance Optimization:
- Application is already optimized for production
- Static files are served efficiently
- Code is minified and compressed
- Images are optimized for web delivery

## 📞 Support
If you encounter any issues during deployment:
1. Check SmarterASP.NET documentation for Node.js hosting
2. Review error logs in the control panel
3. Ensure all files were uploaded correctly
4. Verify environment variables are set properly

---
**Deployment Date**: $(Get-Date)
**Status**: ✅ Ready for Production
**Next.js Version**: 15.5.4
**Node.js Required**: 18.x or higher