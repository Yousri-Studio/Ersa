using SendGrid;
using SendGrid.Helpers.Mail;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using System.Text.Json;

namespace ErsaTraining.API.Services;

public class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly ErsaTrainingDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(
        ISendGridClient sendGridClient,
        ErsaTrainingDbContext context,
        IConfiguration configuration,
        ILogger<EmailService> logger)
    {
        _sendGridClient = sendGridClient;
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendWelcomeEmailAsync(User user)
    {
        try
        {
            var template = await GetTemplateAsync("Welcome");
            if (template == null) return false;

            var templateData = new EmailTemplateData();
            templateData.AddVariable("FullName", user.FullName);

            return await SendEmailAsync(user, template, user.Locale, templateData);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send welcome email to user {UserId}", user.Id);
            return false;
        }
    }

    public async Task<bool> SendEmailVerificationAsync(User user, string verificationToken)
    {
        try
        {
            // Use simple email verification without database templates to avoid DbContext issues
            return await SendSimpleVerificationEmailAsync(user, verificationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email to user {UserId}", user.Id);
            return false;
        }
    }

    private async Task<bool> SendSimpleVerificationEmailAsync(User user, string verificationToken)
    {
        try
        {
            var subject = user.Locale == "ar" ? "تفعيل الحساب - إرساء للتدريب" : "Email Verification - Ersa Training";
            var bodyHtml = user.Locale == "ar" 
                ? $@"
                    <div style='font-family: Arial, sans-serif; direction: rtl; text-align: right;'>
                        <h2>مرحباً {user.FullName}</h2>
                        <p>شكراً لك على التسجيل في إرساء للتدريب. لإكمال عملية التسجيل، يرجى استخدام رمز التفعيل التالي:</p>
                        <div style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;'>
                            {verificationToken}
                        </div>
                        <p>هذا الرمز صالح لمدة 24 ساعة.</p>
                        <p>مع تحيات فريق إرساء للتدريب</p>
                    </div>"
                : $@"
                    <div style='font-family: Arial, sans-serif;'>
                        <h2>Hello {user.FullName}</h2>
                        <p>Thank you for registering with Ersa Training. To complete your registration, please use the following verification code:</p>
                        <div style='background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;'>
                            {verificationToken}
                        </div>
                        <p>This code is valid for 24 hours.</p>
                        <p>Best regards,<br>Ersa Training Team</p>
                    </div>";

            var from = new EmailAddress(_configuration["SendGrid:FromEmail"], _configuration["SendGrid:FromName"]);
            var to = new EmailAddress(user.Email, user.FullName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, bodyHtml);

            var response = await _sendGridClient.SendEmailAsync(msg);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send simple verification email to user {UserId}", user.Id);
            return false;
        }
    }

    public async Task<bool> SendLiveDetailsEmailAsync(Enrollment enrollment, string locale)
    {
        try
        {
            var template = await GetTemplateAsync("LiveDetails");
            if (template == null) return false;

            var user = await _context.Users.FindAsync(enrollment.UserId);
            var course = await _context.Courses.FindAsync(enrollment.CourseId);
            var session = enrollment.SessionId.HasValue 
                ? await _context.Sessions.FindAsync(enrollment.SessionId.Value)
                : null;

            if (user == null || course == null || session == null) return false;

            var templateData = new EmailTemplateData();
            templateData.AddVariable("FullName", user.FullName);
            templateData.AddVariable("CourseTitleAr", course.TitleAr);
            templateData.AddVariable("CourseTitleEn", course.TitleEn);
            templateData.AddVariable("TeamsLink", session.TeamsLink ?? "");
            templateData.AddVariable("StartDate", session.StartAt.ToString("yyyy-MM-dd HH:mm"));
            templateData.AddVariable("EndDate", session.EndAt.ToString("yyyy-MM-dd HH:mm"));

            return await SendEmailAsync(user, template, locale, templateData, enrollment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send live details email for enrollment {EnrollmentId}", enrollment.Id);
            return false;
        }
    }

    public async Task<bool> SendMaterialsDeliveryEmailAsync(Enrollment enrollment, List<SecureLink> secureLinks, string locale)
    {
        try
        {
            var template = await GetTemplateAsync("MaterialsDelivery");
            if (template == null) return false;

            var user = await _context.Users.FindAsync(enrollment.UserId);
            var course = await _context.Courses.FindAsync(enrollment.CourseId);

            if (user == null || course == null) return false;

            var templateData = new EmailTemplateData();
            templateData.AddVariable("FullName", user.FullName);
            templateData.AddVariable("CourseTitleAr", course.TitleAr);
            templateData.AddVariable("CourseTitleEn", course.TitleEn);

            var baseUrl = _configuration["App:BaseUrl"];
            var secureLinksHtml = string.Join("<br/>", secureLinks.Select(sl => 
                $"<a href=\"{baseUrl}/secure/materials/{sl.Token}\">{sl.Attachment.FileName}</a>"));
            templateData.AddVariable("SecureLinks", secureLinksHtml);

            return await SendEmailAsync(user, template, locale, templateData, enrollment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send materials delivery email for enrollment {EnrollmentId}", enrollment.Id);
            return false;
        }
    }

    public async Task<bool> SendLiveReminderEmailAsync(Enrollment enrollment, string locale, int hoursBeforeStart)
    {
        try
        {
            var templateKey = hoursBeforeStart == 24 ? "LiveReminder24h" : "LiveReminder1h";
            var template = await GetTemplateAsync(templateKey);
            if (template == null) return false;

            var user = await _context.Users.FindAsync(enrollment.UserId);
            var course = await _context.Courses.FindAsync(enrollment.CourseId);
            var session = enrollment.SessionId.HasValue 
                ? await _context.Sessions.FindAsync(enrollment.SessionId.Value)
                : null;

            if (user == null || course == null || session == null) return false;

            var templateData = new EmailTemplateData();
            templateData.AddVariable("FullName", user.FullName);
            templateData.AddVariable("CourseTitleAr", course.TitleAr);
            templateData.AddVariable("CourseTitleEn", course.TitleEn);
            templateData.AddVariable("TeamsLink", session.TeamsLink ?? "");
            templateData.AddVariable("StartDate", session.StartAt.ToString("yyyy-MM-dd HH:mm"));
            templateData.AddVariable("HoursRemaining", hoursBeforeStart.ToString());

            return await SendEmailAsync(user, template, locale, templateData, enrollment.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send live reminder email for enrollment {EnrollmentId}", enrollment.Id);
            return false;
        }
    }

    public async Task ProcessWebhookAsync(string payload, string signature)
    {
        try
        {
            // Validate SendGrid webhook signature
            if (!ValidateWebhookSignature(payload, signature))
            {
                _logger.LogWarning("Invalid SendGrid webhook signature");
                return;
            }

            var events = JsonSerializer.Deserialize<SendGridEvent[]>(payload);
            if (events == null) return;

            foreach (var evt in events)
            {
                await ProcessSendGridEventAsync(evt);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process SendGrid webhook");
        }
    }

    private async Task<EmailTemplate?> GetTemplateAsync(string key)
    {
        return await _context.EmailTemplates
            .FirstOrDefaultAsync(t => t.Key == key);
    }

    private async Task<bool> SendEmailAsync(User user, EmailTemplate template, string locale, EmailTemplateData templateData, Guid? enrollmentId = null)
    {
        try
        {
            var subject = locale == "ar" ? template.SubjectAr : template.SubjectEn;
            var bodyHtml = locale == "ar" ? template.BodyHtmlAr : template.BodyHtmlEn;

            // Replace template variables
            foreach (var variable in templateData.Variables)
            {
                subject = subject.Replace($"{{{{{variable.Key}}}}}", variable.Value);
                bodyHtml = bodyHtml.Replace($"{{{{{variable.Key}}}}}", variable.Value);
            }

            var from = new EmailAddress(_configuration["SendGrid:FromEmail"], _configuration["SendGrid:FromName"]);
            var to = new EmailAddress(user.Email, user.FullName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, bodyHtml);

            // Create email log entry with separate context to avoid disposal issues
            var emailLogId = Guid.NewGuid();
            try
            {
                var emailLog = new EmailLog
                {
                    Id = emailLogId,
                    UserId = user.Id,
                    EnrollmentId = enrollmentId,
                    TemplateKey = template.Key,
                    Locale = locale,
                    Status = EmailStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                _context.EmailLogs.Add(emailLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception logEx)
            {
                _logger.LogWarning(logEx, "Failed to create email log entry, proceeding with email send");
            }

            // Send email
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            // Update email log status with error handling
            try
            {
                var emailLog = await _context.EmailLogs.FindAsync(emailLogId);
                if (emailLog != null)
                {
                    if (response.IsSuccessStatusCode)
                    {
                        emailLog.Status = EmailStatus.Sent;
                        emailLog.SentAt = DateTime.UtcNow;
                        emailLog.ProviderMsgId = response.Headers.GetValues("X-Message-Id").FirstOrDefault();
                    }
                    else
                    {
                        emailLog.Status = EmailStatus.Failed;
                        emailLog.ErrorMessage = await response.Body.ReadAsStringAsync();
                    }
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception logEx)
            {
                _logger.LogWarning(logEx, "Failed to update email log status");
            }
            
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email");
            return false;
        }
    }

    private bool ValidateWebhookSignature(string payload, string signature)
    {
        // Implement SendGrid webhook signature validation
        var webhookKey = _configuration["SendGrid:WebhookKey"];
        if (string.IsNullOrEmpty(webhookKey)) return true; // Skip validation if not configured
        
        // TODO: Implement proper signature validation
        return true;
    }

    private async Task ProcessSendGridEventAsync(SendGridEvent evt)
    {
        try
        {
            var emailLog = await _context.EmailLogs
                .FirstOrDefaultAsync(el => el.ProviderMsgId == evt.MessageId);
                
            if (emailLog == null) return;

            switch (evt.Event.ToLower())
            {
                case "delivered":
                    emailLog.Status = EmailStatus.Delivered;
                    break;
                case "opened":
                    emailLog.Status = EmailStatus.Opened;
                    emailLog.OpenedAt = DateTime.UtcNow;
                    break;
                case "click":
                    emailLog.Status = EmailStatus.Clicked;
                    emailLog.ClickedAt = DateTime.UtcNow;
                    break;
                case "bounce":
                    emailLog.Status = EmailStatus.Bounced;
                    break;
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to process SendGrid webhook event for message {MessageId}", evt.MessageId);
        }
    }

    public async Task<bool> SendContactFormNotificationAsync(string firstName, string lastName, string email, string phone, string subject, string message, string locale)
    {
        try
        {
            var adminEmail = _configuration["Email:ContactEmail"] ?? "contact@ersa.com";
            var fromEmail = new EmailAddress(_configuration["Email:FromEmail"] ?? "noreply@ersa.com", "Ersa Training");
            var toEmail = new EmailAddress(adminEmail, "Ersa Admin");
            
            var isArabic = locale == "ar";
            var emailSubject = isArabic ? $"طلب تواصل جديد - {subject}" : $"New Contact Form Submission - {subject}";
            
            var htmlContent = GenerateContactNotificationTemplate(firstName, lastName, email, phone, subject, message, isArabic);
            
            var msg = MailHelper.CreateSingleEmail(fromEmail, toEmail, emailSubject, "", htmlContent);
            
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            var isSuccess = response.IsSuccessStatusCode;
            
            // Log the email
            try
            {
                var emailLog = new EmailLog
                {
                    Id = Guid.NewGuid(),
                    UserId = null, // No user for contact form
                    EnrollmentId = null,
                    TemplateKey = "contact_notification",
                    Locale = locale,
                    Status = isSuccess ? EmailStatus.Sent : EmailStatus.Failed,
                    CreatedAt = DateTime.UtcNow,
                    SentAt = isSuccess ? DateTime.UtcNow : null,
                    ProviderMsgId = isSuccess ? response.Headers.GetValues("X-Message-Id").FirstOrDefault() : null,
                    ErrorMessage = isSuccess ? null : await response.Body.ReadAsStringAsync()
                };

                _context.EmailLogs.Add(emailLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception logEx)
            {
                _logger.LogWarning(logEx, "Failed to log contact notification email");
            }
            
            if (isSuccess)
            {
                _logger.LogInformation("Contact form notification sent successfully to {AdminEmail}", adminEmail);
                return true;
            }
            else
            {
                _logger.LogError("Failed to send contact form notification. Status: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending contact form notification email");
            return false;
        }
    }

    public async Task<bool> SendContactConfirmationAsync(string firstName, string lastName, string email, string locale)
    {
        try
        {
            var fromEmail = new EmailAddress(_configuration["Email:FromEmail"] ?? "noreply@ersa.com", "Ersa Training");
            var toEmail = new EmailAddress(email, $"{firstName} {lastName}");
            
            var isArabic = locale == "ar";
            var emailSubject = isArabic 
                ? "شكراً لتواصلك معنا - إرسا للتدريب"
                : "Thank you for contacting us - Ersa Training";
            
            var htmlContent = GenerateContactConfirmationTemplate(firstName, lastName, isArabic);
            
            var msg = MailHelper.CreateSingleEmail(fromEmail, toEmail, emailSubject, "", htmlContent);
            
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            var isSuccess = response.IsSuccessStatusCode;
            
            // Log the email
            try
            {
                var emailLog = new EmailLog
                {
                    Id = Guid.NewGuid(),
                    UserId = null, // No user for contact confirmation
                    EnrollmentId = null,
                    TemplateKey = "contact_confirmation",
                    Locale = locale,
                    Status = isSuccess ? EmailStatus.Sent : EmailStatus.Failed,
                    CreatedAt = DateTime.UtcNow,
                    SentAt = isSuccess ? DateTime.UtcNow : null,
                    ProviderMsgId = isSuccess ? response.Headers.GetValues("X-Message-Id").FirstOrDefault() : null,
                    ErrorMessage = isSuccess ? null : await response.Body.ReadAsStringAsync()
                };

                _context.EmailLogs.Add(emailLog);
                await _context.SaveChangesAsync();
            }
            catch (Exception logEx)
            {
                _logger.LogWarning(logEx, "Failed to log contact confirmation email");
            }
            
            if (isSuccess)
            {
                _logger.LogInformation("Contact confirmation sent successfully to {Email}", email);
                return true;
            }
            else
            {
                _logger.LogError("Failed to send contact confirmation. Status: {StatusCode}", response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending contact confirmation email");
            return false;
        }
    }

    private string GenerateContactNotificationTemplate(string firstName, string lastName, string email, string phone, string subject, string message, bool isArabic)
    {
        return $@"
<!DOCTYPE html>
<html lang=""{(isArabic ? "ar" : "en")}"" dir=""{(isArabic ? "rtl" : "ltr")}"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{(isArabic ? "طلب تواصل جديد" : "New Contact Request")}</title>
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #00AC96 0%, #292561 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0;
            font-size: 24px;
            font-weight: bold;
        }}
        .content {{
            padding: 30px;
        }}
        .field {{
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border-left: 4px solid #00AC96;
        }}
        .field-label {{
            font-weight: bold;
            color: #292561;
            font-size: 14px;
            margin-bottom: 5px;
            text-transform: uppercase;
        }}
        .field-value {{
            color: #333;
            font-size: 16px;
        }}
        .message-box {{
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            margin-top: 20px;
        }}
        .footer {{
            background-color: #292561;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>{(isArabic ? "طلب تواصل جديد" : "New Contact Request")}</h1>
            <p>{(isArabic ? "تم استلام طلب تواصل جديد من خلال الموقع الإلكتروني" : "A new contact request has been received through the website")}</p>
        </div>
        
        <div class=""content"">
            <div class=""field"">
                <div class=""field-label"">{(isArabic ? "الاسم الكامل" : "Full Name")}</div>
                <div class=""field-value"">{firstName} {lastName}</div>
            </div>
            
            <div class=""field"">
                <div class=""field-label"">{(isArabic ? "البريد الإلكتروني" : "Email Address")}</div>
                <div class=""field-value"">{email}</div>
            </div>
            
            {(string.IsNullOrEmpty(phone) ? "" : $@"
            <div class=""field"">
                <div class=""field-label"">{(isArabic ? "رقم الهاتف" : "Phone Number")}</div>
                <div class=""field-value"">{phone}</div>
            </div>")}
            
            <div class=""field"">
                <div class=""field-label"">{(isArabic ? "موضوع الرسالة" : "Subject")}</div>
                <div class=""field-value"">{subject}</div>
            </div>
            
            <div class=""message-box"">
                <div class=""field-label"">{(isArabic ? "نص الرسالة" : "Message")}</div>
                <div class=""field-value"">{message.Replace("\n", "<br>")}</div>
            </div>
        </div>
        
        <div class=""footer"">
            <p>{(isArabic ? "إرسا للتدريب والاستشارات" : "Ersa Training & Consulting")}</p>
            <p>{(isArabic ? "يرجى الرد على هذا الطلب في أقرب وقت ممكن" : "Please respond to this request as soon as possible")}</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GenerateContactConfirmationTemplate(string firstName, string lastName, bool isArabic)
    {
        return $@"
<!DOCTYPE html>
<html lang=""{(isArabic ? "ar" : "en")}"" dir=""{(isArabic ? "rtl" : "ltr")}"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{(isArabic ? "شكراً لتواصلك معنا" : "Thank you for contacting us")}</title>
    <style>
        body {{
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f4f4f4;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #00AC96 0%, #292561 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }}
        .header h1 {{
            margin: 0 0 10px 0;
            font-size: 28px;
            font-weight: bold;
        }}
        .header p {{
            margin: 0;
            font-size: 16px;
            opacity: 0.9;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 18px;
            color: #292561;
            margin-bottom: 20px;
            font-weight: bold;
        }}
        .message {{
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
        }}
        .highlight-box {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-left: 4px solid #00AC96;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }}
        .contact-info {{
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-top: 30px;
        }}
        .contact-info h3 {{
            color: #292561;
            margin-top: 0;
            margin-bottom: 15px;
        }}
        .contact-info p {{
            margin: 5px 0;
            color: #666;
        }}
        .footer {{
            background-color: #292561;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer h3 {{
            margin: 0 0 10px 0;
            font-size: 20px;
        }}
        .footer p {{
            margin: 5px 0;
            opacity: 0.9;
        }}
        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, #00AC96 0%, #008a7a 100%);
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin-top: 20px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>{(isArabic ? "شكراً لتواصلك معنا!" : "Thank You for Contacting Us!")}</h1>
            <p>{(isArabic ? "استلمنا رسالتك بنجاح" : "We have successfully received your message")}</p>
        </div>
        
        <div class=""content"">
            <div class=""greeting"">
                {(isArabic ? $"عزيزي/عزيزتي {firstName} {lastName}،" : $"Dear {firstName} {lastName},")}
            </div>
            
            <div class=""message"">
                <p>{(isArabic ? 
                    "شكراً لك على تواصلك مع إرسا للتدريب والاستشارات. لقد استلمنا رسالتك وسيقوم أحد أعضاء فريقنا بالتواصل معك في أقرب وقت ممكن." : 
                    "Thank you for contacting Ersa Training & Consulting. We have received your message and one of our team members will get back to you as soon as possible.")}</p>
            </div>
            
            <div class=""highlight-box"">
                <p><strong>{(isArabic ? "ماذا يحدث بعد ذلك؟" : "What happens next?")}</strong></p>
                <ul>
                    <li>{(isArabic ? "سيراجع فريقنا رسالتك خلال 24 ساعة" : "Our team will review your message within 24 hours")}</li>
                    <li>{(isArabic ? "سنتواصل معك عبر البريد الإلكتروني أو الهاتف" : "We will contact you via email or phone")}</li>
                    <li>{(isArabic ? "سنقدم لك الحلول والإجابات المناسبة لاستفساراتك" : "We will provide you with appropriate solutions and answers to your inquiries")}</li>
                </ul>
            </div>
            
            <div class=""contact-info"">
                <h3>{(isArabic ? "معلومات التواصل" : "Contact Information")}</h3>
                <p><strong>{(isArabic ? "البريد الإلكتروني:" : "Email:")}</strong> contact@ersa.com</p>
                <p><strong>{(isArabic ? "الهاتف:" : "Phone:")}</strong> +966 11 123 4567</p>
                <p><strong>{(isArabic ? "الموقع الإلكتروني:" : "Website:")}</strong> www.ersa-training.com</p>
            </div>
            
            <div style=""text-align: center;"">
                <a href=""https://ersa-training.com/{(isArabic ? "ar" : "en")}/courses"" class=""btn"">
                    {(isArabic ? "تصفح دوراتنا التدريبية" : "Browse Our Training Courses")}
                </a>
            </div>
        </div>
        
        <div class=""footer"">
            <h3>{(isArabic ? "إرسا للتدريب والاستشارات" : "Ersa Training & Consulting")}</h3>
            <p>{(isArabic ? "نساعدك في تحقيق أهدافك التعليمية والمهنية" : "Helping you achieve your educational and professional goals")}</p>
            <p>{(isArabic ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia")}</p>
        </div>
    </div>
</body>
</html>";
    }
}

public class SendGridEvent
{
    public string Event { get; set; } = string.Empty;
    public string MessageId { get; set; } = string.Empty;
    public long Timestamp { get; set; }
    public string Email { get; set; } = string.Empty;
}