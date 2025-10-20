# Fix 500 Error on Categories API - Quick Solution

## **Error:**
```
AxiosError: Request failed with status code 500
at categoriesApi.getCategories(true)
```

## **Root Cause:**

The `SubtitleAr` and `SubtitleEn` columns don't exist in the `CourseCategories` table in the database yet. The migration was created but not successfully applied due to an unrelated foreign key constraint error.

---

## **SOLUTION 1: Run Migration Manually (RECOMMENDED)**

### **Step 1: Check if migration exists**
```bash
cd backend/src
dotnet ef migrations list
```

Look for `AddSubtitleToCategory` migration in the list.

### **Step 2: If migration exists but not applied, try to apply it**
```bash
dotnet ef database update AddSubtitleToCategory
```

### **Step 3: If that fails, add the columns manually via SQL**

Run this SQL directly on your database:

```sql
-- Add SubtitleAr column
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CourseCategories') AND name = 'SubtitleAr')
BEGIN
    ALTER TABLE CourseCategories
    ADD SubtitleAr NVARCHAR(500) NULL;
END

-- Add SubtitleEn column  
IF NOT EXISTS (SELECT * FROM sys.columns WHERE object_id = OBJECT_ID('CourseCategories') AND name = 'SubtitleEn')
BEGIN
    ALTER TABLE CourseCategories
    ADD SubtitleEn NVARCHAR(500) NULL;
END

PRINT 'Subtitle columns added successfully';
```

### **Step 4: Restart the backend**
```bash
cd backend/src
dotnet run
```

The error should be resolved!

---

## **SOLUTION 2: Temporary Fix - Make Subtitles Non-Required (Quick Workaround)**

If you need a quick fix without database changes, temporarily modify the backend code:

**No changes needed** - The code is already correct! The subtitles are optional (`string?`), so they should work even if the columns don't exist.

The issue is that Entity Framework is trying to map the DTO properties to database columns that don't exist.

---

## **SOLUTION 3: Check Database Migration Status**

```bash
cd backend/src

# List all migrations
dotnet ef migrations list

# Check which migrations have been applied (look for 'applied' vs 'pending')
```

If `AddSubtitleToCategory` shows as **pending**, it means it hasn't been applied to the database.

---

## **Quick SQL Check**

To verify if the columns exist, run this SQL query:

```sql
SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'CourseCategories'
  AND COLUMN_NAME IN ('SubtitleAr', 'SubtitleEn');
```

**Expected Result:**
```
COLUMN_NAME   | DATA_TYPE | CHARACTER_MAXIMUM_LENGTH | IS_NULLABLE
------------- | --------- | ------------------------ | -----------
SubtitleAr    | nvarchar  | 500                      | YES
SubtitleEn    | nvarchar  | 500                      | YES
```

If you get 0 rows, the columns don't exist and need to be added.

---

## **Why This Happened**

When we ran `dotnet ef database update` earlier, it failed with this error:

```
The DELETE statement conflicted with the REFERENCE constraint 
"FK_EmailLogs_EmailTemplates_TemplateKey"
```

This error is **unrelated** to our subtitle changes - it's a pre-existing issue with the EmailTemplates table. However, it caused the migration to fail midway, and the subtitle columns may not have been added.

---

## **Complete Fix Process**

### **Option A: Manual SQL (Fastest)**

1. Open SQL Server Management Studio (or Azure Data Studio)
2. Connect to your database
3. Run the SQL script above to add columns
4. Restart backend
5. Test the frontend

### **Option B: Fix Migration Issues**

1. Fix the EmailTemplates foreign key issue first:
   ```sql
   -- Option 1: Delete orphaned EmailLogs
   DELETE FROM EmailLogs WHERE TemplateKey NOT IN (SELECT [Key] FROM EmailTemplates);
   
   -- Option 2: Set NULL temporarily
   ALTER TABLE EmailLogs
   ALTER COLUMN TemplateKey NVARCHAR(100) NULL;
   ```

2. Then run the migration:
   ```bash
   dotnet ef database update
   ```

### **Option C: Create New Migration (If AddSubtitleToCategory doesn't exist)**

```bash
cd backend/src
dotnet ef migrations add AddSubtitleToCategory
dotnet ef database update
```

---

## **Verify Fix**

After applying the fix:

1. **Check Database:**
   ```sql
   SELECT SubtitleAr, SubtitleEn FROM CourseCategories;
   ```

2. **Test API:**
   ```bash
   curl http://localhost:5000/api/CourseCategories?activeOnly=true
   ```

3. **Test Frontend:**
   - Refresh the browser
   - Navigate to the homepage
   - Categories should load without 500 error

---

## **Test Data (Optional)**

After the columns are added, you can populate them with test data:

```sql
UPDATE CourseCategories
SET SubtitleEn = 'Comprehensive training programs covering essential skills',
    SubtitleAr = 'برامج تدريبية شاملة تغطي المهارات الأساسية'
WHERE TitleEn = 'General Training';

UPDATE CourseCategories
SET SubtitleEn = 'Advanced training in specialized fields and industries',
    SubtitleAr = 'تدريب متقدم في المجالات والصناعات المتخصصة'
WHERE TitleEn = 'Specialized Training';

UPDATE CourseCategories
SET SubtitleEn = 'Enhance your professional skills and career growth',
    SubtitleAr = 'عزز مهاراتك المهنية ونموك الوظيفي'
WHERE TitleEn = 'Professional Development';
```

---

## **Prevention for Future**

To avoid this issue in the future:

1. **Always check migration status** after creating migrations
2. **Run migrations in a transaction** (EF Core does this by default)
3. **Fix foreign key issues** before running migrations
4. **Test migrations** on a development database first

---

## **Quick Command Reference**

```bash
# Check migrations
dotnet ef migrations list

# Apply specific migration
dotnet ef database update AddSubtitleToCategory

# Apply all pending migrations
dotnet ef database update

# Rollback to previous migration
dotnet ef database update PreviousMigrationName

# Generate SQL script instead of applying
dotnet ef migrations script

# Remove last migration (if not applied)
dotnet ef migrations remove
```

---

## **Expected Result After Fix**

The API response should look like this:

```json
[
  {
    "id": "guid-here",
    "titleEn": "General Training",
    "titleAr": "التدريب العام",
    "subtitleEn": "Comprehensive training programs covering essential skills",
    "subtitleAr": "برامج تدريبية شاملة تغطي المهارات الأساسية",
    "displayOrder": 1,
    "isActive": true,
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

---

**Fix applied? The 500 error should be resolved!** ✅

