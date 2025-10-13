# Test Admin API - Comprehensive Debugging Script
# This script tests the admin API directly and through the proxy

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  ADMIN API DIAGNOSTIC TEST" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$backendUrl = "http://api.ersa-training.com/api"
$frontendUrl = "https://ersa-training.com"
$email = "superadmin@ersatraining.com"
$password = "SuperAdmin123!"

# Test 1: Direct Backend Login
Write-Host "Test 1: Testing Direct Backend Login..." -ForegroundColor Yellow
Write-Host "URL: $backendUrl/auth/admin-login" -ForegroundColor Gray

try {
    $loginBody = @{
        email = $email
        password = $password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$backendUrl/auth/admin-login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -ErrorAction Stop

    $token = $loginResponse.token
    Write-Host "SUCCESS: Login successful!" -ForegroundColor Green
    Write-Host "  Token (first 50 chars): $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
    Write-Host "  User: $($loginResponse.user.fullName)" -ForegroundColor Gray
    Write-Host "  IsAdmin: $($loginResponse.user.isAdmin)" -ForegroundColor Gray
    Write-Host "  IsSuperAdmin: $($loginResponse.user.isSuperAdmin)" -ForegroundColor Gray
    Write-Host ""

    # Test 2: Direct Backend Dashboard Stats
    Write-Host "Test 2: Testing Direct Backend Dashboard Stats..." -ForegroundColor Yellow
    Write-Host "URL: $backendUrl/admin/dashboard-stats" -ForegroundColor Gray

    try {
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }

        $dashboardResponse = Invoke-RestMethod -Uri "$backendUrl/admin/dashboard-stats" `
            -Method GET `
            -Headers $headers `
            -ErrorAction Stop

        Write-Host "SUCCESS: Dashboard stats retrieved successfully!" -ForegroundColor Green
        Write-Host "  Total Users: $($dashboardResponse.totalUsers)" -ForegroundColor Gray
        Write-Host "  Total Courses: $($dashboardResponse.totalCourses)" -ForegroundColor Gray
        Write-Host "  Total Orders: $($dashboardResponse.totalOrders)" -ForegroundColor Gray
        Write-Host "  Total Revenue: $($dashboardResponse.totalRevenue)" -ForegroundColor Gray
        Write-Host ""

        # Test 3: Via Frontend Proxy
        Write-Host "Test 3: Testing Via Frontend Proxy..." -ForegroundColor Yellow
        Write-Host "URL: $frontendUrl/api/proxy?endpoint=/admin/dashboard-stats" -ForegroundColor Gray

        try {
            $proxyResponse = Invoke-RestMethod -Uri "$frontendUrl/api/proxy?endpoint=/admin/dashboard-stats" `
                -Method GET `
                -Headers $headers `
                -ErrorAction Stop

            Write-Host "SUCCESS: Proxy request successful!" -ForegroundColor Green
            Write-Host "  Total Users: $($proxyResponse.totalUsers)" -ForegroundColor Gray
            Write-Host ""

            Write-Host "======================================" -ForegroundColor Green
            Write-Host "  ALL TESTS PASSED!" -ForegroundColor Green
            Write-Host "======================================" -ForegroundColor Green
            Write-Host ""
            Write-Host "The API is working correctly. If you still see 500 errors in the browser:" -ForegroundColor White
            Write-Host "1. Clear browser cache and cookies" -ForegroundColor White
            Write-Host "2. Hard refresh (Ctrl+Shift+R)" -ForegroundColor White
            Write-Host "3. Check if token is being saved in browser cookies" -ForegroundColor White

        } catch {
            Write-Host "FAILED: Proxy request failed!" -ForegroundColor Red
            Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host ""
            Write-Host "Issue: The proxy is not forwarding requests correctly" -ForegroundColor Yellow
            Write-Host "Solution: Check frontend/app/api/proxy/route.ts" -ForegroundColor Yellow
        }

    } catch {
        Write-Host "FAILED: Dashboard stats request failed!" -ForegroundColor Red
        Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        Write-Host "Issue: Backend is rejecting the authenticated request" -ForegroundColor Yellow
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "1. JWT token is invalid" -ForegroundColor White
        Write-Host "2. User does not have required roles (Admin or SuperAdmin)" -ForegroundColor White
        Write-Host "3. Authorization policy misconfigured" -ForegroundColor White
    }

} catch {
    Write-Host "FAILED: Login failed!" -ForegroundColor Red
    Write-Host "  Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Issue: Cannot login to backend" -ForegroundColor Yellow
    Write-Host "Possible causes:" -ForegroundColor Yellow
    Write-Host "1. Backend is not running or not accessible" -ForegroundColor White
    Write-Host "2. Incorrect credentials" -ForegroundColor White
    Write-Host "3. Backend URL is wrong" -ForegroundColor White
}

Write-Host ""
Read-Host "Press Enter to exit"
