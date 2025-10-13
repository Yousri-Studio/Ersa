# Test Environment Configuration Script
# This script tests that the correct database connection is used in different environments

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Environment Configuration Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Function to extract connection string from logs
function Test-Environment {
    param (
        [string]$EnvName
    )
    
    Write-Host "Testing $EnvName Environment..." -ForegroundColor Yellow
    Write-Host "Setting ASPNETCORE_ENVIRONMENT=$EnvName" -ForegroundColor Gray
    
    $env:ASPNETCORE_ENVIRONMENT = $EnvName
    
    # Build the project quietly
    Write-Host "Building project..." -ForegroundColor Gray
    dotnet build --no-restore -v quiet > $null
    
    # Run and capture output
    Write-Host "Starting application (will auto-stop after 3 seconds)..." -ForegroundColor Gray
    
    $job = Start-Job -ScriptBlock {
        param($env)
        $env:ASPNETCORE_ENVIRONMENT = $env
        Set-Location "D:\Data\work\Ersa\backend\src"
        dotnet run --no-build 2>&1
    } -ArgumentList $EnvName
    
    Start-Sleep -Seconds 3
    Stop-Job $job
    $output = Receive-Job $job
    Remove-Job $job
    
    # Analyze output
    Write-Host ""
    Write-Host "Results:" -ForegroundColor Green
    Write-Host "--------" -ForegroundColor Green
    
    # Check for LocalDB
    if ($output -match "localdb") {
        Write-Host "✅ Using LocalDB" -ForegroundColor Green
        Write-Host "   Database: ErsaTrainingDB" -ForegroundColor Gray
        Write-Host "   Server: (localdb)\mssqllocaldb" -ForegroundColor Gray
    }
    # Check for SQL Server
    elseif ($output -match "SQL1002") {
        Write-Host "✅ Using SQL Server (Production)" -ForegroundColor Green
        Write-Host "   Database: db_abea46_ersatraining" -ForegroundColor Gray
        Write-Host "   Server: SQL1002.site4now.net" -ForegroundColor Gray
    }
    else {
        Write-Host "⚠️  Could not determine database connection" -ForegroundColor Yellow
    }
    
    # Check for database connection success
    if ($output -match "Database connected successfully") {
        Write-Host "✅ Database connection successful" -ForegroundColor Green
    }
    elseif ($output -match "Cannot connect to database") {
        Write-Host "❌ Database connection failed" -ForegroundColor Red
    }
    
    # Check which appsettings file is being used
    if ($output -match "appsettings.Development.json") {
        Write-Host "✅ Using appsettings.Development.json" -ForegroundColor Green
    }
    
    Write-Host ""
}

# Test Development Environment
Test-Environment -EnvName "Development"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Production Environment
Test-Environment -EnvName "Production"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  • Development should use LocalDB" -ForegroundColor Gray
Write-Host "  • Production should use SQL Server" -ForegroundColor Gray
Write-Host ""
Write-Host "To run manually:" -ForegroundColor Yellow
Write-Host '  $env:ASPNETCORE_ENVIRONMENT="Development"; dotnet run' -ForegroundColor Gray
Write-Host '  $env:ASPNETCORE_ENVIRONMENT="Production"; dotnet run' -ForegroundColor Gray
Write-Host ""

