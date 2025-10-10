# Foreign Key Constraint Error - Fixed

## Problem

When trying to delete users with the old domain (`ersatraining.com`), the application encountered this error:

```
The DELETE statement conflicted with the REFERENCE constraint "FK_Orders_AspNetUsers_UserId". 
The conflict occurred in database "db_abea46_ersatraining", table "dbo.Orders", column 'UserId'.
```

**Root Cause**: Users with the old domain had Orders associated with them. When trying to delete the users, the foreign key constraint prevented the deletion because Orders still referenced those users.

## Solution

Updated `DeleteOldDomainUsers.cs` to delete all related data **before** deleting the users themselves.

### Deletion Order (Fixed):

1. **Enrollments** → Delete user enrollments first
2. **Payments** → Delete payments for user's orders
3. **Bills** → Delete bills for user's orders
4. **OrderItems** → Delete items in user's orders
5. **Orders** → Delete user's orders
6. **CartItems** → Delete user's cart items
7. **WishlistItems** → Delete user's wishlist items
8. **Identity Records** → Delete AspNetUserRoles, UserTokens, UserLogins, UserClaims
9. **Users** → Finally delete the users themselves

## Files Updated

### 1. `backend/src/DeleteOldDomainUsers.cs`

**Changes**:
- Added step-by-step deletion of all related data before deleting users
- Added logging for each deletion step
- Added check for zero users (skip if none found)
- Proper error handling maintained

**Before** (Problematic):
```csharp
// Directly tried to delete users
var result = await userManager.DeleteAsync(user);
```

**After** (Fixed):
```csharp
// Step 1: Delete all related data first
var enrollments = await context.Enrollments.Where(e => userIds.Contains(e.UserId)).ToListAsync();
context.Enrollments.RemoveRange(enrollments);
// ... delete orders, payments, bills, cart items, wishlist items ...

// Step 2: Now delete the users
var result = await userManager.DeleteAsync(user);
```

### 2. `backend/scripts/CleanupDatabase.sql`

**Changes**:
- Updated to use temporary table for user IDs
- Proper deletion order matching the C# code
- Better error handling and logging
- Checks if users exist before attempting deletion

**Key Improvement**:
```sql
-- Create temporary table to store user IDs
DECLARE @OldDomainUserIds TABLE (UserId UNIQUEIDENTIFIER);

-- Delete in proper order
DELETE FROM [Enrollments] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
DELETE FROM [Payments] WHERE OrderId IN (...);
DELETE FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
-- ... etc ...

-- Finally delete users
DELETE FROM [AspNetUsers] WHERE Id IN (SELECT UserId FROM @OldDomainUserIds);
```

## Testing

After the fix, the application should:

✅ Successfully delete users with old domain
✅ Delete all their orders and related data
✅ No foreign key constraint violations
✅ Log each step for debugging
✅ Continue with normal seeding process

## Expected Log Output

When running the updated code, you should see:

```
[INFO] Starting deletion of users with old domain...
[INFO] Found 5 users with old domain to delete
[INFO] Deleting 12 enrollments
[INFO] Deleting 3 payments
[INFO] Deleting 3 bills
[INFO] Deleting 8 order items
[INFO] Deleting 3 orders
[INFO] Deleting 5 cart items
[INFO] Deleting 2 wishlist items
[INFO] Successfully deleted all related data for old domain users
[INFO] Deleting user: test@ersatraining.com
[INFO] Successfully deleted user: test@ersatraining.com
[INFO] Successfully deleted 5 users with old domain and all their related data
```

## Verification

After running the cleanup, verify with these queries:

```sql
-- Should return 0
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%';

-- Should return 0 (no orphaned orders)
SELECT COUNT(*) FROM Orders WHERE UserId NOT IN (SELECT Id FROM AspNetUsers);

-- Should show only new domain users
SELECT Email FROM AspNetUsers WHERE Email LIKE '%ersa-training.com%';
```

## Why This Happens

Foreign key constraints ensure **referential integrity** in the database:

```
User (Parent) ←──FK_Orders_AspNetUsers_UserId── Order (Child)
```

You **cannot delete** a parent record (User) if child records (Orders) still reference it, unless you:

1. ✅ Delete child records first (our solution)
2. Set FK to CASCADE DELETE (not recommended - loses order history)
3. Set FK to SET NULL (not applicable - UserId is required)

## Prevention

To prevent this in the future:

1. **Always delete in reverse dependency order**:
   - Child records first
   - Parent records last

2. **Use transactions** for multi-step deletions:
   ```csharp
   using var transaction = await context.Database.BeginTransactionAsync();
   try {
       // Delete all related data
       // Delete users
       await transaction.CommitAsync();
   } catch {
       await transaction.RollbackAsync();
   }
   ```

3. **Check for dependencies** before deletion:
   ```csharp
   var hasOrders = await context.Orders.AnyAsync(o => userIds.Contains(o.UserId));
   if (hasOrders) {
       // Delete orders first
   }
   ```

## Related Files

- `backend/src/DeleteOldDomainUsers.cs` - Fixed C# code
- `backend/scripts/CleanupDatabase.sql` - Fixed SQL script
- `DATABASE_CLEANUP_QUICKSTART.md` - Usage guide
- `CLEANUP_AND_RESEED_SUMMARY.md` - Complete documentation

## Status

✅ **FIXED** - Both C# and SQL scripts now handle foreign key constraints properly

---

**Issue**: FK Constraint Error  
**Fixed**: 2025-10-10  
**Files Modified**: 2  
**Impact**: Resolves user deletion errors during database cleanup

