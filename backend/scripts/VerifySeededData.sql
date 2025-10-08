-- =====================================================
-- Verify Seeded Course Data Script
-- =====================================================
-- Purpose: Verify that all course-related data has been
--          properly seeded after running the application
-- =====================================================

USE [db_abea46_ersatraining];
GO

PRINT '==========================================';
PRINT 'COURSE DATA VERIFICATION REPORT';
PRINT '==========================================';
PRINT '';

-- Check Categories
PRINT '1. COURSE CATEGORIES:';
PRINT '-------------------------------------------';
SELECT 
    COUNT(*) AS TotalCategories,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveCategories
FROM [CourseCategories];

SELECT 
    ROW_NUMBER() OVER (ORDER BY DisplayOrder) AS [#],
    TitleEn AS [Category Name],
    TitleAr AS [الاسم بالعربي],
    DisplayOrder AS [Order],
    IsActive AS [Active],
    FORMAT(CreatedAt, 'yyyy-MM-dd HH:mm') AS [Created]
FROM [CourseCategories]
ORDER BY DisplayOrder;
PRINT '';

-- Check SubCategories
PRINT '2. COURSE SUBCATEGORIES:';
PRINT '-------------------------------------------';
SELECT 
    COUNT(*) AS TotalSubCategories,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveSubCategories
FROM [CourseSubCategories];

SELECT 
    ROW_NUMBER() OVER (ORDER BY DisplayOrder) AS [#],
    TitleEn AS [SubCategory Name],
    TitleAr AS [الاسم بالعربي],
    DisplayOrder AS [Order],
    IsActive AS [Active]
FROM [CourseSubCategories]
ORDER BY DisplayOrder;
PRINT '';

-- Check Courses
PRINT '3. COURSES:';
PRINT '-------------------------------------------';
SELECT 
    COUNT(*) AS TotalCourses,
    SUM(CASE WHEN IsActive = 1 THEN 1 ELSE 0 END) AS ActiveCourses,
    SUM(CASE WHEN IsFeatured = 1 THEN 1 ELSE 0 END) AS FeaturedCourses,
    SUM(CASE WHEN CategoryId IS NOT NULL THEN 1 ELSE 0 END) AS CoursesWithCategory
FROM [Courses];

SELECT 
    ROW_NUMBER() OVER (ORDER BY CreatedAt) AS [#],
    LEFT(TitleEn, 40) AS [Course Title],
    InstructorNameEn AS [Instructor (EN)],
    InstructorNameAr AS [Instructor (AR)],
    Price,
    Currency,
    CASE WHEN CategoryId IS NOT NULL THEN 'Yes' ELSE 'No' END AS [Has Category],
    CASE WHEN CourseTopicsEn IS NOT NULL THEN 'Yes' ELSE 'No' END AS [Has Topics],
    IsActive AS [Active],
    IsFeatured AS [Featured]
FROM [Courses]
ORDER BY CreatedAt;
PRINT '';

-- Check Course-SubCategory Mappings
PRINT '4. COURSE-SUBCATEGORY MAPPINGS:';
PRINT '-------------------------------------------';
SELECT 
    COUNT(*) AS TotalMappings,
    COUNT(DISTINCT CourseId) AS CoursesWithSubCategories,
    COUNT(DISTINCT SubCategoryId) AS SubCategoriesUsed
FROM [CourseSubCategoryMappings];

SELECT TOP 20
    c.TitleEn AS [Course],
    sc.TitleEn AS [SubCategory],
    FORMAT(csm.CreatedAt, 'yyyy-MM-dd') AS [Mapped Date]
FROM [CourseSubCategoryMappings] csm
JOIN [Courses] c ON csm.CourseId = c.Id
JOIN [CourseSubCategories] sc ON csm.SubCategoryId = sc.Id
ORDER BY c.TitleEn, sc.DisplayOrder;
PRINT '';

-- Check for Issues
PRINT '5. DATA INTEGRITY CHECKS:';
PRINT '-------------------------------------------';

-- Courses without categories
DECLARE @CoursesNoCat INT = (SELECT COUNT(*) FROM [Courses] WHERE CategoryId IS NULL);
PRINT 'Courses without categories: ' + CAST(@CoursesNoCat AS VARCHAR(10));

-- Courses without instructor names
DECLARE @CoursesNoInstructor INT = (
    SELECT COUNT(*) FROM [Courses] 
    WHERE InstructorNameAr IS NULL OR InstructorNameAr = '' 
       OR InstructorNameEn IS NULL OR InstructorNameEn = ''
);
PRINT 'Courses without instructor names: ' + CAST(@CoursesNoInstructor AS VARCHAR(10));

-- Courses without topics
DECLARE @CoursesNoTopics INT = (
    SELECT COUNT(*) FROM [Courses] 
    WHERE CourseTopicsAr IS NULL OR CourseTopicsEn IS NULL
);
PRINT 'Courses without topics: ' + CAST(@CoursesNoTopics AS VARCHAR(10));

-- Courses without subcategories
DECLARE @CoursesNoSubCat INT = (
    SELECT COUNT(*) FROM [Courses] c
    WHERE NOT EXISTS (
        SELECT 1 FROM [CourseSubCategoryMappings] csm 
        WHERE csm.CourseId = c.Id
    )
);
PRINT 'Courses without subcategories: ' + CAST(@CoursesNoSubCat AS VARCHAR(10));

PRINT '';

-- Summary
PRINT '==========================================';
PRINT 'EXPECTED VALUES:';
PRINT '==========================================';
PRINT 'Categories: 3';
PRINT 'SubCategories: 8';
PRINT 'Courses: 12';
PRINT 'All courses should have:';
PRINT '  - Category assigned';
PRINT '  - Instructor names (AR & EN)';
PRINT '  - Course topics (AR & EN)';
PRINT '  - At least one subcategory';
PRINT '';

-- Final Status
DECLARE @CatCount INT = (SELECT COUNT(*) FROM [CourseCategories]);
DECLARE @SubCatCount INT = (SELECT COUNT(*) FROM [CourseSubCategories]);
DECLARE @CourseCount INT = (SELECT COUNT(*) FROM [Courses]);
DECLARE @MappingCount INT = (SELECT COUNT(*) FROM [CourseSubCategoryMappings]);

IF @CatCount = 3 AND @SubCatCount = 8 AND @CourseCount = 12 AND @MappingCount > 0
    AND @CoursesNoCat = 0 AND @CoursesNoInstructor = 0 AND @CoursesNoTopics = 0
BEGIN
    PRINT '==========================================';
    PRINT '✅ SUCCESS! All data properly seeded.';
    PRINT '==========================================';
END
ELSE
BEGIN
    PRINT '==========================================';
    PRINT '⚠️  WARNING! Data may be incomplete.';
    PRINT '   Check the results above.';
    PRINT '==========================================';
END

PRINT '';
PRINT 'Verification complete!';
GO

