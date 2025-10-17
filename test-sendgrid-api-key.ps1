# Test SendGrid API Key Validity
# This script checks if your SendGrid API key is valid

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SendGrid API Key Validity Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Read configuration
$appsettingsDev = Get-Content "backend/src/appsettings.Development.json" | ConvertFrom-Json
$apiKey = $appsettingsDev.SendGrid.ApiKey

Write-Host "1. Checking API Key Format..." -ForegroundColor Yellow

if ($apiKey -like "SG.*") {
    Write-Host "   ✅ API Key format is correct (starts with SG.)" -ForegroundColor Green
    
    # Get key parts
    $keyParts = $apiKey.Split('.')
    if ($keyParts.Count -eq 3) {
        Write-Host "   ✅ API Key has 3 parts (correct structure)" -ForegroundColor Green
        $keyId = $keyParts[1]
        $keySecret = $keyParts[2]
        Write-Host "   Key ID: $($keyId.Substring(0, [Math]::Min(10, $keyId.Length)))..." -ForegroundColor Gray
        Write-Host "   Secret: $($keySecret.Substring(0, [Math]::Min(10, $keySecret.Length)))..." -ForegroundColor Gray
    } else {
        Write-Host "   ⚠️  WARNING: API Key structure seems incorrect" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ ERROR: API Key format is incorrect! Should start with 'SG.'" -ForegroundColor Red
}

Write-Host ""
Write-Host "2. Testing API Key with SendGrid..." -ForegroundColor Yellow

# Test the API key by making a request to SendGrid
$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type" = "application/json"
}

try {
    # Try to get API key info (this doesn't send any email)
    $response = Invoke-WebRequest -Uri "https://api.sendgrid.com/v3/scopes" `
        -Method GET `
        -Headers $headers `
        -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ API Key is VALID and working!" -ForegroundColor Green
        
        # Parse the scopes
        $scopes = ($response.Content | ConvertFrom-Json)
        Write-Host "   Permissions:" -ForegroundColor Gray
        
        # Check for important permissions
        $hasMailSend = $scopes -contains "mail.send"
        if ($hasMailSend) {
            Write-Host "     ✅ Mail Send: Enabled" -ForegroundColor Green
        } else {
            Write-Host "     ❌ Mail Send: DISABLED (Required for sending emails!)" -ForegroundColor Red
        }
        
        Write-Host "   Total permissions: $($scopes.Count)" -ForegroundColor Gray
    }
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    
    if ($statusCode -eq 401) {
        Write-Host "   ❌ API Key is INVALID or REVOKED!" -ForegroundColor Red
        Write-Host "   Status: Unauthorized (401)" -ForegroundColor Red
        Write-Host ""
        Write-Host "   This is the error you're experiencing!" -ForegroundColor Yellow
        Write-Host "   You need to create a new API key in SendGrid." -ForegroundColor Yellow
    } elseif ($statusCode -eq 403) {
        Write-Host "   ⚠️  API Key is valid but has insufficient permissions" -ForegroundColor Yellow
        Write-Host "   Status: Forbidden (403)" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Error testing API key" -ForegroundColor Red
        Write-Host "   Status: $statusCode" -ForegroundColor Red
        Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "3. Checking Sender Email Configuration..." -ForegroundColor Yellow
$fromEmail = $appsettingsDev.SendGrid.FromEmail
$fromName = $appsettingsDev.SendGrid.FromName
Write-Host "   From Email: $fromEmail" -ForegroundColor Gray
Write-Host "   From Name: $fromName" -ForegroundColor Gray
Write-Host ""
Write-Host "   ⚠️  Verify this email address is authenticated in SendGrid!" -ForegroundColor Yellow
Write-Host "   Go to: Settings → Sender Authentication" -ForegroundColor Gray

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Action Required:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

if ($apiKey -notlike "SG.*") {
    Write-Host "❌ CRITICAL: Invalid API Key format!" -ForegroundColor Red
    Write-Host ""
}

Write-Host "To fix the 'Unauthorized' error:" -ForegroundColor White
Write-Host ""
Write-Host "1. Create a new API Key in SendGrid:" -ForegroundColor Yellow
Write-Host "   → Login: https://app.sendgrid.com/" -ForegroundColor Gray
Write-Host "   → Go to: Settings → API Keys" -ForegroundColor Gray
Write-Host "   → Click: Create API Key" -ForegroundColor Gray
Write-Host "   → Name: Ersa Training Development" -ForegroundColor Gray
Write-Host "   → Permissions: Full Access (or Restricted with Mail Send)" -ForegroundColor Gray
Write-Host "   → Copy the new key (starts with SG.)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Update appsettings.Development.json line 14:" -ForegroundColor Yellow
Write-Host "   ""ApiKey"": ""SG.YOUR_NEW_KEY_HERE""" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Restart your backend:" -ForegroundColor Yellow
Write-Host "   → Stop current backend (Ctrl+C)" -ForegroundColor Gray
Write-Host "   → cd backend" -ForegroundColor Gray
Write-Host "   → dotnet run" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Test by making a purchase or registering a user" -ForegroundColor Yellow
Write-Host ""
Write-Host "5. Run this script again to verify:" -ForegroundColor Yellow
Write-Host "   .\test-sendgrid-api-key.ps1" -ForegroundColor Gray
Write-Host ""

