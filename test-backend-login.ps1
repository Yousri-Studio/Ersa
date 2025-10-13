# Quick test to see the actual backend error message

$backendUrl = "http://api.ersa-training.com/api"
$email = "superadmin@ersatraining.com"
$password = "SuperAdmin123!"

Write-Host "Testing backend login..." -ForegroundColor Yellow
Write-Host "URL: $backendUrl/auth/admin-login" -ForegroundColor Gray
Write-Host ""

$loginBody = @{
    email = $email
    password = $password
} | ConvertTo-Json

Write-Host "Request body:" -ForegroundColor Gray
Write-Host $loginBody -ForegroundColor DarkGray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$backendUrl/auth/admin-login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -UseBasicParsing

    Write-Host "SUCCESS!" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 5
} catch {
    Write-Host "FAILED!" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    
    # Try to get the response body with error details
    $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
    $responseBody = $reader.ReadToEnd()
    $reader.Close()
    
    Write-Host "Response body:" -ForegroundColor Yellow
    Write-Host $responseBody -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"

