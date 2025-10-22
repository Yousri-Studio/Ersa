# PowerShell script to fix Course Photo column size
# This script executes the SQL command to change the Photo column from varbinary(1000) to varbinary(max)

Write-Host "Fixing Course Photo column size..." -ForegroundColor Green

# SQL command to fix the Photo column
$sqlCommand = @"
USE [db_abea46_ersatraining];
GO

-- Alter the Photo column to support larger binary data
ALTER TABLE [dbo].[Courses] 
ALTER COLUMN [Photo] varbinary(max);
GO

-- Verify the change
SELECT 
    COLUMN_NAME,
    DATA_TYPE,
    CHARACTER_MAXIMUM_LENGTH,
    IS_NULLABLE
FROM INFORMATION_SCHEMA.COLUMNS 
WHERE TABLE_NAME = 'Courses' AND COLUMN_NAME = 'Photo';
GO
"@

try {
    # Execute the SQL command using sqlcmd
    $sqlCommand | sqlcmd -S "SQL1002.site4now.net" -d "db_abea46_ersatraining" -U "powerDb" -P "P@`$sw0rd" -I
    
    Write-Host "Course Photo column size fixed successfully!" -ForegroundColor Green
    Write-Host "The Photo column can now store images up to 2GB in size." -ForegroundColor Yellow
}
catch {
    Write-Host "Error executing SQL command: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please run the SQL script manually in SQL Server Management Studio or Azure Data Studio." -ForegroundColor Yellow
    Write-Host "SQL Script location: fix-photo-column.sql" -ForegroundColor Yellow
}
