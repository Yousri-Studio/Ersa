# 🔍 Why Refresh Token is Called Before Login

## The Authentication Flow Explained

### What's Happening

When you visit the admin page, **before you even click login**, the app tries to restore your previous session:

```typescript
// auth-store.ts line 60-90
initFromCookie: async () => {
  const token = Cookies.get('auth-token');  // Check if token exists in browser
  if (token && !get().isAuthenticated) {
    // Found a token! Let's validate it and get user data
    const response = await fetch('/auth/refresh-token', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
```

### Why This Happens

**Use Case**: "Remember Me" / Persistent Login

1. **User logs in** → Token saved to cookie (expires in 7 days)
2. **User closes browser**
3. **User returns next day**
4. **App checks**: "Do we have a token in cookies?"
5. **If yes**: "Let's validate it and automatically log them in!"

**This is a good UX feature!** Users don't have to log in every time they visit.

### The Problem

**Scenario 1: First-time visitor (no token)**
```
Page loads → Check cookies → No token found → Skip refresh-token call ✅
```

**Scenario 2: User logged in before, but token expired**
```
Page loads → Check cookies → Found expired token → Call refresh-token → 500 error ❌
```

**Scenario 3: Fresh session, never logged in**
```
Page loads → Check cookies → No token → BUT validateToken() is called anyway → 500 error ❌
```

---

## 🐛 The Two Issues

### Issue 1: Backend Returns 500 Instead of 401
When token is invalid/missing, backend should return:
- ❌ **Current**: 500 Internal Server Error
- ✅ **Should be**: 401 Unauthorized

### Issue 2: Frontend Calls Refresh Even Without Token
Looking at line 96-97:
```typescript
validateToken: async () => {
  const token = Cookies.get('auth-token');
  if (token && !get().user) {  // ← Only calls if token exists
```

But somewhere else in the code, `validateToken()` or `initFromCookie()` is being called when there's no token.

---

## 🔧 The Fixes

### Fix 1: Backend Returns 401 Instead of 500

**Problem**: If token validation throws exception, it returns 500

**Solution**: Better error handling in backend

### Fix 2: Only Call Refresh When Token Exists AND is Valid

**Problem**: Frontend tries to validate even empty/malformed tokens

**Solution**: Add token format validation before calling refresh-token

---

## 📊 Where Refresh Token is Called

Let me check where `initFromCookie()` is being called...

