# Role-Based Authorization System - Complete Guide

## 📋 Overview

This guide covers the complete implementation of the ASP.NET Identity role-based authorization system with frontend integration.

## 🎯 Four User Roles

### 1. **SuperAdmin** 🔴
- **Access Level**: Highest (System Management)
- **Permissions**:
  - Full system access
  - User role management
  - All admin functions
  - System configuration
- **Test Account**: `superadmin@ersa-training.com` / `SuperAdmin123!`

### 2. **Admin** 🔵
- **Access Level**: Administrative
- **Permissions**:
  - Content management
  - Course management
  - User management (limited)
  - Reporting
- **Test Account**: `admin@ersa-training.com` / `Admin123!`

### 3. **Operation** 🟢
- **Access Level**: Operational
- **Permissions**:
  - Course operations
  - Content operations
  - Basic user support
  - Limited admin functions
- **Test Account**: `operations@ersa-training.com` / `Operations123!`

### 4. **PublicUser** ⚪
- **Access Level**: Standard User
- **Permissions**:
  - Course enrollment
  - Profile management
  - Public content access
  - Basic features

---

## 🧪 Testing the Role System

### Step 1: Start the Backend API

```bash
cd backend
dotnet run
```

The API will:
- Automatically seed all four roles
- Create test users with appropriate roles
- Configure JWT tokens to include roles

### Step 2: Start the Frontend

```bash
cd frontend
npm run dev
```

### Step 3: Test Login with Different Roles

#### Test 1: SuperAdmin Access
1. Navigate to `/admin-login`
2. Login with: `superadmin@ersa-training.com` / `SuperAdmin123!`
3. Verify you can see:
   - ✅ Dashboard
   - ✅ Content Management
   - ✅ Users
   - ✅ Courses
   - ✅ Orders
   - ✅ Course Settings (Categories, Sub-Categories, Instructors)
   - ✅ **Role Management** (SuperAdmin only)

#### Test 2: Admin Access
1. Logout and login with: `admin@ersa-training.com` / `Admin123!`
2. Verify you can see:
   - ✅ Dashboard
   - ✅ Content Management
   - ✅ Users
   - ✅ Courses
   - ✅ Orders
   - ✅ Course Settings
   - ❌ Role Management (hidden)

#### Test 3: Operation Access
1. Logout and login with: `operations@ersa-training.com` / `Operations123!`
2. Verify you can see:
   - ✅ Dashboard
   - ✅ Content Management (limited)
   - ✅ Courses
   - ✅ Orders
   - ❌ Role Management (hidden)

### Step 4: Test Role Management UI (SuperAdmin Only)

1. Login as SuperAdmin
2. Navigate to "Role Management" in the sidebar
3. You should see:
   - List of all users with their roles
   - Role badges with color coding
   - Ability to assign new roles
   - Ability to remove existing roles

#### Test Role Assignment:
1. Click the "+" button next to any user
2. Select a role from the dropdown
3. Click "Assign Role"
4. Verify the role appears immediately

#### Test Role Removal:
1. Hover over a role badge
2. Click the "×" icon that appears
3. Confirm the removal
4. Verify the role is removed

---

## 🎨 Frontend Implementation Details

### 1. Role Utilities (`lib/roles.ts`)

```typescript
import { UserRole, isSuperAdmin, isAdmin, isOperation } from '@/lib/roles';

// Check if user has a specific role
const hasSuperAdmin = isSuperAdmin(userRoles);

// Check if user has any of multiple roles
const hasAnyRole = hasAnyRole(userRoles, [UserRole.Admin, UserRole.SuperAdmin]);

// Get role display name with localization
const displayName = getRoleDisplayName('SuperAdmin', 'ar'); // 'مدير النظام الأساسي'

// Get role color for badges
const badgeClass = getRoleColor('Admin'); // 'bg-blue-100 text-blue-800 border-blue-200'
```

### 2. useRoles Hook (`hooks/useRoles.ts`)

```typescript
import { useRoles } from '@/hooks/useRoles';

function MyComponent() {
  const { isSuperAdmin, isAdmin, isOperation, roles, hasRole } = useRoles();

  if (isSuperAdmin) {
    // Render SuperAdmin UI
  }

  if (hasRole(UserRole.Operation)) {
    // Render Operation UI
  }

  return <div>...</div>;
}
```

### 3. Conditional Rendering Example

```typescript
// Hide/Show based on role
{isSuperAdmin && (
  <Link href="/admin/roles">
    Role Management
  </Link>
)}

// Different content for different roles
{isSuperAdmin ? (
  <button>Delete User</button>
) : isAdmin ? (
  <button>Suspend User</button>
) : (
  <button>View User</button>
)}
```

---

## 🔧 Backend Implementation Details

### 1. Role Service (`RoleService.cs`)

```csharp
// Seed roles
await roleService.SeedRolesAsync();

// Assign role to user
await roleService.AssignUserToRoleAsync("user@example.com", RoleNames.Admin);

// Check if user has role
bool hasRole = await roleService.IsUserInRoleAsync("user@example.com", RoleNames.SuperAdmin);

// Get user roles
var roles = await roleService.GetUserRolesAsync("user@example.com");
```

### 2. Authorization Policies

```csharp
// Controller-level authorization
[Authorize(Policy = PolicyNames.AdminAccess)]
public class AdminController : ControllerBase

// Method-level authorization
[HttpGet("sensitive-data")]
[Authorize(Policy = PolicyNames.SuperAdminOnly)]
public async Task<ActionResult> GetSensitiveData()
```

### 3. JWT Token Integration

The JWT token now includes role claims:
```json
{
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": [
    "SuperAdmin",
    "Admin"
  ]
}
```

---

## 🚀 Migration Guide

### Phase 1: Frontend Migration (Gradual)

#### Step 1: Update Admin Layout

Replace boolean checks with role checks:

**Before:**
```typescript
if (user?.isAdmin || user?.isSuperAdmin) {
  // Show admin menu
}
```

**After:**
```typescript
import { useRoles } from '@/hooks/useRoles';

const { isAdmin } = useRoles();

if (isAdmin) {
  // Show admin menu
}
```

#### Step 2: Update Admin Pages

Add role-based access control:

**Before:**
```typescript
useEffect(() => {
  if (!user?.isAdmin) {
    router.push('/');
  }
}, [user]);
```

**After:**
```typescript
import { useRoles } from '@/hooks/useRoles';

const { isAdmin, isLoading } = useRoles();

useEffect(() => {
  if (!isLoading && !isAdmin) {
    router.push('/');
  }
}, [isAdmin, isLoading]);
```

#### Step 3: Update UI Components

Add conditional rendering based on roles:

```typescript
import { useRoles } from '@/hooks/useRoles';

function CourseActions({ course }) {
  const { isSuperAdmin, isAdmin, isOperation } = useRoles();

  return (
    <div>
      {/* Everyone can view */}
      <button>View Course</button>

      {/* Operation and above can edit */}
      {isOperation && <button>Edit Course</button>}

      {/* Admin and above can publish */}
      {isAdmin && <button>Publish Course</button>}

      {/* SuperAdmin only can delete */}
      {isSuperAdmin && <button>Delete Course</button>}
    </div>
  );
}
```

### Phase 2: Backend Migration

#### Step 1: Update Controllers

Replace boolean checks with role-based authorization:

**Before:**
```csharp
[Authorize]
public class AdminController : ControllerBase
{
    [HttpDelete("users/{id}")]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        var currentUser = await GetCurrentUser();
        if (!currentUser.IsSuperAdmin)
        {
            return Forbid();
        }
        // Delete user
    }
}
```

**After:**
```csharp
[Authorize(Policy = PolicyNames.AdminAccess)]
public class AdminController : ControllerBase
{
    [HttpDelete("users/{id}")]
    [Authorize(Policy = PolicyNames.SuperAdminOnly)]
    public async Task<ActionResult> DeleteUser(Guid id)
    {
        // Delete user - authorization handled by policy
    }
}
```

#### Step 2: Update Services

Use role checks in business logic:

```csharp
public async Task<bool> CanDeleteCourse(Guid courseId, User user)
{
    var roles = await _userManager.GetRolesAsync(user);
    
    if (roles.Contains(RoleNames.SuperAdmin))
    {
        return true; // SuperAdmin can delete any course
    }
    
    if (roles.Contains(RoleNames.Admin))
    {
        // Admin can delete unpublished courses
        var course = await _context.Courses.FindAsync(courseId);
        return !course.IsPublished;
    }
    
    return false;
}
```

### Phase 3: Database Migration (Optional - Future)

When ready to fully migrate, you can remove the boolean properties:

1. Create a migration to remove `IsAdmin` and `IsSuperAdmin` columns
2. Ensure all code uses role-based checks
3. Run comprehensive tests
4. Deploy gradually with feature flags

---

## 🔍 API Endpoints

### Role Management Endpoints (SuperAdmin Only)

#### Get All Roles
```
GET /api/role/roles
```

#### Get User Roles
```
GET /api/role/user/{email}/roles
```

#### Assign Role to User
```
POST /api/role/user/{email}/role/{roleName}
```

#### Remove Role from User
```
DELETE /api/role/user/{email}/role/{roleName}
```

#### Check User Role
```
GET /api/role/user/{email}/has-role/{roleName}
```

### Admin Role Management Endpoints

#### Get Users with Roles
```
GET /api/admin/users-with-roles
```

#### Assign Role (Admin)
```
POST /api/admin/users/{email}/roles/{roleName}
```

#### Remove Role (Admin)
```
DELETE /api/admin/users/{email}/roles/{roleName}
```

---

## 🎨 UI Components

### Role Badge Component Example

```typescript
import { getRoleColor, getRoleDisplayName } from '@/lib/roles';

function RoleBadge({ role, locale = 'en', onRemove }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(role)} border group relative`}
    >
      {getRoleDisplayName(role, locale)}
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove role"
        >
          ×
        </button>
      )}
    </span>
  );
}
```

---

## 🐛 Troubleshooting

### Issue: Roles not appearing in JWT token

**Solution**: Ensure the user was created or updated after the role system was implemented. Logout and login again to get a new token.

### Issue: SuperAdmin menu not showing

**Solution**: 
1. Check if roles are properly extracted from token
2. Verify the token includes the SuperAdmin role claim
3. Clear localStorage and login again

### Issue: Role assignment fails with 400 error

**Solution**: 
1. Verify the role name is exact (case-sensitive)
2. Check if the user already has that role
3. Verify you're logged in as SuperAdmin

### Issue: Backend build warnings about async methods

**Solution**: These are warnings about methods that don't need to be async. They can be safely ignored or fixed by removing the async keyword.

---

## 📝 Best Practices

### 1. Always Check Role Loading State

```typescript
const { isSuperAdmin, isLoading } = useRoles();

if (isLoading) {
  return <LoadingSpinner />;
}

if (isSuperAdmin) {
  // Render SuperAdmin content
}
```

### 2. Use Policy-Based Authorization

Instead of checking roles in code, use authorization policies:

```csharp
[Authorize(Policy = PolicyNames.AdminAccess)]
```

### 3. Centralize Role Logic

Use the role utilities and hooks instead of duplicating logic:

```typescript
// Good ✅
import { isSuperAdmin } from '@/lib/roles';
if (isSuperAdmin(roles)) { }

// Bad ❌
if (roles.includes('SuperAdmin')) { }
```

### 4. Keep Backward Compatibility

During migration, maintain both systems:

```csharp
// Keep boolean properties for backward compatibility
IsAdmin = roleName == RoleNames.Admin || roleName == RoleNames.SuperAdmin,
IsSuperAdmin = roleName == RoleNames.SuperAdmin,
```

---

## 📚 Additional Resources

- **ASP.NET Identity Documentation**: https://docs.microsoft.com/en-us/aspnet/core/security/authentication/identity
- **JWT Claims**: https://jwt.io/introduction
- **React Hooks Best Practices**: https://react.dev/reference/react

---

## ✅ Verification Checklist

- [ ] Backend API starts without errors
- [ ] All four roles are seeded automatically
- [ ] Test users can login successfully
- [ ] JWT tokens include role claims
- [ ] SuperAdmin can access Role Management page
- [ ] Admin cannot access Role Management page
- [ ] Role badges display with correct colors
- [ ] Role assignment works correctly
- [ ] Role removal works correctly
- [ ] Navigation menu shows/hides based on roles
- [ ] API endpoints respect role-based authorization

---

## 🎉 Summary

You now have a complete role-based authorization system with:

✅ Four distinct user roles (SuperAdmin, Admin, Operation, PublicUser)
✅ Backend ASP.NET Identity integration
✅ Frontend React hooks and utilities
✅ Role management UI for SuperAdmin
✅ JWT token integration
✅ Policy-based authorization
✅ Backward compatibility
✅ Comprehensive testing guide
✅ Migration path

The system is production-ready and can be gradually migrated from the old boolean-based system!

