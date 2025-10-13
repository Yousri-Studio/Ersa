# Test with CORRECT email address

$backendUrl = "http://api.ersa-training.com/api"
$email = "superadmin@ersa-training.com"  # WITH HYPHEN!
$password = "SuperAdmin123!"

Write-Host "Testing with CORRECT email address..." -ForegroundColor Cyan
Write-Host "Email: $email" -ForegroundColor Gray
Write-Host ""

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "$backendUrl/auth/admin-login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json"

    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "  SUCCESS! Login works!" -ForegroundColor Green
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "User Details:" -ForegroundColor White
    Write-Host "  Name: $($response.user.fullName)" -ForegroundColor Gray
    Write-Host "  Email: $($response.user.email)" -ForegroundColor Gray
    Write-Host "  IsAdmin: $($response.user.isAdmin)" -ForegroundColor Gray
    Write-Host "  IsSuperAdmin: $($response.user.isSuperAdmin)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Token (first 50 chars):" -ForegroundColor White
    Write-Host "  $($response.token.Substring(0, [Math]::Min(50, $response.token.Length)))..." -ForegroundColor Gray
    Write-Host ""
    Write-Host "=====================================" -ForegroundColor Green
    Write-Host "The correct email is:" -ForegroundColor Green
    Write-Host "  superadmin@ersa-training.com" -ForegroundColor Yellow
    Write-Host "  (note the hyphen in ersa-training)" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Green
} catch {
    Write-Host "FAILED! Login failed" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Read-Host "Press Enter to exit"

