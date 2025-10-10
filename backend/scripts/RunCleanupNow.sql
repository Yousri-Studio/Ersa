-- =====================================================
-- IMMEDIATE Database Cleanup Script
-- =====================================================
-- Run this script in Azure Portal Query Editor or SSMS
-- =====================================================

USE [db_abea46_ersatraining];
GO

PRINT '========================================';
PRINT 'Starting Database Cleanup Process';
PRINT '========================================';
PRINT '';

-- Step 1: Disable foreign key constraints
PRINT 'Step 1: Disabling FK constraints...';
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
ALTER TABLE [Carts] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Wishlists] NOCHECK CONSTRAINT ALL;
PRINT '✓ FK constraints disabled';
GO

-- Step 2: Delete ALL Orders and Related Data
PRINT '';
PRINT 'Step 2: Deleting ALL orders and related data...';

PRINT '  Deleting Payments...';
DELETE FROM [Payments];
PRINT '  Deleting Bills...';
DELETE FROM [Bills];
PRINT '  Deleting Enrollments...';
DELETE FROM [Enrollments];
PRINT '  Deleting OrderItems...';
DELETE FROM [OrderItems];
PRINT '  Deleting Orders...';
DELETE FROM [Orders];

DECLARE @DeletedOrders INT = @@ROWCOUNT;
PRINT '✓ Deleted all orders and related data';
GO

-- Step 3: Delete ALL Courses and Related Data
PRINT '';
PRINT 'Step 3: Deleting ALL courses and related data...';

PRINT '  Deleting CourseInstructors...';
DELETE FROM [CourseInstructors];
PRINT '  Deleting Attachments...';
DELETE FROM [Attachments];
PRINT '  Deleting Sessions...';
DELETE FROM [Sessions];
PRINT '  Deleting WishlistItems...';
DELETE FROM [WishlistItems];
PRINT '  Deleting CartItems...';
DELETE FROM [CartItems];
PRINT '  Deleting CourseSubCategoryMappings...';
DELETE FROM [CourseSubCategoryMappings];
PRINT '  Deleting Courses...';
DELETE FROM [Courses];

DECLARE @DeletedCourses INT = @@ROWCOUNT;
PRINT '✓ Deleted all courses and related data';
GO

-- Step 4: Delete Old Domain Users
PRINT '';
PRINT 'Step 4: Deleting users with OLD domain (ersatraining.com)...';

-- Find old domain users
DECLARE @OldDomainUserIds TABLE (UserId UNIQUEIDENTIFIER);
INSERT INTO @OldDomainUserIds (UserId)
SELECT Id FROM [AspNetUsers] WHERE Email LIKE '%ersatraining.com%';

DECLARE @OldUserCount INT = (SELECT COUNT(*) FROM @OldDomainUserIds);
PRINT '  Found ' + CAST(@OldUserCount AS VARCHAR(10)) + ' old domain users';

IF @OldUserCount > 0
BEGIN
    -- Delete all related data for old domain users
    PRINT '  Deleting Enrollments for old users...';
    DELETE FROM [Enrollments] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '  Deleting Payments for old users...';
    DELETE FROM [Payments] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    PRINT '  Deleting Bills for old users...';
    DELETE FROM [Bills] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    PRINT '  Deleting OrderItems for old users...';
    DELETE FROM [OrderItems] WHERE OrderId IN (
        SELECT Id FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    PRINT '  Deleting Orders for old users...';
    DELETE FROM [Orders] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '  Deleting CartItems for old users...';
    DELETE FROM [CartItems] WHERE CartId IN (
        SELECT Id FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    PRINT '  Deleting Carts for old users...';
    DELETE FROM [Carts] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '  Deleting WishlistItems for old users...';
    DELETE FROM [WishlistItems] WHERE WishlistId IN (
        SELECT Id FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds)
    );
    
    PRINT '  Deleting Wishlists for old users...';
    DELETE FROM [Wishlists] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '  Deleting Identity records for old users...';
    DELETE FROM [AspNetUserRoles] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserTokens] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserLogins] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    DELETE FROM [AspNetUserClaims] WHERE UserId IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '  Deleting old domain users...';
    DELETE FROM [AspNetUsers] WHERE Id IN (SELECT UserId FROM @OldDomainUserIds);
    
    PRINT '✓ Deleted ' + CAST(@OldUserCount AS VARCHAR(10)) + ' old domain users and their data';
END
ELSE
BEGIN
    PRINT '✓ No old domain users found';
END
GO

-- Step 5: Re-enable FK constraints
PRINT '';
PRINT 'Step 5: Re-enabling FK constraints...';
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
ALTER TABLE [Carts] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Wishlists] WITH CHECK CHECK CONSTRAINT ALL;
PRINT '✓ FK constraints re-enabled';
GO

-- Step 6: Verification
PRINT '';
PRINT '========================================';
PRINT 'VERIFICATION RESULTS:';
PRINT '========================================';

DECLARE @FinalOrderCount INT = (SELECT COUNT(*) FROM [Orders]);
DECLARE @FinalCourseCount INT = (SELECT COUNT(*) FROM [Courses]);
DECLARE @FinalOldUserCount INT = (SELECT COUNT(*) FROM [AspNetUsers] WHERE Email LIKE '%ersatraining.com%');
DECLARE @NewUserCount INT = (SELECT COUNT(*) FROM [AspNetUsers] WHERE Email LIKE '%ersa-training.com%');

PRINT 'Orders remaining:           ' + CAST(@FinalOrderCount AS VARCHAR(10));
PRINT 'Courses remaining:          ' + CAST(@FinalCourseCount AS VARCHAR(10));
PRINT 'Old domain users remaining: ' + CAST(@FinalOldUserCount AS VARCHAR(10));
PRINT 'New domain users (kept):    ' + CAST(@NewUserCount AS VARCHAR(10));

IF @FinalOrderCount = 0 AND @FinalCourseCount = 0 AND @FinalOldUserCount = 0
BEGIN
    PRINT '';
    PRINT '========================================';
    PRINT '✓✓✓ SUCCESS! ✓✓✓';
    PRINT '========================================';
    PRINT 'All cleanup completed successfully!';
    PRINT '';
    PRINT 'NEXT STEP:';
    PRINT 'Restart your application to seed 14 new courses from Excel.';
    PRINT '========================================';
END
ELSE
BEGIN
    PRINT '';
    PRINT '========================================';
    PRINT '⚠ WARNING! ⚠';
    PRINT '========================================';
    PRINT 'Some data remains. Please check errors above.';
    PRINT '========================================';
END

PRINT '';
PRINT 'Script execution completed!';
GO

