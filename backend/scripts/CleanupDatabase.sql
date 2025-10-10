-- =====================================================
-- Complete Database Cleanup Script
-- =====================================================
-- Purpose: Delete all orders, courses, and users with old domain
-- 
-- IMPORTANT: Run this in a development environment first!
-- =====================================================

PRINT 'Starting complete database cleanup...';
GO

-- Step 1: Disable foreign key constraints temporarily
PRINT 'Disabling foreign key constraints...';
ALTER TABLE [CourseSubCategoryMappings] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Courses] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Orders] NOCHECK CONSTRAINT ALL;
ALTER TABLE [OrderItems] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Bills] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Payments] NOCHECK CONSTRAINT ALL;
ALTER TABLE [CartItems] NOCHECK CONSTRAINT ALL;
ALTER TABLE [WishlistItems] NOCHECK CONSTRAINT ALL;
ALTER TABLE [CourseInstructors] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Sessions] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Attachments] NOCHECK CONSTRAINT ALL;
GO

-- Step 2: Delete Orders and Related Data
PRINT 'Deleting Payments...';
DELETE FROM [Payments];
GO

PRINT 'Deleting Bills...';
DELETE FROM [Bills];
GO

PRINT 'Deleting Enrollments...';
DELETE FROM [Enrollments];
GO

PRINT 'Deleting OrderItems...';
DELETE FROM [OrderItems];
GO

PRINT 'Deleting Orders...';
DELETE FROM [Orders];
GO

-- Step 3: Delete Course Related Data
PRINT 'Deleting CourseInstructors...';
DELETE FROM [CourseInstructors];
GO

PRINT 'Deleting Attachments...';
DELETE FROM [Attachments];
GO

PRINT 'Deleting Sessions...';
DELETE FROM [Sessions];
GO

PRINT 'Deleting WishlistItems...';
DELETE FROM [WishlistItems];
GO

PRINT 'Deleting CartItems...';
DELETE FROM [CartItems];
GO

PRINT 'Deleting CourseSubCategoryMappings...';
DELETE FROM [CourseSubCategoryMappings];
GO

PRINT 'Deleting Courses...';
DELETE FROM [Courses];
GO

-- Step 4: Delete Old Domain Users (and their related data)
PRINT 'Deleting users with ersatraining.com domain and their data...';

-- Create temporary table to store user IDs to delete
DECLARE @OldDomainUserIds TABLE (UserId UNIQUEIDENTIFIER);

INSERT INTO @OldDomainUserIds (UserId)
SELECT Id FROM [AspNetUsers] WHERE Email LIKE '%ersatraining.com%';

DECLARE @OldUserCount INT = (SELECT COUNT(*) FROM @OldDomainUserIds);
PRINT 'Found ' + CAST(@OldUserCount AS VARCHAR(10)) + ' old domain users to delete';

IF @OldUserCount > 0
BEGIN
    -- Delete Enrollments for these users (if not already deleted)
    DELETE FROM [Enrollments] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    -- Delete Payments for these users' orders (if not already deleted)
    DELETE FROM [Payments] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    -- Delete Bills for these users' orders (if not already deleted)
    DELETE FROM [Bills] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    -- Delete OrderItems for these users' orders (if not already deleted)
    DELETE FROM [OrderItems] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    -- Delete Orders for these users (if not already deleted)
    DELETE FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    -- Delete CartItems for these users (through Carts)
    DELETE FROM [CartItems] WHERE CartId IN (
        SELECT Id FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    -- Delete Carts for these users
    DELETE FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    -- Delete WishlistItems for these users (through Wishlists)
    DELETE FROM [WishlistItems] WHERE WishlistId IN (
        SELECT Id FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    -- Delete Wishlists for these users
    DELETE FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    -- Delete Identity-related records for these users
    DELETE FROM [AspNetUserRoles] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserTokens] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserLogins] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserClaims] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    -- Finally, delete the users themselves
    DELETE FROM [AspNetUsers] WHERE Id IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT 'Successfully deleted old domain users and their related data';
END
ELSE
BEGIN
    PRINT 'No old domain users found to delete';
END
GO

-- Step 5: Re-enable foreign key constraints
PRINT 'Re-enabling foreign key constraints...';
ALTER TABLE [CourseSubCategoryMappings] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Courses] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Orders] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [OrderItems] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Bills] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Payments] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [CartItems] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [WishlistItems] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [CourseInstructors] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Sessions] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Attachments] WITH CHECK CHECK CONSTRAINT ALL;
GO

-- Step 6: Verify deletion
PRINT '==========================================';
PRINT 'Verification Results:';
PRINT '==========================================';

DECLARE @OrderCount INT = (SELECT COUNT(*) FROM [Orders]);
DECLARE @CourseCount INT = (SELECT COUNT(*) FROM [Courses]);
DECLARE @OldDomainUserCount INT = (SELECT COUNT(*) FROM [AspNetUsers] WHERE Email LIKE '%ersatraining.com%');

PRINT 'Orders remaining: ' + CAST(@OrderCount AS VARCHAR(10));
PRINT 'Courses remaining: ' + CAST(@CourseCount AS VARCHAR(10));
PRINT 'Old domain users remaining: ' + CAST(@OldDomainUserCount AS VARCHAR(10));

IF @OrderCount = 0 AND @CourseCount = 0 AND @OldDomainUserCount = 0
BEGIN
    PRINT '==========================================';
    PRINT 'SUCCESS! Database cleaned successfully.';
    PRINT 'Next step: Restart your application to trigger automatic seeding.';
    PRINT '==========================================';
END
ELSE
BEGIN
    PRINT '==========================================';
    PRINT 'WARNING! Some data remains. Check for errors above.';
    PRINT '==========================================';
END
GO

PRINT '';
PRINT 'Script completed!';
GO

