# Test SendGrid Webhook Configuration
# This script tests if your SendGrid webhook is properly configured

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "SendGrid Webhook Configuration Test" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check appsettings.json
$appsettings = Get-Content "backend/src/appsettings.json" | ConvertFrom-Json
$webhookKey = $appsettings.SendGrid.WebhookKey

Write-Host "1. Checking appsettings.json..." -ForegroundColor Yellow
if ($webhookKey -eq "your-sendgrid-webhook-verification-key") {
    Write-Host "   ❌ ERROR: Webhook key is still the default placeholder!" -ForegroundColor Red
    Write-Host "   Please update it with your actual SendGrid webhook key." -ForegroundColor Red
} elseif ($webhookKey.Length -lt 50) {
    Write-Host "   ⚠️  WARNING: Webhook key seems too short. It should be a long base64 string." -ForegroundColor Yellow
} else {
    Write-Host "   ✅ Webhook key is configured!" -ForegroundColor Green
    Write-Host "   Key length: $($webhookKey.Length) characters" -ForegroundColor Gray
}

Write-Host ""
Write-Host "2. Checking API Key..." -ForegroundColor Yellow
$apiKey = $appsettings.SendGrid.ApiKey
if ($apiKey.StartsWith("SG.")) {
    Write-Host "   ✅ SendGrid API Key is configured!" -ForegroundColor Green
} else {
    Write-Host "   ❌ ERROR: Invalid SendGrid API Key format!" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Checking Email Configuration..." -ForegroundColor Yellow
Write-Host "   From Email: $($appsettings.SendGrid.FromEmail)" -ForegroundColor Gray
Write-Host "   From Name: $($appsettings.SendGrid.FromName)" -ForegroundColor Gray

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "1. If webhook key is not set, follow these steps:" -ForegroundColor White
Write-Host "   - Login to SendGrid: https://app.sendgrid.com/" -ForegroundColor Gray
Write-Host "   - Go to: Settings → Mail Settings → Event Webhook" -ForegroundColor Gray
Write-Host "   - Enable 'Signed Event Webhook'" -ForegroundColor Gray
Write-Host "   - Copy the Verification Key" -ForegroundColor Gray
Write-Host "   - Update line 17 in backend/src/appsettings.json" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Set your webhook URL in SendGrid:" -ForegroundColor White
Write-Host "   https://ersa-training.com/api/webhook/sendgrid" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Test the webhook integration" -ForegroundColor White
Write-Host ""

