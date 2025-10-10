# Database Cleanup and Reseed - Quick Start Guide

This guide provides quick instructions for cleaning your database and reseeding it with course data from the Excel file.

## ✅ What Has Been Created

1. **Excel Course Reader** - Reads `Products Details.xlsx` and converts to JSON
2. **Course Seed Data** - C# class with 14 courses from Excel
3. **SQL Cleanup Script** - Deletes orders, courses, and old domain users
4. **PowerShell Automation** - One-click cleanup and reseed
5. **Updated SeedData.cs** - Now uses Excel course data

## 🚀 Quick Start (3 Steps)

### Option 1: Automated (Recommended for Development)

```powershell
# Navigate to scripts directory
cd backend/scripts

# Run the automated script
./CleanupAndReseed.ps1
```

The script will:
- ✓ Check for Excel file
- ✓ Read and convert Excel data
- ✓ Guide you through database cleanup
- ✓ Show summary of 14 courses to be seeded

### Option 2: Manual (Recommended for Production)

#### Step 1: Backup Database
```sql
-- Always backup first!
BACKUP DATABASE [YourDatabase] TO DISK = 'backup.bak'
```

#### Step 2: Run Cleanup Script
```sql
-- Run: backend/scripts/CleanupDatabase.sql
-- This will delete:
-- - All orders and payments
-- - All courses
-- - Users with ersatraining.com domain
```

#### Step 3: Restart Application
```bash
# The application will automatically reseed courses from Excel
dotnet run
```

### Option 3: SQLite Quick Reset

```powershell
# Stop your application

# Delete the database
Remove-Item backend/src/ErsaTrainingDB.db

# Restart application - it will recreate with new data
dotnet run
```

## 📊 What Will Be Seeded

14 courses from `Products Details.xlsx`:

| # | Course Name | Price (SAR) | Category |
|---|------------|-------------|----------|
| 1 | Competency-Based Interviews | 1,200 | Custom Programs |
| 2 | Project Management Prep | 1,300 | Custom Programs |
| 3 | CBP Leadership | 1,840 | Professional Certs |
| 4 | Train-the-Trainer (TOT) | 4,000 | Professional Certs |
| 5 | Creative Ideas to Plans | 900 | General Courses |
| 6 | Strategic HR Management | 2,650 | Custom Programs |
| 7 | CBP Customer Service | 1,840 | Professional Certs |
| 8 | CBP Sales | 1,840 | Professional Certs |
| 9 | Power BI | 1,700 | Custom Programs |
| 10 | HR Fundamentals | 1,500 | Custom Programs |
| 11 | Business English | 4,800 | General Courses |
| 12 | Saudi Labor Law | 650 | Custom Programs |
| 13 | aPHRi Certification | 3,200 | Professional Certs |
| 14 | PHRi Certification | 4,300 | Professional Certs |

## ⚠️ Important Notes

### What Gets DELETED:
- ❌ All orders, payments, bills, enrollments
- ❌ All courses (to be replaced with Excel data)
- ❌ Users with `ersatraining.com` domain (old domain)

### What Is PRESERVED:
- ✅ Categories and subcategories
- ✅ Instructors
- ✅ Content pages
- ✅ Users with `ersa-training.com` domain (new domain)
- ✅ Roles and permissions

## 🔍 Verification

After reseeding, verify with these SQL queries:

```sql
-- Should return 14
SELECT COUNT(*) FROM Courses;

-- Should return 0
SELECT COUNT(*) FROM Orders;

-- Should return 0  
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%';

-- Should return your admin users
SELECT Email FROM AspNetUsers WHERE Email LIKE '%ersa-training.com%';

-- List all courses
SELECT Id, TitleEn, TitleAr, Price FROM Courses ORDER BY Price;
```

## 📁 File Locations

| File | Location | Purpose |
|------|----------|---------|
| Excel File | `Products Details.xlsx` | Source data |
| Course Seed | `backend/src/Data/Seeds/ExcelCourseSeedData.cs` | Generated C# code |
| SQL Cleanup | `backend/scripts/CleanupDatabase.sql` | Database cleanup |
| PS Script | `backend/scripts/CleanupAndReseed.ps1` | Automation |
| Documentation | `backend/scripts/DatabaseCleanupAndReseed.md` | Full guide |

## 🐛 Troubleshooting

### Problem: "Excel file not found"
**Solution**: Ensure `Products Details.xlsx` is in the root directory (same level as `backend/` and `frontend/` folders)

### Problem: "Courses not showing after restart"
**Solution**: 
1. Check application logs in `backend/src/logs/`
2. Verify database connection in `appsettings.json`
3. Ensure EF migrations are up to date: `dotnet ef database update`

### Problem: "SQL script fails with FK errors"
**Solution**: The script disables FK constraints, but if it still fails, run sections individually

### Problem: "Old domain users still exist"
**Solution**: The script only deletes `ersatraining.com` users, not `ersa-training.com` users (those are kept)

## 📚 More Information

For detailed information, see:
- `backend/scripts/DatabaseCleanupAndReseed.md` - Complete documentation
- `backend/RESEED_INSTRUCTIONS.md` - General reseed instructions
- `ROLE_SYSTEM_GUIDE.md` - Role and permission system

## ✨ What's Different From Before

### Old Seed Data (12 Courses):
- Hardcoded test courses
- Generic descriptions
- Example prices
- Random dates

### New Seed Data (14 Courses):
- Real courses from Excel
- Actual descriptions in English & Arabic
- Real prices matching your offerings
- Scheduled dates from Excel

## 🎯 Next Steps

After successful cleanup and reseed:

1. ✅ Test the application
2. ✅ Browse courses in frontend
3. ✅ Check course details pages
4. ✅ Verify prices and descriptions
5. ✅ Test course enrollment
6. ✅ Check admin dashboard

## 💡 Tips

- **Always backup before cleanup!**
- Run in development environment first
- Test thoroughly before production deployment
- Keep Excel file updated with latest course data
- Document any custom changes

---

**Created**: 2025-10-10  
**Last Updated**: 2025-10-10  
**Version**: 1.0

