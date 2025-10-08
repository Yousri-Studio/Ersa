-- =====================================================
-- Update Existing Courses with Localized Instructor Names
-- =====================================================
-- Purpose: Add localized instructor names to existing courses
--          without deleting any data
-- =====================================================

USE [db_abea46_ersatraining];
GO

PRINT '======================================'
PRINT 'Updating Existing Courses'
PRINT '======================================'
PRINT ''

-- This script will:
-- 1. Copy existing InstructorNameEn (which was renamed from InstructorName)
-- 2. Add corresponding Arabic names
-- 3. Ensure all courses have both AR and EN instructor names

PRINT 'Step 1: Checking current state...'
GO

-- Check how many courses need updating
DECLARE @TotalCourses INT = (SELECT COUNT(*) FROM Courses);
DECLARE @CoursesWithBothNames INT = (
    SELECT COUNT(*) FROM Courses 
    WHERE InstructorNameAr IS NOT NULL AND InstructorNameAr != ''
    AND InstructorNameEn IS NOT NULL AND InstructorNameEn != ''
);

PRINT 'Total Courses: ' + CAST(@TotalCourses AS VARCHAR(10));
PRINT 'Courses with both names: ' + CAST(@CoursesWithBothNames AS VARCHAR(10));
PRINT ''

-- If InstructorNameEn is empty but InstructorName exists in old schema,
-- we need to populate it. But since migration already renamed it, 
-- InstructorNameEn should have the old values.

PRINT 'Step 2: Adding sample localized instructor names...'
PRINT '(Update these based on your actual course data)'
GO

-- Example updates - customize these based on your actual courses
-- You can check your courses first with: SELECT Id, TitleEn, InstructorNameEn FROM Courses;

-- Update courses where InstructorNameAr is empty
-- Add default Arabic names based on English names
UPDATE Courses
SET 
    InstructorNameAr = CASE 
        WHEN InstructorNameEn LIKE '%Ahmad%' OR InstructorNameEn LIKE '%Ahmed%' THEN 'أحمد'
        WHEN InstructorNameEn LIKE '%Sarah%' OR InstructorNameEn LIKE '%Sara%' THEN 'سارة'
        WHEN InstructorNameEn LIKE '%Mohammad%' OR InstructorNameEn LIKE '%Mohammed%' THEN 'محمد'
        WHEN InstructorNameEn LIKE '%Fatima%' OR InstructorNameEn LIKE '%Fatimah%' THEN 'فاطمة'
        WHEN InstructorNameEn LIKE '%Ali%' THEN 'علي'
        WHEN InstructorNameEn LIKE '%Omar%' OR InstructorNameEn LIKE '%Umar%' THEN 'عمر'
        WHEN InstructorNameEn LIKE '%Khalid%' THEN 'خالد'
        WHEN InstructorNameEn LIKE '%Yasser%' OR InstructorNameEn LIKE '%Yasir%' THEN 'ياسر'
        WHEN InstructorNameEn LIKE '%Maryam%' OR InstructorNameEn LIKE '%Mariam%' THEN 'مريم'
        WHEN InstructorNameEn LIKE '%Nora%' OR InstructorNameEn LIKE '%Noura%' THEN 'نورا'
        WHEN InstructorNameEn LIKE '%Salman%' THEN 'سلمان'
        ELSE 'المدرب' -- Default: "The Instructor"
    END,
    UpdatedAt = GETUTCDATE()
WHERE (InstructorNameAr IS NULL OR InstructorNameAr = '')
AND InstructorNameEn IS NOT NULL AND InstructorNameEn != '';

PRINT '✓ Updated InstructorNameAr for courses'
GO

-- Ensure InstructorNameEn is not empty
UPDATE Courses
SET 
    InstructorNameEn = 'Instructor',
    UpdatedAt = GETUTCDATE()
WHERE InstructorNameEn IS NULL OR InstructorNameEn = '';

PRINT '✓ Ensured InstructorNameEn is populated'
GO

-- Optional: Add sample course topics if they're empty
UPDATE Courses
SET 
    CourseTopicsEn = 'Course fundamentals, Practical applications, Best practices, Advanced techniques',
    CourseTopicsAr = 'أساسيات الدورة، التطبيقات العملية، أفضل الممارسات، التقنيات المتقدمة',
    UpdatedAt = GETUTCDATE()
WHERE (CourseTopicsEn IS NULL OR CourseTopicsEn = '')
AND (CourseTopicsAr IS NULL OR CourseTopicsAr = '');

PRINT '✓ Added default course topics where missing'
GO

PRINT ''
PRINT '======================================'
PRINT 'Verification'
PRINT '======================================'

-- Show updated courses
SELECT 
    TitleEn AS [Course Title],
    InstructorNameEn AS [Instructor (EN)],
    InstructorNameAr AS [Instructor (AR)],
    CASE 
        WHEN CourseTopicsEn IS NOT NULL THEN 'Yes' 
        ELSE 'No' 
    END AS [Has Topics],
    FORMAT(UpdatedAt, 'yyyy-MM-dd HH:mm') AS [Updated]
FROM Courses
ORDER BY UpdatedAt DESC;

-- Final counts
DECLARE @UpdatedCoursesWithBothNames INT = (
    SELECT COUNT(*) FROM Courses 
    WHERE InstructorNameAr IS NOT NULL AND InstructorNameAr != ''
    AND InstructorNameEn IS NOT NULL AND InstructorNameEn != ''
);

PRINT ''
PRINT 'Updated Courses: ' + CAST(@UpdatedCoursesWithBothNames AS VARCHAR(10)) + ' / ' + CAST(@TotalCourses AS VARCHAR(10));

IF @UpdatedCoursesWithBothNames = @TotalCourses
BEGIN
    PRINT ''
    PRINT '======================================'
    PRINT '✓ SUCCESS! All courses updated!'
    PRINT '======================================'
END
ELSE
BEGIN
    PRINT ''
    PRINT '⚠️  Some courses may need manual updates'
    PRINT 'Check the results above'
END

PRINT ''
PRINT 'Next: Restart your application to verify the changes'
GO

