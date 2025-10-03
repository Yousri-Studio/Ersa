# GitHub Secrets Setup Guide

## Quick Setup Steps

### 1. Go to GitHub Repository Settings
1. Open your GitHub repository
2. Click on **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**

### 2. Add Required Secrets

Add each of these secrets one by one:

#### Secret 1: NEXT_PUBLIC_API_BASE_URL
- **Name:** `NEXT_PUBLIC_API_BASE_URL`
- **Value:** Your backend API URL
- **Example:** `https://api.ersatraining.com/api` or `https://yourdomain.com/api`

#### Secret 2: FTP_SERVER
- **Name:** `FTP_SERVER`
- **Value:** Your Windows hosting FTP address
- **Example:** `ftp.yourdomain.com` or `ftp.smarterasp.net`

#### Secret 3: FTP_USERNAME
- **Name:** `FTP_USERNAME`
- **Value:** Your FTP username
- **Example:** `admin` or `username@domain.com`

#### Secret 4: FTP_PASSWORD
- **Name:** `FTP_PASSWORD`
- **Value:** Your FTP password
- **Example:** `YourSecurePassword123`

#### Secret 5: FTP_SERVER_DIR
- **Name:** `FTP_SERVER_DIR`
- **Value:** Target directory path on server
- **Example:** `/httpdocs/` or `/www/frontend/` or `/site/wwwroot/`

### 3. Verify Secrets
After adding all secrets, you should see them listed (values will be hidden)

### 4. Test Deployment

#### Option A: Push to Main Branch
```bash
git add .
git commit -m "Setup deployment workflow"
git push origin main
```

#### Option B: Manual Trigger
1. Go to **Actions** tab in GitHub
2. Select **"Build and Deploy Frontend to Windows Host"**
3. Click **"Run workflow"** button
4. Select branch (main/master)
5. Click **"Run workflow"**

## Common Hosting Providers Configuration

### SmarterASP.NET
```
FTP_SERVER: your-site.smarterasp.net
FTP_USERNAME: your-username
FTP_PASSWORD: your-password
FTP_SERVER_DIR: /
```

### Hostinger
```
FTP_SERVER: ftp.yourdomain.com
FTP_USERNAME: username@yourdomain.com
FTP_PASSWORD: your-password
FTP_SERVER_DIR: /public_html/
```

### GoDaddy Windows Hosting
```
FTP_SERVER: ftp.yourdomain.com
FTP_USERNAME: your-username
FTP_PASSWORD: your-password
FTP_SERVER_DIR: /httpdocs/
```

### Plesk Windows Hosting
```
FTP_SERVER: your-server-ip or domain
FTP_USERNAME: your-plesk-username
FTP_PASSWORD: your-password
FTP_SERVER_DIR: /httpdocs/ or /your-domain.com/
```

## Security Best Practices

✅ **DO:**
- Use strong, unique passwords for FTP
- Rotate secrets regularly (every 3-6 months)
- Use FTP over TLS/SSL (FTPS) if available
- Limit FTP access by IP address if possible
- Use different credentials for staging and production

❌ **DON'T:**
- Never commit secrets to your repository
- Don't share secrets in Slack, email, or other channels
- Don't use the same password across multiple services
- Don't give more permissions than necessary

## Troubleshooting

### Secrets Not Working
- Check that secret names match exactly (case-sensitive)
- Verify no extra spaces in secret values
- Re-save the secret if you're unsure

### FTP Connection Fails
- Verify FTP server address is correct
- Test FTP credentials with FTP client (FileZilla)
- Check firewall/network restrictions
- Ensure FTP service is enabled on Windows Server
- Try using IP address instead of domain name

### Deployment Succeeds but Site Doesn't Work
- Check environment variables are set correctly
- Verify backend API URL is accessible from server
- Check Node.js is installed on Windows Server
- Review server logs for errors

## Next Steps

After setting up secrets:
1. ✅ Test the workflow with manual trigger
2. ✅ Verify files are deployed to correct directory
3. ✅ Check application runs on Windows server
4. ✅ Configure domain/DNS if needed
5. ✅ Set up SSL certificate for HTTPS
6. ✅ Configure monitoring and alerts

## Support Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
- [FTP Deploy Action](https://github.com/SamKirkland/FTP-Deploy-Action)

For detailed deployment instructions, see `DEPLOYMENT_GUIDE.md`

