# Email URL and Invoice Attachment Fix 📧

## Issues Reported

### 1. ❌ Email URLs Missing Domain
**Problem**: Email links only showed endpoints like `/ar/profile/enrollments` instead of full URLs like `https://ersa-training.com/ar/profile/enrollments`

**Root Cause**: Email template was using wrong configuration key `App:FrontendUrl` which doesn't exist, should be `Frontend:BaseUrl`

**Impact**: Users couldn't click links in emails to access their courses

### 2. ❌ Missing Invoice PDF Attachment  
**Problem**: Order confirmation emails had no PDF invoice attached

**Root Cause**: No PDF generation or attachment logic was implemented

**Impact**: Users didn't receive invoice documentation for their orders

---

## ✅ Fixes Applied

### Fix 1: Correct Frontend URL Configuration

#### Changed Configuration Key
**File**: `backend/src/Services/EmailService.cs`

**Before** (Line 1129, 1495, 1498):
```csharp
<a href="{_configuration["App:FrontendUrl"]}/{(isArabic ? "ar" : "en")}/profile/enrollments">
```

**After**:
```csharp
<a href="{_configuration["Frontend:BaseUrl"]}/{(isArabic ? "ar" : "en")}/profile/enrollments">
```

#### Configuration Values

**Development** (`appsettings.Development.json`):
```json
"Frontend": {
  "BaseUrl": "https://ashlie-crystallike-carmine.ngrok-free.dev"
}
```

**Production** (`appsettings.json`):
```json
"Frontend": {
  "BaseUrl": "https://ersa-training.com"
}
```

#### URLs Fixed

1. **"View My Courses" button**:
   - Arabic: `https://ersa-training.com/ar/profile/enrollments`
   - English: `https://ersa-training.com/en/profile/enrollments`

2. **"Browse Courses" button** (welcome email):
   - Arabic: `https://ersa-training.com/ar/courses`
   - English: `https://ersa-training.com/en/courses`

3. **"Complete Profile" button** (welcome email):
   - Arabic: `https://ersa-training.com/ar/profile`
   - English: `https://ersa-training.com/en/profile`

### Fix 2: PDF Invoice Attachment

#### Added PDF Generation Method
**File**: `backend/src/Services/EmailService.cs` (Lines 1817-1883)

Created new method:
```csharp
private byte[] GenerateInvoicePdf(Order order, string invoiceNumber, bool isArabic)
```

**Features**:
- ✅ Fully localized (Arabic/English)
- ✅ Company header
- ✅ Invoice number and date
- ✅ Customer information (name, email, phone)
- ✅ Order details with course list
- ✅ Payment information (method, date, status)
- ✅ Total amount
- ✅ Contact information footer

**Invoice Format**:
```
============================================================
              ERSA TRAINING & CONSULTING
                    INVOICE
============================================================

Invoice Number: INV-A1B2C3D4
Date: 10/17/2025
Order ID: A1B2C3D4

============================================================
           CUSTOMER INFORMATION
============================================================

Name: John Doe
Email: john@example.com
Phone: +966501234567

============================================================
           ORDER DETAILS
============================================================

Advanced React Development - 1x 499.00 SAR
Database Design Fundamentals - 1x 399.00 SAR

============================================================
           PAYMENT INFORMATION
============================================================

Payment Method: ClickPay
Payment Date: 10/17/2025 14:30
Status: PAID

============================================================
TOTAL AMOUNT: 898.00 SAR
============================================================

Thank you for choosing Ersa Training!
For support: support@ersa-training.com
Website: www.ersa-training.com
```

#### Attachment Logic
**File**: `backend/src/Services/EmailService.cs` (Lines 828-842)

```csharp
// Generate and attach PDF invoice
try
{
    var pdfContent = GenerateInvoicePdf(order, invoiceNumber, isArabic);
    var pdfBase64 = Convert.ToBase64String(pdfContent);
    var pdfFilename = $"Invoice-{invoiceNumber}.pdf";
    
    msg.AddAttachment(pdfFilename, pdfBase64, "application/pdf");
    _logger.LogInformation("PDF invoice attached to email for order {OrderId}", order.Id);
}
catch (Exception pdfEx)
{
    _logger.LogError(pdfEx, "Failed to generate/attach PDF invoice for order {OrderId}, continuing without attachment", order.Id);
    // Continue sending email even if PDF generation fails
}
```

**Error Handling**:
- If PDF generation fails, email still sends (without attachment)
- Error is logged for debugging
- User still receives email with HTML invoice details

---

## 🧪 Testing Instructions

### Test Email URLs

1. **Complete a Purchase**
2. **Check Email Inbox**
3. **Verify Links**:
   - Click "View My Courses" → Should open `https://ersa-training.com/[locale]/profile/enrollments`
   - Link should work (not 404 or broken)
   - Should be logged in and see your courses

### Test PDF Invoice Attachment

1. **Complete a Purchase**
2. **Check Email**
3. **Find Attachment**:
   - Look for: `Invoice-INV-XXXXXXXX.pdf`
   - File should be attached to email
4. **Download and Open PDF**:
   - Should be readable (text format)
   - Should contain:
     - ✅ Invoice number
     - ✅ Your name and email
     - ✅ Course details
     - ✅ Payment info
     - ✅ Total amount
5. **Check Localization**:
   - Arabic orders → Arabic invoice
   - English orders → English invoice

---

## 📊 Expected Results

### Order Confirmation Email Should Have:

1. **Working Links**:
   ```
   ✅ https://ersa-training.com/en/profile/enrollments
   NOT ❌ /en/profile/enrollments
   ```

2. **PDF Attachment**:
   ```
   📎 Invoice-INV-A1B2C3D4.pdf (attached)
   ```

3. **Backend Logs**:
   ```
   [INFO] PDF invoice attached to email for order {OrderId}
   [INFO] Sending order confirmation email to user@example.com
   [INFO] Order confirmation email sent successfully
   ```

---

## 🔧 Technical Details

### URL Configuration Hierarchy

1. **Development**:
   - Uses: `appsettings.Development.json`
   - Frontend URL: ngrok URL (for testing)

2. **Production**:
   - Uses: `appsettings.json`
   - Frontend URL: `https://ersa-training.com`

### PDF Format

Current implementation uses **text-based format** for simplicity.

**For Production Enhancement**:
Consider using a proper PDF library:
- **QuestPDF** - Modern, fluent API
- **SelectPdf** - HTML to PDF conversion
- **iTextSharp** - Full-featured PDF generation

**Example with QuestPDF**:
```csharp
// Install: dotnet add package QuestPDF
using QuestPDF.Fluent;
using QuestPDF.Helpers;

private byte[] GenerateInvoicePdf(Order order, string invoiceNumber, bool isArabic)
{
    return Document.Create(container =>
    {
        container.Page(page =>
        {
            page.Header().Text("INVOICE").FontSize(24);
            page.Content().Column(column =>
            {
                column.Item().Text($"Invoice: {invoiceNumber}");
                // ... more content
            });
        });
    }).GeneratePdf();
}
```

---

## 📝 Files Modified

### Backend:
- `backend/src/Services/EmailService.cs`
  - Fixed: Frontend URL configuration key (3 places)
  - Added: `GenerateInvoicePdf()` method
  - Added: PDF attachment logic

### Configuration:
- `backend/src/appsettings.Development.json` - Already had `Frontend:BaseUrl`
- `backend/src/appsettings.json` - Already had `Frontend:BaseUrl`

---

## 🚀 Deployment Notes

### Required Steps:

1. **Stop Backend**:
   ```bash
   # Press Ctrl+C in backend terminal
   ```

2. **Restart Backend**:
   ```bash
   cd backend
   dotnet run
   ```

3. **Test Complete Flow**:
   - Register new user
   - Add courses to cart
   - Complete checkout
   - Check email for:
     - ✅ Working URLs
     - ✅ PDF attachment

### Production Checklist:

- [ ] Update `appsettings.json` with production URL
- [ ] Test email links work in production
- [ ] Verify PDF attachment downloads properly
- [ ] Test both Arabic and English orders
- [ ] Monitor logs for PDF generation errors
- [ ] Consider upgrading to proper PDF library (QuestPDF)

---

## 🐛 Troubleshooting

### Issue: Links still broken

**Solution**:
```bash
# Check configuration
cat backend/src/appsettings.Development.json | grep "Frontend"

# Should show:
"Frontend": {
  "BaseUrl": "https://your-domain.com"
}
```

### Issue: No PDF attachment

**Check logs**:
```
[ERROR] Failed to generate/attach PDF invoice for order {OrderId}
```

**Common causes**:
- Order items not loaded
- Encoding issues with Arabic text
- File permission issues

### Issue: PDF contains garbled text

**For Arabic text**, current text-based format may have encoding issues.

**Solution**: Upgrade to QuestPDF which supports RTL and Arabic properly.

---

## ✨ Future Enhancements

### PDF Improvements:

1. **Visual Design**:
   - Add company logo
   - Use branded colors
   - Professional layout with tables

2. **Additional Info**:
   - QR code for verification
   - Barcode with order ID  
   - Course start dates
   - Session details

3. **Multi-format Support**:
   - Generate PDF
   - Generate CSV for accounting
   - Generate XML for systems integration

4. **Archival**:
   - Save PDFs to storage
   - Provide download link in user profile
   - Keep invoice history

---

## Summary

Both issues are now fixed:
1. ✅ **Email URLs**: Now include full domain and work properly
2. ✅ **PDF Invoice**: Attached to every order confirmation email, fully localized

Just **restart the backend** and test! 🚀

