# Script to check and fix missing enrollments for paid orders

$baseUrl = "http://localhost:5002/api"
$adminToken = Read-Host "Enter your admin JWT token"

Write-Host "`n=== Checking Enrollment Diagnostics ===" -ForegroundColor Cyan

# Get diagnostics
try {
    $headers = @{
        "Authorization" = "Bearer $adminToken"
        "Content-Type" = "application/json"
    }
    
    $diagnostics = Invoke-RestMethod -Uri "$baseUrl/admin/enrollment-diagnostics" -Method Get -Headers $headers
    
    Write-Host "`nDiagnostic Results:" -ForegroundColor Yellow
    Write-Host "  Total Orders: $($diagnostics.totalOrders)" -ForegroundColor White
    Write-Host "  Paid Orders: $($diagnostics.paidOrders)" -ForegroundColor White
    Write-Host "  Total Enrollments: $($diagnostics.totalEnrollments)" -ForegroundColor White
    Write-Host "  Paid Orders Without Enrollments: $($diagnostics.paidOrdersWithoutEnrollments)" -ForegroundColor $(if ($diagnostics.paidOrdersWithoutEnrollments -gt 0) { "Red" } else { "Green" })
    
    if ($diagnostics.affectedOrders -and $diagnostics.affectedOrders.Count -gt 0) {
        Write-Host "`nAffected Orders:" -ForegroundColor Yellow
        foreach ($order in $diagnostics.affectedOrders) {
            Write-Host "  - Order ID: $($order.id)" -ForegroundColor White
            Write-Host "    User ID: $($order.userId)" -ForegroundColor Gray
            Write-Host "    Amount: $($order.amount) $($order.currency)" -ForegroundColor Gray
            Write-Host "    Status: $($order.status)" -ForegroundColor Gray
            Write-Host "    Created: $($order.createdAt)" -ForegroundColor Gray
            Write-Host "    Items: $($order.itemCount)" -ForegroundColor Gray
            Write-Host ""
        }
        
        $fix = Read-Host "`nDo you want to fix these missing enrollments? (Y/N)"
        
        if ($fix -eq "Y" -or $fix -eq "y") {
            Write-Host "`n=== Fixing Missing Enrollments ===" -ForegroundColor Cyan
            
            $fixResult = Invoke-RestMethod -Uri "$baseUrl/admin/fix-missing-enrollments" -Method Post -Headers $headers
            
            Write-Host "`nFix Results:" -ForegroundColor Yellow
            Write-Host "  Orders Processed: $($fixResult.ordersProcessed)" -ForegroundColor White
            Write-Host "  Enrollments Created: $($fixResult.enrollmentsCreated)" -ForegroundColor Green
            Write-Host "  Errors: $($fixResult.errors)" -ForegroundColor $(if ($fixResult.errors -gt 0) { "Red" } else { "Green" })
            Write-Host "  Message: $($fixResult.message)" -ForegroundColor White
        } else {
            Write-Host "`nSkipped fixing enrollments." -ForegroundColor Yellow
        }
    } else {
        Write-Host "`nNo issues found! All paid orders have enrollments." -ForegroundColor Green
    }
}
catch {
    Write-Host "`nError: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
}

Write-Host "`nDone!" -ForegroundColor Cyan

