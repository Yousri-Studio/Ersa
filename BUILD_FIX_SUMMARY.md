# Build Fix - CartItem and WishlistItem Property Errors

## Problem

Build failed with these errors:

```
error CS1061: 'CartItem' does not contain a definition for 'UserId'
error CS1061: 'WishlistItem' does not contain a definition for 'UserId'
```

## Root Cause

`CartItem` and `WishlistItem` don't have a direct `UserId` property. They use an **indirect relationship**:

```
User → Cart → CartItem
User → Wishlist → WishlistItem
```

**Entity Structure**:
- `Cart` has `UserId` (nullable)
- `CartItem` has `CartId` (links to Cart)
- `Wishlist` has `UserId` 
- `WishlistItem` has `WishlistId` (links to Wishlist)

## Solution

Updated the deletion logic to use the proper relationships through navigation properties.

### Before (Incorrect):
```csharp
// ❌ Wrong - CartItem doesn't have UserId
var cartItems = await context.CartItems
    .Where(ci => userIds.Contains(ci.UserId))  // ERROR!
    .ToListAsync();

// ❌ Wrong - WishlistItem doesn't have UserId
var wishlistItems = await context.WishlistItems
    .Where(wi => userIds.Contains(wi.UserId))  // ERROR!
    .ToListAsync();
```

### After (Correct):
```csharp
// ✅ Correct - Access UserId through Cart navigation property
var cartItems = await context.CartItems
    .Where(ci => ci.Cart.UserId.HasValue && userIds.Contains(ci.Cart.UserId.Value))
    .ToListAsync();

// Delete CartItems first, then Carts
context.CartItems.RemoveRange(cartItems);

var carts = await context.Carts
    .Where(c => c.UserId.HasValue && userIds.Contains(c.UserId.Value))
    .ToListAsync();
context.Carts.RemoveRange(carts);

// ✅ Correct - Access UserId through Wishlist navigation property
var wishlistItems = await context.WishlistItems
    .Where(wi => userIds.Contains(wi.Wishlist.UserId))
    .ToListAsync();

// Delete WishlistItems first, then Wishlists
context.WishlistItems.RemoveRange(wishlistItems);

var wishlists = await context.Wishlists
    .Where(w => userIds.Contains(w.UserId))
    .ToListAsync();
context.Wishlists.RemoveRange(wishlists);
```

## Updated Deletion Order

The complete proper deletion order is now:

1. **Enrollments** (User → Enrollment)
2. **Payments** (User → Order → Payment)
3. **Bills** (User → Order → Bill)
4. **OrderItems** (User → Order → OrderItem)
5. **Orders** (User → Order)
6. **CartItems** (User → Cart → CartItem) ← Fixed
7. **Carts** (User → Cart) ← Added
8. **WishlistItems** (User → Wishlist → WishlistItem) ← Fixed
9. **Wishlists** (User → Wishlist) ← Added
10. **Identity records** (AspNetUserRoles, UserTokens, UserLogins, UserClaims)
11. **Users** (finally delete the users)

## Files Updated

### 1. `backend/src/DeleteOldDomainUsers.cs`

**Changes**:
- Fixed CartItems deletion to use `ci.Cart.UserId`
- Added Carts deletion after CartItems
- Fixed WishlistItems deletion to use `wi.Wishlist.UserId`
- Added Wishlists deletion after WishlistItems
- Added logging for new deletion steps

### 2. `backend/scripts/CleanupDatabase.sql`

**Changes**:
```sql
-- Fixed CartItems deletion
DELETE FROM [CartItems] WHERE CartId IN (
    SELECT Id FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
);

-- Added Carts deletion
DELETE FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);

-- Fixed WishlistItems deletion
DELETE FROM [WishlistItems] WHERE WishlistId IN (
    SELECT Id FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
);

-- Added Wishlists deletion
DELETE FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
```

## Build Status

✅ **Build Succeeded!**

```
Build succeeded with 29 warning(s) in 6.1s
```

The warnings are only nullable reference warnings and minor code analysis issues - nothing that prevents the app from running.

## Testing

After restart, the application should now:

1. ✅ Build successfully (no errors)
2. ✅ Delete CartItems properly through Cart relationship
3. ✅ Delete Carts for old domain users
4. ✅ Delete WishlistItems properly through Wishlist relationship
5. ✅ Delete Wishlists for old domain users
6. ✅ Delete all Orders and related data
7. ✅ Delete users with old domain
8. ✅ Seed 14 new courses from Excel

## Entity Relationship Diagram

```
User (1) ───┬─── (N) Order ───── (N) OrderItem
            │                  ├─── (N) Payment
            │                  └─── (1) Bill
            │
            ├─── (1) Cart ────── (N) CartItem
            │
            ├─── (1) Wishlist ── (N) WishlistItem
            │
            └─── (N) Enrollment
```

**Key Point**: Cart and Wishlist are the linking tables between User and their items.

## Verification

After running, verify with:

```sql
-- Check carts (should be 0 for old domain users)
SELECT COUNT(*) FROM Carts 
WHERE UserId IN (
    SELECT Id FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%'
);

-- Check wishlists (should be 0 for old domain users)
SELECT COUNT(*) FROM Wishlists 
WHERE UserId IN (
    SELECT Id FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%'
);

-- Check users (should be 0)
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%';
```

## Related Fixes

This is the second fix in the cleanup process:

1. **First Fix**: FK constraint error when deleting users (FK_CONSTRAINT_FIX.md)
2. **Second Fix**: Build errors for CartItem/WishlistItem properties (this document)

Both fixes are now applied and the application should work correctly.

---

**Issue**: Build errors on CartItem.UserId and WishlistItem.UserId  
**Fixed**: 2025-10-10  
**Files Modified**: 2  
**Build Status**: ✅ Success  
**Impact**: Resolves compilation errors and ensures proper deletion of cart/wishlist data

