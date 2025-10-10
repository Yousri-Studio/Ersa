# Run Database Cleanup NOW - Step by Step Guide

## Your Current Situation

✅ Code is fixed and ready  
❌ Database still has old data (hasn't been cleaned yet)  
🎯 **You need to RUN the cleanup script**

## Quick Steps (5 Minutes)

### Method 1: Azure Portal (Easiest - Recommended)

#### Step 1: Login to Azure Portal
1. Go to: https://portal.azure.com
2. Login with your credentials

#### Step 2: Find Your Database
1. Search for "**db_abea46_ersatraining**" in the search bar at top
2. Click on your SQL database

#### Step 3: Open Query Editor
1. In the left menu, click "**Query editor (preview)**"
2. Login with your database credentials:
   - **Login**: Your SQL admin username
   - **Password**: Your SQL admin password

#### Step 4: Run the Cleanup Script
1. Open this file in your local editor:
   ```
   D:\Data\work\Ersa\backend\scripts\RunCleanupNow.sql
   ```

2. **Copy ALL the content** from the file

3. **Paste it** into the Azure Query Editor

4. Click "**Run**" button at the top

5. **Wait** for execution (should take 10-30 seconds)

6. Check the **Messages** tab for results - you should see:
   ```
   ✓✓✓ SUCCESS! ✓✓✓
   All cleanup completed successfully!
   Orders remaining:           0
   Courses remaining:          0
   Old domain users remaining: 0
   New domain users (kept):    3
   ```

#### Step 5: Restart Your Application

After successful cleanup, restart your backend:

```powershell
cd D:\Data\work\Ersa\backend\src
dotnet run
```

The application will automatically seed 14 new courses from Excel!

---

### Method 2: SQL Server Management Studio (SSMS)

If you have SSMS installed:

1. **Open SSMS**
2. **Connect** to: `your-server.database.windows.net`
   - Server name: (from your Azure portal)
   - Authentication: SQL Server Authentication
   - Login: Your admin username
   - Password: Your admin password
3. **Open** the file: `backend/scripts/RunCleanupNow.sql`
4. Click "**Execute**" (F5)
5. Check **Messages** pane for success confirmation

---

### Method 3: Azure Data Studio

1. **Open Azure Data Studio**
2. **New Connection**:
   - Server: `your-server.database.windows.net`
   - Authentication: SQL Login
   - User: Your admin username
   - Password: Your admin password
   - Database: `db_abea46_ersatraining`
3. **New Query**
4. **Paste** content from `RunCleanupNow.sql`
5. **Run** (F5)

---

## What the Script Does

### ✓ Deletes:
- ❌ ALL Orders (and payments, bills, order items, enrollments)
- ❌ ALL Courses (and sessions, attachments, mappings)
- ❌ ALL Users with domain `ersatraining.com` (old domain)
- ❌ ALL Carts and Wishlist items

### ✓ Keeps:
- ✅ Categories (3 main categories)
- ✅ Subcategories (8 subcategories)
- ✅ Instructors (6 instructors)
- ✅ Content Pages
- ✅ Users with domain `ersa-training.com` (new domain with hyphen)
- ✅ All Roles

---

## Expected Results

After running the script, you should see:

```
========================================
✓✓✓ SUCCESS! ✓✓✓
========================================
All cleanup completed successfully!

VERIFICATION RESULTS:
========================================
Orders remaining:           0
Courses remaining:          0
Old domain users remaining: 0
New domain users (kept):    3

NEXT STEP:
Restart your application to seed 14 new courses from Excel.
========================================
```

---

## After Cleanup - Verify in Your Application

Once you restart the app, you should see:

### In the Logs:
```
[INFO] Starting deletion of users with old domain...
[INFO] No users with old domain found. Skipping deletion.
[INFO] Courses already exist, skipping seed  OR
[INFO] Added 14 courses from Excel data
```

### In the Database:
```sql
-- Run these queries to verify:

-- Should return 14 (new courses from Excel)
SELECT COUNT(*) FROM Courses;

-- Should return 0 (no old orders)
SELECT COUNT(*) FROM Orders;

-- Should return 0 (no old domain users)
SELECT COUNT(*) FROM AspNetUsers WHERE Email LIKE '%ersatraining.com%';

-- Should return your admin users (kept)
SELECT Email FROM AspNetUsers WHERE Email LIKE '%ersa-training.com%';

-- List new courses
SELECT TitleEn, Price, Currency FROM Courses ORDER BY Price;
```

---

## Troubleshooting

### Issue: "Login failed"
**Solution**: Check your Azure SQL credentials in the connection string from `appsettings.json`

### Issue: "Permission denied"
**Solution**: Make sure you're using an admin account that has permissions to delete data

### Issue: "Script timeout"
**Solution**: The script is already optimized. If it times out, run it section by section (Step 1, then Step 2, etc.)

### Issue: "Still seeing old data after restart"
**Solution**: 
1. Make sure the SQL script completed successfully (check for "✓✓✓ SUCCESS")
2. Clear browser cache
3. Hard refresh (Ctrl+Shift+R)

---

## Important Notes

⚠️ **This will permanently delete all orders and courses!**  
✅ **But it keeps your admin users and structure**  
🎯 **New courses will be automatically seeded from Excel on restart**

---

## Need Help?

If you encounter issues:

1. Check the **Messages** tab in Query Editor for specific errors
2. Take a screenshot of the error
3. Check connection string in `backend/src/appsettings.json`
4. Verify you have the right permissions

---

## Summary

```
Current State:  ❌ Old data still in database
Action Needed:  ▶️ Run RunCleanupNow.sql in Azure Portal
Expected Time:  ⏱️ 5-10 minutes
Final State:    ✅ Clean database + 14 new courses from Excel
```

**Ready? Open Azure Portal and let's clean that database!** 🚀

