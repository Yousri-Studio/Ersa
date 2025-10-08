# Database Reseed Instructions

## Purpose
This guide will help you reseed the database with the updated Course, CourseCategory, and CourseSubCategory data after applying the schema migrations.

## Prerequisites
- The migration `UpdateInstructorNameLocalizationAndConfig` has been applied
- Database schema is up to date
- You have access to execute SQL commands on the database

## Option 1: Clear and Reseed via SQL (Recommended)

Execute the following SQL commands in order on your database:

```sql
-- Step 1: Disable foreign key constraints temporarily
ALTER TABLE [CourseSubCategoryMappings] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Courses] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] NOCHECK CONSTRAINT ALL;
ALTER TABLE [Orders] NOCHECK CONSTRAINT ALL;

-- Step 2: Clear existing course-related data
DELETE FROM [CourseSubCategoryMappings];
DELETE FROM [Enrollments] WHERE CourseId IN (SELECT Id FROM [Courses]);
DELETE FROM [OrderItems] WHERE CourseId IN (SELECT Id FROM [Courses]);
DELETE FROM [Courses];
DELETE FROM [CourseSubCategories];
DELETE FROM [CourseCategories];

-- Step 3: Re-enable foreign key constraints
ALTER TABLE [CourseSubCategoryMappings] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Courses] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Enrollments] WITH CHECK CHECK CONSTRAINT ALL;
ALTER TABLE [Orders] WITH CHECK CHECK CONSTRAINT ALL;

-- Step 4: Reseed IDENTITY columns (if any)
-- DBCC CHECKIDENT ('[Courses]', RESEED, 0);
```

After running the SQL, **restart your application**. The `SeedData` class will automatically populate:
- 3 Course Categories
- 8 Course SubCategories
- 12 Courses with localized instructor names and course topics
- Course-SubCategory mappings (many-to-many relationships)

## Option 2: Manual Database Reset via Entity Framework

If you want to completely reset the database:

```bash
# WARNING: This will delete ALL data in the database!
cd backend/src
dotnet ef database drop --force
dotnet ef database update
```

Then restart the application to trigger automatic seeding.

## Option 3: Programmatic Reseed (Developer Mode)

Add a temporary endpoint to your API for development purposes:

1. Add this to `AdminController.cs`:

```csharp
[HttpPost("reseed-courses")]
[Authorize(Roles = "SuperAdmin")]
public async Task<IActionResult> ReseedCourses()
{
    try
    {
        // Clear existing data
        var existingMappings = await _context.CourseSubCategoryMappings.ToListAsync();
        _context.CourseSubCategoryMappings.RemoveRange(existingMappings);
        
        var existingCourses = await _context.Courses.ToListAsync();
        _context.Courses.RemoveRange(existingCourses);
        
        var existingSubCategories = await _context.CourseSubCategories.ToListAsync();
        _context.CourseSubCategories.RemoveRange(existingSubCategories);
        
        var existingCategories = await _context.CourseCategories.ToListAsync();
        _context.CourseCategories.RemoveRange(existingCategories);
        
        await _context.SaveChangesAsync();
        
        // Trigger reseed by restarting the application or manually calling seed methods
        return Ok(new { message = "Course data cleared. Restart the application to reseed." });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { error = ex.Message });
    }
}
```

2. Call the endpoint as SuperAdmin
3. Restart the application

## Verification

After reseeding, verify the data:

### Check Categories
```sql
SELECT * FROM [CourseCategories] ORDER BY DisplayOrder;
```
Expected: 3 categories (Professional Certifications, Custom Programs, General Courses)

### Check SubCategories
```sql
SELECT * FROM [CourseSubCategories] ORDER BY DisplayOrder;
```
Expected: 8 subcategories (Insurance, Project Management, Soft Skills, HR, Programming, Digital Marketing, Data Science & AI, Design)

### Check Courses
```sql
SELECT 
    Id, 
    TitleEn, 
    InstructorNameAr, 
    InstructorNameEn, 
    CategoryId,
    CourseTopicsEn
FROM [Courses];
```
Expected: 12 courses with localized instructor names and course topics

### Check Mappings
```sql
SELECT 
    c.TitleEn AS CourseName,
    sc.TitleEn AS SubCategoryName
FROM [CourseSubCategoryMappings] csm
JOIN [Courses] c ON csm.CourseId = c.Id
JOIN [CourseSubCategories] sc ON csm.SubCategoryId = sc.Id
ORDER BY c.TitleEn;
```
Expected: Multiple mappings showing many-to-many relationships

## What Gets Seeded

### Course Categories (3 total):
1. **Professional Certifications** (الشهادات المهنية)
2. **Custom Programs** (البرامج المخصصة)
3. **General Courses** (الدورات العامة)

### Course SubCategories (8 total):
1. **Insurance** (التأمين)
2. **Project Management** (إدارة المشاريع)
3. **Soft Skills** (المهارات الناعمة)
4. **Human Resources** (الموارد البشرية)
5. **Programming & Software Development** (البرمجة وتطوير البرمجيات)
6. **Digital Marketing** (التسويق الرقمي)
7. **Data Science & AI** (علم البيانات والذكاء الاصطناعي)
8. **Design** (التصميم)

### Courses (12 total):
Each course includes:
- Localized titles (Arabic & English)
- Localized descriptions
- **Localized instructor names** (InstructorNameAr & InstructorNameEn)
- **Localized course topics** (CourseTopicsAr & CourseTopicsEn)
- Category association
- SubCategory mappings (many-to-many)
- Price, duration, and other metadata

### Sample Courses:
1. **Advanced Project Management** (إدارة المشاريع المتقدمة)
   - Instructor: محمد أحمد / Mohammed Ahmed
   - Category: Professional Certifications
   - SubCategories: Project Management, Soft Skills

2. **Digital Marketing Fundamentals** (أساسيات التسويق الرقمي)
   - Instructor: سارة محمود / Sarah Mahmoud
   - Category: General Courses
   - SubCategories: Digital Marketing

3. **Data Science with Python** (علم البيانات باستخدام بايثون)
   - Instructor: أحمد عبدالله / Ahmed Abdullah
   - Category: Professional Certifications
   - SubCategories: Data Science & AI, Programming

... and 9 more courses!

## Important Notes

⚠️ **Warning**: Clearing course data will also affect:
- Enrollments (students enrolled in courses)
- Orders (course purchases)
- Any other data related to courses

💡 **Recommendation**: Only reseed in development/testing environments or after backing up production data.

✅ **After Reseeding**: Test the admin panel to ensure all course data displays correctly with:
- Categories displayed in dropdowns
- SubCategories selectable (multi-select)
- Instructor names showing in both languages
- Course topics visible
- Table displaying subcategories as comma-separated text

## Troubleshooting

### Issue: "Courses already exist, skipping seed"
**Solution**: Clear existing courses using one of the options above.

### Issue: Foreign key constraint errors
**Solution**: Make sure to delete data in the correct order (mappings → courses → subcategories → categories).

### Issue: Migration not applied
**Solution**: 
```bash
cd backend/src
dotnet ef database update
```

### Issue: Old InstructorName column still exists
**Solution**: The migration should have renamed it to `InstructorNameEn`. Check your migration file and database schema.

## Success Indicators

✅ Database has 3 categories
✅ Database has 8 subcategories
✅ Database has 12 courses
✅ All courses have InstructorNameAr and InstructorNameEn
✅ All courses have CourseTopicsAr and CourseTopicsEn
✅ All courses are associated with categories
✅ Courses have subcategory mappings
✅ Admin panel displays all data correctly
✅ Frontend course forms show category/subcategory dropdowns

---

**Need Help?** Check the application logs for seeding status messages.

