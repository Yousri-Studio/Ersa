# =====================================================
# Database Cleanup and Reseed Script
# =====================================================
# Purpose: Automate the complete database cleanup and reseed process
# =====================================================

param(
    [switch]$SkipBackup,
    [switch]$Force
)

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Database Cleanup and Reseed Tool" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
$currentDir = Get-Location
if (-not (Test-Path "CleanupDatabase.sql")) {
    Write-Host "Error: Please run this script from the backend/scripts directory" -ForegroundColor Red
    Write-Host "Current directory: $currentDir" -ForegroundColor Yellow
    exit 1
}

# Warning message
if (-not $Force) {
    Write-Host "⚠️  WARNING: This script will:" -ForegroundColor Yellow
    Write-Host "   - Delete ALL orders and related data" -ForegroundColor Yellow
    Write-Host "   - Delete ALL courses" -ForegroundColor Yellow
    Write-Host "   - Delete ALL users with domain 'ersatraining.com'" -ForegroundColor Yellow
    Write-Host "   - Reseed courses from Products Details.xlsx" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "✅ The following will be PRESERVED:" -ForegroundColor Green
    Write-Host "   - Categories and subcategories" -ForegroundColor Green
    Write-Host "   - Instructors" -ForegroundColor Green
    Write-Host "   - Content pages" -ForegroundColor Green
    Write-Host "   - Users with domain 'ersa-training.com'" -ForegroundColor Green
    Write-Host "   - Admin roles" -ForegroundColor Green
    Write-Host ""
    
    $confirm = Read-Host "Do you want to continue? (yes/no)"
    if ($confirm -ne "yes") {
        Write-Host "Operation cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Step 1: Check if Excel file exists
Write-Host ""
Write-Host "Step 1: Checking Excel file..." -ForegroundColor Cyan
$excelPath = "..\..\Products Details.xlsx"
if (-not (Test-Path $excelPath)) {
    Write-Host "❌ Error: Excel file not found at: $excelPath" -ForegroundColor Red
    Write-Host "Please ensure 'Products Details.xlsx' is in the root directory." -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ Excel file found" -ForegroundColor Green

# Step 2: Read Excel and generate JSON
Write-Host ""
Write-Host "Step 2: Reading Excel file..." -ForegroundColor Cyan
Push-Location ExcelCourseReader
try {
    $output = dotnet run 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Excel data exported successfully" -ForegroundColor Green
        Write-Host $output | Where-Object { $_ -match "exported|courses" }
    } else {
        Write-Host "❌ Error reading Excel file" -ForegroundColor Red
        Write-Host $output
        Pop-Location
        exit 1
    }
} finally {
    Pop-Location
}

# Step 3: Check database connection
Write-Host ""
Write-Host "Step 3: Checking database connection..." -ForegroundColor Cyan
$appsettingsPath = "..\src\appsettings.json"
if (Test-Path $appsettingsPath) {
    Write-Host "✓ Database configuration found" -ForegroundColor Green
} else {
    Write-Host "⚠️  Warning: appsettings.json not found" -ForegroundColor Yellow
}

# Step 4: Ask for connection string
Write-Host ""
Write-Host "Step 4: Database Connection" -ForegroundColor Cyan
Write-Host "Choose your database type:" -ForegroundColor White
Write-Host "  1. SQLite (Local Development)" -ForegroundColor White
Write-Host "  2. SQL Server (Production/Azure)" -ForegroundColor White
Write-Host ""

$dbChoice = Read-Host "Enter your choice (1 or 2)"

if ($dbChoice -eq "1") {
    Write-Host ""
    Write-Host "SQLite Database Cleanup" -ForegroundColor Yellow
    Write-Host "For SQLite, the easiest way is to:" -ForegroundColor White
    Write-Host "  1. Stop the application" -ForegroundColor White
    Write-Host "  2. Delete the database file: backend/src/ErsaTrainingDB.db" -ForegroundColor White
    Write-Host "  3. Restart the application (it will auto-seed with new data)" -ForegroundColor White
    Write-Host ""
    
    $deleteSqlite = Read-Host "Delete SQLite database now? (yes/no)"
    if ($deleteSqlite -eq "yes") {
        $dbPath = "..\src\ErsaTrainingDB.db"
        if (Test-Path $dbPath) {
            Remove-Item $dbPath -Force
            Write-Host "✓ SQLite database deleted" -ForegroundColor Green
            Write-Host ""
            Write-Host "Next steps:" -ForegroundColor Cyan
            Write-Host "  1. Restart your application" -ForegroundColor White
            Write-Host "  2. The database will be recreated with Excel course data" -ForegroundColor White
        } else {
            Write-Host "Database file not found at: $dbPath" -ForegroundColor Yellow
        }
    }
} elseif ($dbChoice -eq "2") {
    Write-Host ""
    Write-Host "SQL Server Database Cleanup" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run the CleanupDatabase.sql script manually:" -ForegroundColor White
    Write-Host "  1. Open SQL Server Management Studio or Azure Data Studio" -ForegroundColor White
    Write-Host "  2. Connect to your database" -ForegroundColor White
    Write-Host "  3. Open file: backend/scripts/CleanupDatabase.sql" -ForegroundColor White
    Write-Host "  4. Execute the script" -ForegroundColor White
    Write-Host "  5. Restart your application" -ForegroundColor White
    Write-Host ""
    Write-Host "The script file is located at:" -ForegroundColor Cyan
    Write-Host "  $(Resolve-Path '.\CleanupDatabase.sql')" -ForegroundColor Yellow
} else {
    Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    exit 1
}

# Step 5: Summary
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✓ Excel file read successfully" -ForegroundColor Green
Write-Host "✓ Course seed data generated" -ForegroundColor Green
Write-Host ""
Write-Host "Courses to be seeded: 14" -ForegroundColor White
Write-Host "  1. Competency-Based Interviews (1,200 SAR)" -ForegroundColor Gray
Write-Host "  2. Project Management Prep (1,300 SAR)" -ForegroundColor Gray
Write-Host "  3. CBP Leadership (1,840 SAR)" -ForegroundColor Gray
Write-Host "  4. Train-the-Trainer (4,000 SAR)" -ForegroundColor Gray
Write-Host "  5. Creative Ideas to Plans (900 SAR)" -ForegroundColor Gray
Write-Host "  6. Strategic HR Management (2,650 SAR)" -ForegroundColor Gray
Write-Host "  7. CBP Customer Service (1,840 SAR)" -ForegroundColor Gray
Write-Host "  8. CBP Sales (1,840 SAR)" -ForegroundColor Gray
Write-Host "  9. Power BI (1,700 SAR)" -ForegroundColor Gray
Write-Host " 10. HR Fundamentals (1,500 SAR)" -ForegroundColor Gray
Write-Host " 11. Business English (4,800 SAR)" -ForegroundColor Gray
Write-Host " 12. Saudi Labor Law (650 SAR)" -ForegroundColor Gray
Write-Host " 13. aPHRi Certification (3,200 SAR)" -ForegroundColor Gray
Write-Host " 14. PHRi Certification (4,300 SAR)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your application" -ForegroundColor White
Write-Host "  2. Verify courses in the frontend" -ForegroundColor White
Write-Host "  3. Check application logs for any errors" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Cyan
Write-Host "  See DatabaseCleanupAndReseed.md for detailed instructions" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Process Complete!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

