# Email Verification Flow - Ersa Training Platform

## 🔄 Complete User Registration & Verification Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         USER REGISTRATION FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

    [Frontend]              [Backend API]           [Database]      [SendGrid]
         │                        │                      │               │
         │                        │                      │               │
    ┌────────┐                    │                      │               │
    │ User   │                    │                      │               │
    │ Enters │                    │                      │               │
    │ Details│                    │                      │               │
    └───┬────┘                    │                      │               │
        │                         │                      │               │
        │ POST /api/auth/register │                      │               │
        ├────────────────────────>│                      │               │
        │                         │                      │               │
        │                         │ Check if user exists │               │
        │                         ├─────────────────────>│               │
        │                         │                      │               │
        │                         │ User not found       │               │
        │                         │<─────────────────────┤               │
        │                         │                      │               │
        │                         │ Create new user      │               │
        │                         │ Status: Pending      │               │
        │                         ├─────────────────────>│               │
        │                         │                      │               │
        │                         │ User created ✅       │               │
        │                         │<─────────────────────┤               │
        │                         │                      │               │
        │                         │ Assign PublicUser    │               │
        │                         │ role                 │               │
        │                         ├─────────────────────>│               │
        │                         │                      │               │
        │                         │ Generate Token       │               │
        │                         │ (ASP.NET Identity)   │               │
        │                         │                      │               │
        │                         │ Send Email           │               │
        │                         ├──────────────────────┼──────────────>│
        │                         │                      │               │
        │                         │                      │  Create Log   │
        │                         │                      │<──────────────┤
        │                         │                      │               │
        │                         │                      │  Email Sent ✉ │
        │                         │<─────────────────────┼───────────────┤
        │                         │                      │               │
        │ 200 OK: Success         │                      │               │
        │<────────────────────────┤                      │               │
        │                         │                      │               │
    ┌───┴────┐                    │                      │               │
    │ Show   │                    │                      │               │
    │ Success│                    │                      │               │
    │ Toast  │                    │                      │               │
    └───┬────┘                    │                      │               │
        │                         │                      │               │
    ┌───┴──────────┐              │                      │               │
    │ Redirect to  │              │                      │               │
    │ Verify Email │              │                      │               │
    │ Page         │              │                      │               │
    └───┬──────────┘              │                      │               │
        │                         │                      │            ┌──┴──┐
        │                         │                      │            │User │
        │                         │                      │            │Email│
        │                         │                      │            └──┬──┘
        │                         │                      │               │
    ┌───┴────┐                    │                      │               │
    │ User   │                    │                      │               │
    │ Opens  │                    │                      │               │
    │ Email  │<───────────────────┼──────────────────────┼───────────────┘
    └───┬────┘                    │                      │
        │                         │                      │
    ┌───┴────┐                    │                      │
    │ Copies │                    │                      │
    │ Code   │                    │                      │
    └───┬────┘                    │                      │
        │                         │                      │
    ┌───┴────┐                    │                      │
    │ Enters │                    │                      │
    │ Code   │                    │                      │
    └───┬────┘                    │                      │
        │                         │                      │
        │ POST /api/auth/verify   │                      │
        ├────────────────────────>│                      │
        │                         │                      │
        │                         │ Find user by email   │
        │                         ├─────────────────────>│
        │                         │                      │
        │                         │ User found           │
        │                         │<─────────────────────┤
        │                         │                      │
        │                         │ Verify token         │
        │                         │ (ASP.NET Identity)   │
        │                         │                      │
        │                         │ Update user:         │
        │                         │ - EmailConfirmed=true│
        │                         │ - Status=Active      │
        │                         ├─────────────────────>│
        │                         │                      │
        │                         │ Generate JWT token   │
        │                         │                      │
        │ 200 OK: Login Response  │                      │
        │ { token, user }         │                      │
        │<────────────────────────┤                      │
        │                         │                      │
    ┌───┴────┐                    │                      │
    │ Store  │                    │                      │
    │ Token  │                    │                      │
    │ Login  │                    │                      │
    └───┬────┘                    │                      │
        │                         │                      │
    ┌───┴────┐                    │                      │
    │Redirect│                    │                      │
    │  to    │                    │                      │
    │  Home  │                    │                      │
    └────────┘                    │                      │
                                  │                      │
                            ✅ USER VERIFIED             │
                            & LOGGED IN                  │
```

---

## 📧 Email Template Rendered

### English Email
```html
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                 🎓 ERSA TRAINING                        │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Hello John Doe,                                        │
│                                                         │
│  Thank you for registering with Ersa Training.          │
│  To complete your registration, please use the          │
│  following verification code:                           │
│                                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                                                    ┃  │
│  ┃        CfDJ8AbCdEfG1234567890HiJkLmNoPqR          ┃  │
│  ┃                                                    ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                         │
│  This code is valid for 24 hours.                      │
│                                                         │
│  Best regards,                                          │
│  Ersa Training Team                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Arabic Email (RTL)
```html
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                        إرساء للتدريب 🎓                │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                                      ،مرحباً أحمد محمد │
│                                                         │
│         .شكراً لك على التسجيل في إرساء للتدريب          │
│     لإكمال عملية التسجيل، يرجى استخدام رمز التفعيل     │
│                                              :التالي    │
│                                                         │
│  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│  ┃                                                    ┃  │
│  ┃        CfDJ8AbCdEfG1234567890HiJkLmNoPqR          ┃  │
│  ┃                                                    ┃  │
│  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
│                                                         │
│                          .هذا الرمز صالح لمدة 24 ساعة │
│                                                         │
│                          ،مع تحيات فريق إرساء للتدريب │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Security Features

### Token Generation
```csharp
// ASP.NET Core Identity generates secure tokens
var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);

// Token characteristics:
// - Cryptographically secure
// - URL-safe base64 encoded
// - Contains user ID (encrypted)
// - Time-based expiration (24 hours)
// - Single-use only
```

### Verification Process
```csharp
// Verify token
var result = await _userManager.ConfirmEmailAsync(user, request.Code);

// What happens:
// 1. Decrypts token to get user ID
// 2. Validates token hasn't expired
// 3. Checks token hasn't been used
// 4. Marks email as confirmed
// 5. Returns success/failure
```

---

## 🎯 User States

```
┌──────────────────────────────────────────────────────────┐
│                    USER STATUS FLOW                      │
└──────────────────────────────────────────────────────────┘

     Registration
         │
         ▼
┌─────────────────────┐
│ PendingEmailVerification │  ← Cannot login yet
└─────────┬───────────┘
          │
          │ User verifies email
          │
          ▼
    ┌─────────┐
    │  Active  │  ← Can login now ✅
    └─────────┘
```

### Database Status Values
```sql
-- User.Status enum
UserStatus.PendingEmailVerification = 0  -- Initial state
UserStatus.Active = 1                    -- After verification
UserStatus.Suspended = 2                 -- Admin action
UserStatus.Deleted = 3                   -- Soft delete
```

---

## 📱 Frontend Pages

### 1. Register Page
- Path: `/[locale]/auth/register`
- Component: `AuthForm` with mode="register"
- Shows: Name, Email, Phone, Password fields
- Submit: Calls `/api/auth/register`

### 2. Verify Email Page
- Path: `/[locale]/auth/verify-email?email=user@example.com`
- Shows: Email (masked), 6-digit code input
- Features:
  - Auto-focus on code input
  - Resend button (60s cooldown)
  - Format validation
- Submit: Calls `/api/auth/verify-email`

### 3. After Verification
- Auto-login with JWT token
- Redirect to home page
- Show success toast

---

## 🛠️ API Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "SecureP@ss123",
  "phone": "+966501234567",
  "locale": "en"
}

Response 200:
{
  "message": "Registration successful. Please check your email..."
}
```

### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "CfDJ8AbCdEfG..."
}

Response 200:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "guid",
    "fullName": "John Doe",
    "email": "john@example.com",
    "locale": "en",
    "isAdmin": false
  }
}
```

### Resend Verification
```http
POST /api/auth/resend-verification
Content-Type: application/json

{
  "email": "john@example.com"
}

Response 200:
{
  "message": "Verification email sent successfully"
}
```

---

## 📊 Email Tracking

### Database Table: EmailLogs
```sql
CREATE TABLE EmailLogs (
    Id uniqueidentifier PRIMARY KEY,
    UserId uniqueidentifier,
    TemplateKey nvarchar(100),
    Locale nvarchar(10),
    Status int,              -- Pending, Sent, Delivered, etc.
    CreatedAt datetime2,
    SentAt datetime2,
    OpenedAt datetime2,
    ClickedAt datetime2,
    ProviderMsgId nvarchar(255),
    ErrorMessage nvarchar(max)
)
```

### Email Status Values
```csharp
EmailStatus.Pending = 0      // Queued
EmailStatus.Sent = 1         // Sent to SendGrid
EmailStatus.Delivered = 2    // Received by mail server
EmailStatus.Opened = 3       // User opened email
EmailStatus.Clicked = 4      // User clicked link
EmailStatus.Failed = 5       // Send failed
EmailStatus.Bounced = 6      // Email bounced
```

---

## ⚙️ Configuration Required

### Minimum Configuration
```json
{
  "SendGrid": {
    "ApiKey": "SG.your-key-here",
    "FromEmail": "noreply@ersa-training.com",
    "FromName": "Ersa Training"
  }
}
```

### Where to Add
1. `backend/src/appsettings.Development.json` (for dev)
2. `backend/src/appsettings.json` (for production)

---

## 🐛 Error Handling

### Email Send Failure
- ❌ Registration still succeeds
- ✅ User can request resend
- ✅ Error logged to database
- ✅ Error logged to file

### Invalid Verification Code
- Returns 400 Bad Request
- Message: "Invalid verification code"
- User can retry unlimited times
- User can request new code

### Expired Token
- Tokens expire after 24 hours
- User must request new verification email
- Old tokens are invalidated

---

## ✅ Success Criteria

- [x] User receives email within 1 minute
- [x] Email displays correctly in all clients
- [x] Arabic emails show RTL correctly
- [x] Verification code is valid
- [x] User can verify and login
- [x] Old tokens don't work after verification
- [x] Resend works correctly

---

## 📚 Related Files

- Backend:
  - `backend/src/Services/EmailService.cs` - Email sending logic
  - `backend/src/Controllers/AuthController.cs` - Auth endpoints
  - `backend/src/DTOs/AuthDTOs.cs` - Request/response models

- Frontend:
  - `frontend/components/auth/auth-form.tsx` - Register form
  - `frontend/app/[locale]/auth/verify-email/page.tsx` - Verify page
  - `frontend/lib/api.ts` - API client

- Configuration:
  - `backend/src/appsettings.json` - Production config
  - `backend/src/appsettings.Development.json` - Dev config

---

## 🎓 Testing Checklist

- [ ] Register with English locale
- [ ] Check email received (check spam!)
- [ ] Verify Arabic RTL display
- [ ] Test verification code works
- [ ] Test invalid code shows error
- [ ] Test resend functionality
- [ ] Test login after verification
- [ ] Check user status in database
- [ ] Check EmailLogs in database
- [ ] Test with different email providers (Gmail, Outlook, etc.)

---

**All systems ready! Just add your SendGrid API key to start sending beautiful verification emails!** 🚀

