# Forgot Password - Quick Start Guide

## 🚀 Quick Overview

Users can now reset their passwords using a secure email verification code system.

## 📱 User Journey

```
Login Page
    ↓ Click "Forgot Password?"
Forgot Password Page (/auth/forgot-password)
    ↓ Enter email → Submit
Email Sent (6-digit code)
    ↓ Check email inbox
Reset Password Page (/auth/reset-password)
    ↓ Enter code + new password
Password Reset Success
    ↓ Redirect to login
Login with New Password ✅
```

## 🎯 Frontend Routes

1. **Forgot Password**: `/[locale]/auth/forgot-password`
2. **Reset Password**: `/[locale]/auth/reset-password?email=user@example.com`

## 🔌 API Endpoints

### 1. Request Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}

Response 200:
{
  "message": "If your email is registered, you will receive a password reset code."
}
```

### 2. Reset Password
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewSecurePass123"
}

Response 200:
{
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

## ✨ Key Features

### Backend
✅ 6-digit reset code generation  
✅ Secure code storage using ASP.NET Identity  
✅ Beautiful bilingual email templates (AR/EN)  
✅ Email verification requirement  
✅ Generic security messages  
✅ One-time use codes  

### Frontend
✅ Clean, modern UI matching auth pages  
✅ Form validation with React Hook Form  
✅ Loading states and error handling  
✅ Password visibility toggle  
✅ Full localization (Arabic/English)  
✅ Responsive design  
✅ Smooth animations  

### Email
✅ SendGrid integration  
✅ Responsive HTML template  
✅ Bilingual support  
✅ Brand colors and styling  
✅ Clear instructions  
✅ Security notices  

## 🔐 Security Features

1. **Email Verification Required**: Only verified users can reset passwords
2. **Generic Messages**: Doesn't reveal if email exists
3. **Temporary Codes**: Reset codes expire after use
4. **Secure Storage**: Uses ASP.NET Identity token storage
5. **One-Time Use**: Code removed after successful reset
6. **Password Validation**: Minimum 6 characters required

## 📧 Email Template Preview

**English Email:**
```
Hello [User]!
Password Reset Request

We received a request to reset your password for your Ersa Training account.

To reset your password, please use the reset code below:

🔑 Your Reset Code
   123456
⏰ This code is valid for 1 hour only

How to Reset Your Password:
1. Copy the 6-digit reset code above
2. Return to the password reset page
3. Paste the code and enter your new password
4. Click the Confirm button

⚠️ Important Security Notice:
If you didn't request a password reset, please ignore this email.
```

**Arabic Email:** (Fully translated)

## 🧪 Testing

### Test Flow (Development)

1. **Start Backend**: 
   ```bash
   cd backend/src
   dotnet run
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Forgot Password**:
   - Go to: `http://localhost:3000/en/auth/login`
   - Click "Forgot password?"
   - Enter email: `test@example.com`
   - Submit

4. **Check Email**:
   - Check backend logs for email sent confirmation
   - Copy the 6-digit code

5. **Reset Password**:
   - You'll be redirected to reset page
   - Enter the 6-digit code
   - Enter new password (min 6 chars)
   - Confirm password
   - Submit

6. **Login**:
   - Return to login page
   - Login with new password

### Quick Test Checklist

- [ ] Forgot password page loads
- [ ] Email validation works
- [ ] Reset code is sent
- [ ] Email arrives (check SendGrid logs)
- [ ] Reset page loads with email parameter
- [ ] Code validation works
- [ ] Password validation works (min length, match)
- [ ] Password is reset successfully
- [ ] Can login with new password
- [ ] Test in both English and Arabic

## 🌍 Localization

All UI text is available in both English and Arabic:

**English:**
- "Forgot Password?"
- "Reset Password"
- "Send Reset Code"
- etc.

**Arabic:**
- "نسيت كلمة المرور؟"
- "إعادة تعيين كلمة المرور"
- "إرسال رمز إعادة التعيين"
- etc.

## 🎨 UI Components

Both pages feature:
- Ersa logo at top
- Gradient icon circle
- Form with proper validation
- Loading states with spinners
- Error toast notifications
- Success messages
- Responsive image on desktop
- Smooth page animations
- RTL support for Arabic

## 📝 Configuration

**Backend:** No additional configuration needed. Uses existing:
- SendGrid API key (`appsettings.json`)
- Frontend URL for email links
- ASP.NET Identity for token storage

**Frontend:** No additional configuration needed. Uses existing:
- API URL
- Localization setup
- Toast notifications
- Form validation

## 🐛 Troubleshooting

**Email not received:**
1. Check SendGrid API key in `appsettings.Development.json`
2. Check backend logs for errors
3. Verify user email is verified in database
4. Check spam folder

**Reset code invalid:**
1. Ensure code was copied correctly (6 digits)
2. Check if code expired (1 hour)
3. Request new code if needed

**Can't reset password:**
1. Ensure email is verified
2. Ensure new password meets requirements (min 6 chars)
3. Ensure passwords match

## 💡 Tips

1. **Development**: Check backend console for email logs
2. **Production**: Configure SendGrid webhook for email tracking
3. **Testing**: Use real email or SendGrid's test inbox
4. **Security**: Reset codes expire, don't share them
5. **UX**: The flow is designed to be simple and secure

## 📚 Related Documentation

- `FORGOT_PASSWORD_IMPLEMENTATION.md` - Full technical details
- `EMAIL_CONFIGURATION_GUIDE.md` - Email setup
- `AUTHENTICATION_FLOW_EXPLAINED.md` - Auth system overview
- `SENDGRID_QUICK_SETUP.md` - SendGrid configuration

---

**Status:** ✅ Fully Implemented and Ready to Test

**Created:** October 20, 2025

**Features:**
- Backend API endpoints ✅
- Email templates ✅
- Frontend pages ✅
- Localization ✅
- Security ✅
- Documentation ✅

