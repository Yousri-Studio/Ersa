# Environment Variables Setup

## Production Environment Variables

Create a file named `.env.production.local` in the frontend directory with the following content:

```env
# Backend API URL - REQUIRED
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com/api

# Server Port (optional, defaults to 3000)
PORT=3000

# Node Environment (automatically set by npm start)
NODE_ENV=production
```

## Important Notes

1. **Never commit `.env.production.local`** - This file contains sensitive information
2. The `.gitignore` file should already exclude this file
3. Update `https://api.yourdomain.com/api` with your actual backend URL
4. Change the PORT if needed (especially if deploying behind IIS)

## For Local Testing

You can also create `.env.local` for local development:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5002/api
```

## GitHub Actions Deployment

For GitHub Actions, configure these as **Repository Secrets** (not in files):
- `NEXT_PUBLIC_API_BASE_URL`
- `FTP_SERVER`
- `FTP_USERNAME`
- `FTP_PASSWORD`
- `FTP_SERVER_DIR`

Go to: **Repository Settings → Secrets and variables → Actions**

