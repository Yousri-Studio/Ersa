# Database Cleanup and Reseed Guide

This guide provides instructions for cleaning the database and reseeding it with fresh data from the Excel file.

## What Will Be Done

1. **Delete all orders** and related data (payments, bills, enrollments, order items)
2. **Delete all courses** and related data (course instructors, attachments, sessions, subcategory mappings)
3. **Delete all users with old domain** (`ersatraining.com`)
4. **Reseed courses** from the Excel file (`Products Details.xlsx`)
5. **Keep essential data** (categories, subcategories, instructors, content pages)

## Files Created

### 1. Excel Course Reader
- **Location**: `backend/scripts/ExcelCourseReader/`
- **Purpose**: Reads the Excel file and exports it to JSON format
- **Output**: `courses-from-excel.json`

### 2. Generated Course Seed Data
- **Location**: `backend/src/Data/Seeds/ExcelCourseSeedData.cs`
- **Purpose**: Contains the C# code to seed 14 courses from the Excel file
- **Content**: All course data including:
  - Titles (English & Arabic)
  - Summaries and descriptions
  - Prices, levels, types
  - Durations and schedules
  - Categories

### 3. Database Cleanup SQL Script
- **Location**: `backend/scripts/CleanupDatabase.sql`
- **Purpose**: SQL script to delete orders, courses, and old domain users
- **Safe to Run**: Includes verification and rollback-friendly design

### 4. Updated SeedData.cs
- **Location**: `backend/src/SeedData.cs`
- **Change**: Now uses `ExcelCourseSeedData.GetCoursesFromExcel()` method
- **Result**: Courses will be seeded from Excel data on application startup

## How to Use

### Option 1: Clean Database via SQL (Recommended for Production)

1. **Backup your database first!**

2. Connect to your database using SQL Server Management Studio or Azure Data Studio

3. Run the cleanup script:
   ```sql
   -- File: backend/scripts/CleanupDatabase.sql
   ```

4. Verify the results:
   - Orders: Should be 0
   - Courses: Should be 0
   - Old domain users: Should be 0

5. Restart your application to trigger automatic reseeding

### Option 2: Clean Database Programmatically (Development)

You can also create a simple C# program to run the cleanup:

```csharp
// In your Program.cs or a separate console app
using var scope = app.Services.CreateScope();
var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();

// Delete orders
context.Orders.RemoveRange(context.Orders);
await context.SaveChangesAsync();

// Delete courses
context.Courses.RemoveRange(context.Courses);
await context.SaveChangesAsync();

// Delete old domain users
var oldUsers = await context.Users
    .Where(u => u.Email.Contains("ersatraining.com"))
    .ToListAsync();
foreach (var user in oldUsers)
{
    await userManager.DeleteAsync(user);
}

// Reseed
await SeedData.SeedAsync(app.Services);
```

### Option 3: Full Automated Cleanup (Recommended for Development)

Run the provided PowerShell script:

```powershell
cd backend/scripts
./CleanupAndReseed.ps1
```

## Excel File Format

The system expects an Excel file named `Products Details.xlsx` in the root directory with the following structure:

- **Row 9**: Headers (English)
- **Row 10**: Headers (Arabic)
- **Row 11+**: Course data

### Expected Columns:
- `#`: Course number
- `Program name / اسم البرنامج`: Course title (En/Ar)
- `Training / التدريب`: Training type (Online/Offline)
- `Language / اللغة`: Course language
- `Final Price / السعر النهائي`: Price in SAR
- `Main Category`: Category name
- `Subcategory`: Subcategory name
- `Summary En`: English summary
- `Column10`: Arabic summary
- `Details`: English details
- `Column12`: Arabic details
- `Level`: Course level
- `Date – التاريــخ`: Duration
- `Column15`: Days/Schedule
- `Column16`: From date
- `Column17`: To date

## Course Categories

The system uses the following predefined categories:

1. **Professional Certificates** (شهادات مهنية)
   - ID: `11111111-1111-1111-1111-111111111111`

2. **Custom Programs** (برامج مخصصة)
   - ID: `22222222-2222-2222-2222-222222222222`

3. **General Courses** (دورات عامة)
   - ID: `33333333-3333-3333-3333-333333333333`

## Courses From Excel

The following 14 courses will be seeded:

1. Competency-Based Interviews - 1,200 SAR
2. Project Management – Preparatory Program - 1,300 SAR
3. Certified Business Professional – Leadership (CBP) - 1,840 SAR
4. Train-the-Trainer (TOT) - 4,000 SAR
5. Transforming Creative Ideas into Actionable Plans - 900 SAR
6. Strategic Human Resources Management - 2,650 SAR
7. Customer Service (CBP) - 1,840 SAR
8. Sales (CBP) - 1,840 SAR
9. Power BI - 1,700 SAR
10. HR Fundamentals - 1,500 SAR
11. Business English Certificate - 4,800 SAR
12. Saudi Labor Law: Systems & Regulations - 650 SAR
13. Associate Professional in Human Resources – International (aPHRi) - 3,200 SAR
14. Professional in Human Resources – International (PHRi) - 4,300 SAR

## Troubleshooting

### Issue: Courses not showing after reseed

**Solution**: 
1. Check if the application restarted properly
2. Verify database connection
3. Check application logs for errors
4. Manually run `SeedData.SeedAsync()`

### Issue: SQL script fails with FK constraint errors

**Solution**: 
The script disables FK constraints, but if it fails:
1. Check if tables exist
2. Run each section separately
3. Verify no active transactions are blocking

### Issue: Excel file not found

**Solution**: 
1. Ensure `Products Details.xlsx` is in the root directory
2. Check file name (case-sensitive on Linux)
3. Verify file is not corrupted

### Issue: Users with old domain not deleted

**Solution**: 
The system keeps users with `ersa-training.com` domain (new domain).
Only users with `ersatraining.com` (old domain without hyphen) are deleted.

## Important Notes

⚠️ **Always backup your database before running cleanup scripts!**

✅ Essential data is **NOT** deleted:
- Categories and subcategories
- Instructors
- Content pages
- Users with new domain (`ersa-training.com`)
- Admin roles

❌ Data that **WILL BE** deleted:
- All orders and payments
- All courses from previous seed
- Users with old domain (`ersatraining.com`)

## Verification

After running the cleanup and reseed, verify:

```sql
-- Check course count (should be 14)
SELECT COUNT(*) FROM Courses;

-- Check order count (should be 0)
SELECT COUNT(*) FROM Orders;

-- Check old domain users (should be 0)
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%';

-- Check new domain users (should exist)
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersa-training.com%';
```

## Next Steps

After successful cleanup and reseed:

1. Test the application
2. Verify courses are visible in the frontend
3. Check course details pages
4. Test course enrollment
5. Verify admin functions work correctly

## Support

If you encounter issues, check:
- Application logs in `backend/src/logs/`
- Database connection string in `appsettings.json`
- Entity Framework migrations are up to date

For more help, review:
- `RESEED_INSTRUCTIONS.md` in backend directory
- `BACKEND_CONNECTION_GUIDE.md` in frontend directory

