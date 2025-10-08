-- =====================================================
-- Clear and Reseed Course Data Script
-- =====================================================
-- Purpose: Clear existing course-related data to allow
--          SeedData to repopulate with updated schema
-- 
-- IMPORTANT: Run this in a development environment first!
-- =====================================================

USE [db_abea46_ersatraining];
GO

PRINT 'Starting course data cleanup...';
GO

-- Step 1: Disable foreign key constraints temporarily
PRINT 'Disabling foreign key constraints...';
ALTER TABLE [CourseSubCategoryMappings] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Courses] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Orders] NOCHECK CONSTRAINT ALL;
GO

-- Step 2: Delete course-related data (in correct order to avoid FK violations)
PRINT 'Deleting CourseSubCategoryMappings...';
DELETE FROM [CourseSubCategoryMappings];
GO

PRINT 'Deleting Enrollments related to courses...';
DELETE FROM [Enrollments] WHERE CourseId IN (SELECT Id FROM [Courses]);
GO

PRINT 'Deleting OrderItems related to courses...';
DELETE FROM [OrderItems] WHERE CourseId IN (SELECT Id FROM [Courses]);
GO

PRINT 'Deleting Courses...';
DELETE FROM [Courses];
GO

PRINT 'Deleting CourseSubCategories...';
DELETE FROM [CourseSubCategories];
GO

PRINT 'Deleting CourseCategories...';
DELETE FROM [CourseCategories];
GO

-- Step 3: Re-enable foreign key constraints
PRINT 'Re-enabling foreign key constraints...';
ALTER TABLE [CourseSubCategoryMappings] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Courses] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Orders] WITH CHECK CHECK CONSTRAINT ALL;
GO

-- Step 4: Verify deletion
PRINT '==========================================';
PRINT 'Verification Results:';
PRINT '==========================================';

DECLARE @CourseCount INT = (SELECT COUNT(*) FROM [Courses]);
DECLARE @CategoryCount INT = (SELECT COUNT(*) FROM [CourseCategories]);
DECLARE @SubCategoryCount INT = (SELECT COUNT(*) FROM [CourseSubCategories]);
DECLARE @MappingCount INT = (SELECT COUNT(*) FROM [CourseSubCategoryMappings]);

PRINT 'Courses remaining: ' + CAST(@CourseCount AS VARCHAR(10));
PRINT 'Categories remaining: ' + CAST(@CategoryCount AS VARCHAR(10));
PRINT 'SubCategories remaining: ' + CAST(@SubCategoryCount AS VARCHAR(10));
PRINT 'Mappings remaining: ' + CAST(@MappingCount AS VARCHAR(10));

IF @CourseCount = 0 AND @CategoryCount = 0 AND @SubCategoryCount = 0 AND @MappingCount = 0
BEGIN
    PRINT '==========================================';
    PRINT 'SUCCESS! All course data cleared.';
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
PRINT 'Expected after reseeding:';
PRINT '  - 3 Course Categories';
PRINT '  - 8 Course SubCategories';
PRINT '  - 12 Courses (with localized instructor names and topics)';
PRINT '  - Multiple Course-SubCategory mappings';
GO

