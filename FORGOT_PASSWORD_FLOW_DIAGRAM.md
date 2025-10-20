# Forgot Password - Flow Diagram

## Complete System Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FORGOT PASSWORD FLOW                            │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐
│   User at Login      │
│      Page            │
└──────┬───────────────┘
       │
       │ Click "Forgot Password?"
       ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 1: REQUEST PASSWORD RESET                                           │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend: /auth/forgot-password                                         │
│  ┌────────────────────────────────────────┐                             │
│  │  📧 Enter Email Address                │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ user@example.com                 │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │       [Send Reset Code]                │                             │
│  └────────────────────────────────────────┘                             │
│                    ↓                                                     │
│         POST /api/auth/forgot-password                                   │
│         { email: "user@example.com" }                                    │
│                    ↓                                                     │
│  Backend Processing:                                                     │
│  ┌────────────────────────────────────────┐                             │
│  │ 1. Find user by email                  │                             │
│  │ 2. Verify email is confirmed           │                             │
│  │ 3. Generate 6-digit code (123456)      │                             │
│  │ 4. Store code in Identity token store  │                             │
│  │ 5. Send email via SendGrid             │                             │
│  └────────────────────────────────────────┘                             │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 2: EMAIL DELIVERY                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  SendGrid Email:                                                         │
│  ┌────────────────────────────────────────────────────────────┐         │
│  │ From: noreply@ersa-training.com                            │         │
│  │ To: user@example.com                                       │         │
│  │ Subject: Password Reset - Ersa Training                    │         │
│  │                                                            │         │
│  │ ┌──────────────────────────────────────────────────────┐ │         │
│  │ │  Hello [User]! 🔐                                    │ │         │
│  │ │                                                      │ │         │
│  │ │  Password Reset Request                              │ │         │
│  │ │                                                      │ │         │
│  │ │  Use this code to reset your password:              │ │         │
│  │ │                                                      │ │         │
│  │ │  ┌──────────────────────────────────────┐           │ │         │
│  │ │  │        🔑 Your Reset Code             │           │ │         │
│  │ │  │                                       │           │ │         │
│  │ │  │            123456                     │           │ │         │
│  │ │  │                                       │           │ │         │
│  │ │  │  ⏰ Valid for 1 hour only             │           │ │         │
│  │ │  └──────────────────────────────────────┘           │ │         │
│  │ │                                                      │ │         │
│  │ │  Instructions:                                       │ │         │
│  │ │  1. Copy the 6-digit code                           │ │         │
│  │ │  2. Return to reset page                            │ │         │
│  │ │  3. Enter code + new password                       │ │         │
│  │ │  4. Confirm                                          │ │         │
│  │ └──────────────────────────────────────────────────────┘ │         │
│  └────────────────────────────────────────────────────────────┘         │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 3: RESET PASSWORD                                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend: /auth/reset-password?email=user@example.com                  │
│  ┌────────────────────────────────────────┐                             │
│  │  Email: us****@example.com             │                             │
│  │                                        │                             │
│  │  🔑 Reset Code                         │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ 1 2 3 4 5 6                      │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │  🔒 New Password                       │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ ••••••••                         │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │  🔒 Confirm Password                   │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ ••••••••                         │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │       [Reset Password]                 │                             │
│  └────────────────────────────────────────┘                             │
│                    ↓                                                     │
│         POST /api/auth/reset-password                                    │
│         {                                                                │
│           email: "user@example.com",                                     │
│           code: "123456",                                                │
│           newPassword: "NewSecurePass123"                                │
│         }                                                                │
│                    ↓                                                     │
│  Backend Processing:                                                     │
│  ┌────────────────────────────────────────┐                             │
│  │ 1. Find user by email                  │                             │
│  │ 2. Retrieve stored reset code          │                             │
│  │ 3. Validate code matches               │                             │
│  │ 4. Generate password reset token       │                             │
│  │ 5. Reset password via Identity         │                             │
│  │ 6. Remove reset code                   │                             │
│  └────────────────────────────────────────┘                             │
│                    ↓                                                     │
│  ✅ Success Response                                                     │
│  { message: "Password reset successfully!" }                             │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ STEP 4: LOGIN WITH NEW PASSWORD                                         │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  Frontend: Redirected to /auth/login                                    │
│  ┌────────────────────────────────────────┐                             │
│  │  📧 Email                               │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ user@example.com                 │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │  🔒 Password                           │                             │
│  │  ┌──────────────────────────────────┐  │                             │
│  │  │ NewSecurePass123                 │  │                             │
│  │  └──────────────────────────────────┘  │                             │
│  │                                        │                             │
│  │       [Sign In]                        │                             │
│  └────────────────────────────────────────┘                             │
│                    ↓                                                     │
│  ✅ Login Successful                                                     │
│  → Redirected to Home Page                                               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## Error Handling

```
┌──────────────────────────────────────────────────────────────────────┐
│ ERROR SCENARIOS                                                       │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ ❌ Email Not Found (Forgot Password)                                 │
│    → Return: Generic success message (security)                      │
│    → User doesn't know if email exists                               │
│                                                                       │
│ ❌ Email Not Verified                                                │
│    → Return: "Email is not verified. Please verify email first."     │
│                                                                       │
│ ❌ Invalid Reset Code                                                │
│    → Return: "Invalid reset code"                                    │
│    → User can request new code                                       │
│                                                                       │
│ ❌ Reset Code Expired                                                │
│    → Return: "No password reset request found"                       │
│    → User must request new code                                      │
│                                                                       │
│ ❌ Password Too Weak                                                 │
│    → Return: Password validation errors                              │
│    → Min 6 characters required                                       │
│                                                                       │
│ ❌ Passwords Don't Match                                             │
│    → Return: "Passwords do not match"                                │
│    → Frontend validation before submission                           │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Security Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ SECURITY MEASURES                                                     │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ 🔐 Code Generation                                                   │
│    ├─ Random 6-digit number (100000-999999)                          │
│    ├─ Stored via ASP.NET Identity token storage                      │
│    └─ Cryptographically secure                                       │
│                                                                       │
│ 🔐 Code Storage                                                      │
│    ├─ Provider: "PasswordReset"                                      │
│    ├─ Purpose: "ResetCode"                                           │
│    └─ Managed by Identity framework                                  │
│                                                                       │
│ 🔐 Code Validation                                                   │
│    ├─ Must match exactly                                             │
│    ├─ Case sensitive                                                 │
│    └─ One-time use (removed after success)                           │
│                                                                       │
│ 🔐 Email Verification                                                │
│    ├─ Only verified emails can reset                                 │
│    └─ Prevents abuse                                                 │
│                                                                       │
│ 🔐 Generic Responses                                                 │
│    ├─ Same message for existing/non-existing emails                  │
│    └─ Prevents email enumeration                                     │
│                                                                       │
│ 🔐 Password Reset                                                    │
│    ├─ Uses ASP.NET Identity ResetPasswordAsync                       │
│    ├─ Generates proper reset token                                   │
│    └─ Updates password securely                                      │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│ DATABASE INTERACTIONS                                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ Step 1: Forgot Password Request                                      │
│ ┌──────────────────────────────────────┐                             │
│ │ AspNetUsers Table                    │                             │
│ │ ├─ Find by Email                     │                             │
│ │ └─ Check EmailConfirmed = true       │                             │
│ └──────────────────────────────────────┘                             │
│                ↓                                                      │
│ ┌──────────────────────────────────────┐                             │
│ │ AspNetUserTokens Table               │                             │
│ │ ├─ LoginProvider: "PasswordReset"    │                             │
│ │ ├─ Name: "ResetCode"                 │                             │
│ │ └─ Value: "123456"                   │                             │
│ └──────────────────────────────────────┘                             │
│                                                                       │
│ Step 2: Reset Password                                               │
│ ┌──────────────────────────────────────┐                             │
│ │ AspNetUserTokens Table               │                             │
│ │ ├─ Retrieve stored code              │                             │
│ │ └─ Compare with submitted code       │                             │
│ └──────────────────────────────────────┘                             │
│                ↓                                                      │
│ ┌──────────────────────────────────────┐                             │
│ │ AspNetUsers Table                    │                             │
│ │ ├─ Generate password reset token     │                             │
│ │ └─ Update PasswordHash               │                             │
│ └──────────────────────────────────────┘                             │
│                ↓                                                      │
│ ┌──────────────────────────────────────┐                             │
│ │ AspNetUserTokens Table               │                             │
│ │ └─ Remove reset code                 │                             │
│ └──────────────────────────────────────┘                             │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│ FRONTEND COMPONENTS                                                   │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ auth-form.tsx                                                         │
│ └─ "Forgot Password?" Link                                           │
│    └─ Routes to: /auth/forgot-password                               │
│                                                                       │
│ forgot-password/page.tsx                                              │
│ ├─ Email input field                                                 │
│ ├─ Form validation (React Hook Form)                                 │
│ ├─ Submit handler                                                    │
│ │  └─ authApi.forgotPassword()                                       │
│ └─ On Success: Route to /auth/reset-password?email=...               │
│                                                                       │
│ reset-password/page.tsx                                               │
│ ├─ Get email from URL params                                         │
│ ├─ 6-digit code input                                                │
│ ├─ New password input                                                │
│ ├─ Confirm password input                                            │
│ ├─ Password visibility toggle                                        │
│ ├─ Form validation                                                   │
│ │  ├─ Code format (6 digits)                                         │
│ │  ├─ Password length (min 6)                                        │
│ │  └─ Passwords match                                                │
│ ├─ Submit handler                                                    │
│ │  └─ authApi.resetPassword()                                        │
│ └─ On Success: Route to /auth/login                                  │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│ BACKEND COMPONENTS                                                    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                       │
│ AuthController.cs                                                     │
│ ├─ POST /api/auth/forgot-password                                    │
│ │  ├─ Find user                                                      │
│ │  ├─ Verify email confirmed                                         │
│ │  ├─ Generate code                                                  │
│ │  ├─ Store code                                                     │
│ │  └─ Send email                                                     │
│ └─ POST /api/auth/reset-password                                     │
│    ├─ Validate code                                                  │
│    ├─ Reset password                                                 │
│    └─ Clean up code                                                  │
│                                                                       │
│ EmailService.cs                                                       │
│ ├─ SendPasswordResetEmailAsync()                                     │
│ │  └─ SendSimplePasswordResetEmailAsync()                            │
│ └─ GeneratePasswordResetEmailTemplate()                              │
│    ├─ HTML template                                                  │
│    ├─ Bilingual (AR/EN)                                              │
│    └─ Brand styling                                                  │
│                                                                       │
│ IEmailService.cs                                                      │
│ └─ Interface definition                                              │
│                                                                       │
│ AuthDTOs.cs                                                           │
│ ├─ ForgotPasswordRequest                                             │
│ └─ ResetPasswordRequest                                              │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
```

---

**Created:** October 20, 2025  
**Status:** ✅ Complete Implementation  
**Version:** 1.0

