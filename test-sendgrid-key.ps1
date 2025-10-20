# Test SendGrid API Key
# This script tests if your SendGrid API key is valid

param(
    [Parameter(Mandatory=$false)]
    [string]$ApiKey = ""
)

Write-Host "=== SendGrid API Key Test ===" -ForegroundColor Cyan
Write-Host ""

# If no API key provided, prompt for it
if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "Enter your SendGrid API key (starts with SG.):" -ForegroundColor Yellow
    $ApiKey = Read-Host
}

if ([string]::IsNullOrEmpty($ApiKey)) {
    Write-Host "Error: No API key provided!" -ForegroundColor Red
    exit 1
}

# Mask API key for display
$maskedKey = $ApiKey.Substring(0, [Math]::Min(10, $ApiKey.Length)) + "..." + $ApiKey.Substring([Math]::Max(0, $ApiKey.Length - 5))
Write-Host "Testing API Key: $maskedKey" -ForegroundColor Gray
Write-Host ""

# Test 1: Check API key format
Write-Host "Test 1: Checking API key format..." -ForegroundColor Cyan
if ($ApiKey -match "^SG\.") {
    Write-Host "  ✅ API key format is correct (starts with SG.)" -ForegroundColor Green
} else {
    Write-Host "  ❌ API key format is incorrect (should start with SG.)" -ForegroundColor Red
    Write-Host "  Example: SG.abc123XYZ456..." -ForegroundColor Gray
    exit 1
}

# Test 2: Verify API key with SendGrid
Write-Host ""
Write-Host "Test 2: Verifying API key with SendGrid..." -ForegroundColor Cyan

$headers = @{
    "Authorization" = "Bearer $ApiKey"
    "Content-Type" = "application/json"
}

try {
    # Try to get API key info (this endpoint validates the key)
    $response = Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/user/profile" -Method GET -Headers $headers
    
    Write-Host "  ✅ API key is VALID!" -ForegroundColor Green
    Write-Host "  Account Email: $($response.email)" -ForegroundColor Gray
    Write-Host "  Account Username: $($response.username)" -ForegroundColor Gray
    
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = ""
    
    try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $errorBody = $reader.ReadToEnd()
    } catch {
        $errorBody = $_.Exception.Message
    }
    
    Write-Host "  ❌ API key is INVALID!" -ForegroundColor Red
    Write-Host "  Status Code: $statusCode" -ForegroundColor Red
    Write-Host "  Error: $errorBody" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possible reasons:" -ForegroundColor Yellow
    Write-Host "  1. API key is expired or revoked" -ForegroundColor Gray
    Write-Host "  2. API key was copied incorrectly" -ForegroundColor Gray
    Write-Host "  3. API key doesn't exist in SendGrid" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solution:" -ForegroundColor Yellow
    Write-Host "  1. Go to https://app.sendgrid.com/settings/api_keys" -ForegroundColor Gray
    Write-Host "  2. Create a new API key" -ForegroundColor Gray
    Write-Host "  3. Copy it immediately (you can only see it once!)" -ForegroundColor Gray
    Write-Host "  4. Run this test again with the new key" -ForegroundColor Gray
    
    exit 1
}

# Test 3: Check sender verification (optional but important)
Write-Host ""
Write-Host "Test 3: Checking sender authentication..." -ForegroundColor Cyan

try {
    $senders = Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/verified_senders" -Method GET -Headers $headers
    
    $verifiedSenders = $senders.results | Where-Object { $_.verified -eq $true }
    
    if ($verifiedSenders.Count -gt 0) {
        Write-Host "  ✅ You have verified senders:" -ForegroundColor Green
        foreach ($sender in $verifiedSenders) {
            Write-Host "     - $($sender.from_email)" -ForegroundColor Gray
        }
        
        # Check if noreply@ersa-training.com is verified
        $ersaSender = $verifiedSenders | Where-Object { $_.from_email -eq "noreply@ersa-training.com" }
        if ($ersaSender) {
            Write-Host ""
            Write-Host "  ✅ 'noreply@ersa-training.com' is verified!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "  ⚠️  'noreply@ersa-training.com' is NOT verified!" -ForegroundColor Yellow
            Write-Host "     You need to verify this sender to send emails from your app." -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  No verified senders found!" -ForegroundColor Yellow
        Write-Host "     You need to verify 'noreply@ersa-training.com' to send emails." -ForegroundColor Gray
    }
    
} catch {
    Write-Host "  ⚠️  Could not check sender verification (API key may have restricted permissions)" -ForegroundColor Yellow
}

# Test 4: Check API key permissions
Write-Host ""
Write-Host "Test 4: Checking API key permissions..." -ForegroundColor Cyan

try {
    $apiKeys = Invoke-RestMethod -Uri "https://api.sendgrid.com/v3/api_keys" -Method GET -Headers $headers
    Write-Host "  ✅ API key has permission to view API keys" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  API key has restricted permissions (this is OK for production)" -ForegroundColor Yellow
}

# Summary
Write-Host ""
Write-Host "=== Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Your SendGrid API key is VALID and working!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Update your production appsettings.json with this API key" -ForegroundColor Gray
Write-Host "  2. Verify 'noreply@ersa-training.com' in SendGrid (if not already done)" -ForegroundColor Gray
Write-Host "  3. Restart your backend application" -ForegroundColor Gray
Write-Host "  4. Test email sending by registering a new user" -ForegroundColor Gray
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - See: SENDGRID_SITE4NOW_PRODUCTION_FIX.md" -ForegroundColor Gray
Write-Host "  - See: SENDGRID_UNAUTHORIZED_FIX.md" -ForegroundColor Gray
Write-Host ""

