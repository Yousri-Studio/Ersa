# =====================================================
# PowerShell Script to Clear and Reseed Course Data
# =====================================================

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Course Data Reseed Script" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "https://api.ersa-training.com"
$localUrl = "http://localhost:5041"
$endpoint = "/api/admin/reseed-course-data"

# Prompt for API URL
Write-Host "Select API URL:" -ForegroundColor Yellow
Write-Host "1. Local (http://localhost:5041)" -ForegroundColor White
Write-Host "2. Production (https://api.ersa-training.com)" -ForegroundColor White
$choice = Read-Host "Enter choice (1 or 2)"

$apiUrl = if ($choice -eq "2") { $baseUrl } else { $localUrl }
Write-Host "Using: $apiUrl" -ForegroundColor Green
Write-Host ""

# Prompt for SuperAdmin credentials
Write-Host "Enter SuperAdmin credentials:" -ForegroundColor Yellow
$email = Read-Host "Email"
$password = Read-Host "Password" -AsSecureString
$passwordText = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto([System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow

# Login to get token
$loginBody = @{
    email = $email
    password = $passwordText
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$apiUrl/api/auth/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"
    
    $token = $loginResponse.token
    Write-Host "✓ Authentication successful!" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "✗ Authentication failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "Step 2: Clearing existing course data..." -ForegroundColor Yellow

# Call reseed endpoint
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $reseedResponse = Invoke-RestMethod -Uri "$apiUrl$endpoint" `
        -Method POST `
        -Headers $headers
    
    Write-Host "✓ Course data cleared successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Deleted Data:" -ForegroundColor Cyan
    Write-Host "  - Mappings: $($reseedResponse.deletedData.mappings)" -ForegroundColor White
    Write-Host "  - Courses: $($reseedResponse.deletedData.courses)" -ForegroundColor White
    Write-Host "  - SubCategories: $($reseedResponse.deletedData.subCategories)" -ForegroundColor White
    Write-Host "  - Categories: $($reseedResponse.deletedData.categories)" -ForegroundColor White
    Write-Host ""
    Write-Host "Message: $($reseedResponse.message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    foreach ($step in $reseedResponse.nextSteps) {
        Write-Host "  • $step" -ForegroundColor White
    }
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host "✓ STEP 1 COMPLETE!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANT: Restart the application now to trigger SeedData!" -ForegroundColor Yellow
}
catch {
    Write-Host "✗ Failed to clear course data!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.ErrorDetails.Message)" -ForegroundColor Red
    exit 1
}

