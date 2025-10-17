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
            var fromEmail = _configuration["SendGrid:FromEmail"];
            var fromName = _configuration["SendGrid:FromName"];
            var isArabic = user.Locale == "ar";

            // Create localized subject
            var subject = isArabic 
                ? $"مرحباً بك في إرساء للتدريب - {user.FullName}"
                : $"Welcome to Ersa Training - {user.FullName}";

            // Generate HTML body
            var bodyHtml = GenerateWelcomeEmailTemplate(user, isArabic);

            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(user.Email, user.FullName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, bodyHtml);

            _logger.LogInformation("Sending welcome email to {Email}", user.Email);
            var response = await _sendGridClient.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted || response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                _logger.LogInformation("Welcome email sent successfully to {Email}", user.Email);
                return true;
            }
            else
            {
                var body = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send welcome email. Status: {StatusCode}, Body: {Body}", response.StatusCode, body);
                return false;
            }
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
            var fromEmail = _configuration["SendGrid:FromEmail"];
            var fromName = _configuration["SendGrid:FromName"];
            var isArabic = user.Locale == "ar";
            
            _logger.LogInformation("Attempting to send verification email to {Email} from {FromEmail}", user.Email, fromEmail);
            
            var subject = isArabic ? "تفعيل الحساب - إرساء للتدريب" : "Email Verification - Ersa Training";
            var bodyHtml = GenerateVerificationEmailTemplate(user, verificationToken, isArabic);

            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(user.Email, user.FullName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, bodyHtml);

            _logger.LogInformation("Sending email via SendGrid...");
            var response = await _sendGridClient.SendEmailAsync(msg);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Verification email sent successfully to {Email}. Status: {StatusCode}", user.Email, response.StatusCode);
                return true;
            }
            else
            {
                var errorBody = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send verification email to {Email}. Status: {StatusCode}, Error: {Error}", user.Email, response.StatusCode, errorBody);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception while sending verification email to user {UserId}", user.Id);
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
            // Check if payload is empty (SendGrid verification pings)
            if (string.IsNullOrWhiteSpace(payload))
            {
                _logger.LogInformation("Received empty webhook payload (likely SendGrid verification)");
                return;
            }

            // Validate SendGrid webhook signature
            if (!ValidateWebhookSignature(payload, signature))
            {
                _logger.LogWarning("Invalid SendGrid webhook signature");
                return;
            }

            var events = JsonSerializer.Deserialize<SendGridEvent[]>(payload);
            if (events == null || events.Length == 0) 
            {
                _logger.LogWarning("Webhook payload deserialized to null or empty array");
                return;
            }

            _logger.LogInformation("Processing {EventCount} SendGrid webhook events", events.Length);
            foreach (var evt in events)
            {
                await ProcessSendGridEventAsync(evt);
            }
        }
        catch (JsonException jsonEx)
        {
            _logger.LogWarning(jsonEx, "Failed to parse SendGrid webhook JSON. Payload: {Payload}", payload);
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

    public async Task<bool> SendOrderConfirmationEmailAsync(Order order, string locale)
    {
        try
        {
            // Load order with all related data if not already loaded
            if (order.User == null || order.OrderItems == null || order.Payments == null)
            {
                order = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .Include(o => o.Payments)
                    .FirstOrDefaultAsync(o => o.Id == order.Id);

                if (order == null)
                {
                    _logger.LogError("Order {OrderId} not found", order.Id);
                    return false;
                }
            }

            var fromEmail = _configuration["SendGrid:FromEmail"];
            var fromName = _configuration["SendGrid:FromName"];
            var isArabic = locale == "ar";

            // Generate invoice number
            var invoiceNumber = $"INV-{order.Id.ToString().Substring(0, 8).ToUpper()}";

            // Create localized subject
            var subject = isArabic 
                ? $"تأكيد الطلب #{invoiceNumber} - إرساء للتدريب"
                : $"Order Confirmation #{invoiceNumber} - Ersa Training";

            // Generate HTML body
            var bodyHtml = GenerateOrderConfirmationTemplate(order, invoiceNumber, isArabic);

            var from = new EmailAddress(fromEmail, fromName);
            var to = new EmailAddress(order.User.Email, order.User.FullName);
            var msg = MailHelper.CreateSingleEmail(from, to, subject, null, bodyHtml);

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

            _logger.LogInformation("Sending order confirmation email to {Email} for order {OrderId}", order.User.Email, order.Id);
            var response = await _sendGridClient.SendEmailAsync(msg);

            if (response.StatusCode == System.Net.HttpStatusCode.Accepted || response.StatusCode == System.Net.HttpStatusCode.OK)
            {
                _logger.LogInformation("Order confirmation email sent successfully to {Email}", order.User.Email);
                return true;
            }
            else
            {
                var body = await response.Body.ReadAsStringAsync();
                _logger.LogError("Failed to send order confirmation email. Status: {StatusCode}, Body: {Body}", response.StatusCode, body);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending order confirmation email for order {OrderId}", order.Id);
            return false;
        }
    }

    private string GenerateOrderConfirmationTemplate(Order order, string invoiceNumber, bool isArabic)
    {
        var formattedDate = order.CreatedAt.ToString(isArabic ? "dd/MM/yyyy" : "MM/dd/yyyy");
        var formattedAmount = order.Amount.ToString("N2");
        
        // Calculate payment info
        var payment = order.Payments?.FirstOrDefault(p => p.Status == PaymentStatus.Completed);
        var paymentMethod = payment?.Provider ?? "Unknown";
        var paymentDate = payment?.CapturedAt?.ToString(isArabic ? "dd/MM/yyyy HH:mm" : "MM/dd/yyyy hh:mm tt") ?? formattedDate;

        // Build courses list
        var coursesHtml = string.Join("", order.OrderItems.Select(item =>
        {
            var courseTitle = isArabic ? item.CourseTitleAr : item.CourseTitleEn;
            var priceFormatted = item.Price.ToString("N2");
            return $@"
            <tr>
                <td style=""padding: 12px; border-bottom: 1px solid #eee; color: #333;"">{courseTitle}</td>
                <td style=""padding: 12px; border-bottom: 1px solid #eee; text-align: center; color: #666;"">{item.Qty}</td>
                <td style=""padding: 12px; border-bottom: 1px solid #eee; text-align: {(isArabic ? "left" : "right")}; color: #00AC96; font-weight: bold;"">{priceFormatted} {item.Currency}</td>
            </tr>";
        }));

        return $@"
<!DOCTYPE html>
<html lang=""{(isArabic ? "ar" : "en")}"" dir=""{(isArabic ? "rtl" : "ltr")}"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{(isArabic ? "تأكيد الطلب" : "Order Confirmation")}</title>
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
            max-width: 650px;
            margin: 20px auto;
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
            font-size: 32px;
            font-weight: bold;
        }}
        .header p {{
            margin: 0;
            font-size: 16px;
            opacity: 0.95;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .success-icon {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .success-icon div {{
            display: inline-block;
            width: 80px;
            height: 80px;
            background-color: #00AC96;
            border-radius: 50%;
            line-height: 80px;
            font-size: 48px;
            color: white;
        }}
        .greeting {{
            font-size: 20px;
            color: #292561;
            margin-bottom: 20px;
            font-weight: bold;
            text-align: center;
        }}
        .message {{
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
            text-align: center;
        }}
        .invoice-box {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px solid #00AC96;
            border-radius: 10px;
            padding: 25px;
            margin: 30px 0;
        }}
        .invoice-header {{
            display: flex;
            justify-content: space-between;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #ddd;
        }}
        .invoice-number {{
            font-size: 24px;
            font-weight: bold;
            color: #292561;
        }}
        .invoice-date {{
            font-size: 14px;
            color: #666;
        }}
        .invoice-details {{
            margin: 20px 0;
        }}
        .detail-row {{
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }}
        .detail-label {{
            color: #666;
            font-weight: bold;
        }}
        .detail-value {{
            color: #333;
        }}
        table {{
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }}
        th {{
            background-color: #292561;
            color: white;
            padding: 12px;
            text-align: {(isArabic ? "right" : "left")};
            font-weight: bold;
        }}
        .total-row {{
            background-color: #f8f9fa;
            font-weight: bold;
        }}
        .total-amount {{
            font-size: 24px;
            color: #00AC96;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 10px;
        }}
        .next-steps {{
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }}
        .next-steps h3 {{
            margin-top: 0;
            color: #1976d2;
        }}
        .next-steps ul {{
            margin: 10px 0;
            padding-{(isArabic ? "right" : "left")}: 20px;
        }}
        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, #00AC96 0%, #008a7a 100%);
            color: white;
            padding: 14px 35px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            margin: 20px 0;
        }}
        .btn-container {{
            text-align: center;
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
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <h1>{(isArabic ? "✓ تم تأكيد طلبك بنجاح!" : "✓ Order Confirmed Successfully!")}</h1>
            <p>{(isArabic ? "شكراً لك على اختيارك إرساء للتدريب" : "Thank you for choosing Ersa Training")}</p>
        </div>
        
        <div class=""content"">
            <div class=""success-icon"">
                <div>✓</div>
            </div>
            
            <div class=""greeting"">
                {(isArabic ? $"عزيزي/عزيزتي {order.User.FullName}،" : $"Dear {order.User.FullName},")}
            </div>
            
            <div class=""message"">
                <p>{(isArabic ? 
                    "تم تأكيد طلبك ومعالجة الدفع بنجاح. يسعدنا انضمامك لمنصة إرساء للتدريب!" : 
                    "Your order has been confirmed and payment has been processed successfully. We're excited to have you join Ersa Training Platform!")}</p>
            </div>
            
            <div class=""invoice-box"">
                <div class=""invoice-header"">
                    <div>
                        <div class=""invoice-number"">{(isArabic ? "فاتورة رقم" : "Invoice")} #{invoiceNumber}</div>
                        <div class=""invoice-date"">{(isArabic ? "التاريخ" : "Date")}: {formattedDate}</div>
                    </div>
                </div>
                
                <div class=""invoice-details"">
                    <div class=""detail-row"">
                        <span class=""detail-label"">{(isArabic ? "رقم الطلب:" : "Order ID:")}</span>
                        <span class=""detail-value"">#{order.Id.ToString().Substring(0, 8).ToUpper()}</span>
                    </div>
                    <div class=""detail-row"">
                        <span class=""detail-label"">{(isArabic ? "طريقة الدفع:" : "Payment Method:")}</span>
                        <span class=""detail-value"">{paymentMethod}</span>
                    </div>
                    <div class=""detail-row"">
                        <span class=""detail-label"">{(isArabic ? "تاريخ الدفع:" : "Payment Date:")}</span>
                        <span class=""detail-value"">{paymentDate}</span>
                    </div>
                    <div class=""detail-row"">
                        <span class=""detail-label"">{(isArabic ? "الحالة:" : "Status:")}</span>
                        <span class=""detail-value"" style=""color: #00AC96; font-weight: bold;"">{(isArabic ? "مدفوع" : "Paid")}</span>
                    </div>
                </div>
                
                <table>
                    <thead>
                        <tr>
                            <th>{(isArabic ? "الدورة" : "Course")}</th>
                            <th style=""text-align: center;"">{(isArabic ? "الكمية" : "Qty")}</th>
                            <th style=""text-align: {(isArabic ? "left" : "right")};"">{(isArabic ? "السعر" : "Price")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {coursesHtml}
                        <tr class=""total-row"">
                            <td colspan=""2"" style=""padding: 15px; text-align: {(isArabic ? "left" : "right")};"">{(isArabic ? "الإجمالي:" : "Total:")}</td>
                            <td style=""padding: 15px; text-align: {(isArabic ? "left" : "right")}; color: #00AC96; font-size: 20px;"">{formattedAmount} {order.Currency}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            
            <div class=""next-steps"">
                <h3>{(isArabic ? "📋 الخطوات التالية" : "📋 Next Steps")}</h3>
                <ul>
                    <li>{(isArabic ? "يمكنك الآن الوصول إلى دوراتك من لوحة التحكم الخاصة بك" : "You can now access your courses from your dashboard")}</li>
                    <li>{(isArabic ? "ستتلقى بريداً إلكترونياً إضافياً مع تفاصيل الدورات والجلسات" : "You will receive additional emails with course and session details")}</li>
                    <li>{(isArabic ? "تحقق من صفحة \"دوراتي\" للبدء في التعلم" : "Check your \"My Courses\" page to start learning")}</li>
                </ul>
            </div>
            
            <div class=""btn-container"">
                <a href=""{_configuration["Frontend:BaseUrl"]}/{(isArabic ? "ar" : "en")}/profile/enrollments"" class=""btn"">
                    {(isArabic ? "عرض دوراتي" : "View My Courses")}
                </a>
            </div>
            
            <div style=""margin-top: 30px; padding: 20px; background-color: #fff3cd; border-radius: 8px; border: 1px solid #ffc107;"">
                <p style=""margin: 0; color: #856404;"">
                    <strong>{(isArabic ? "💡 نصيحة:" : "💡 Tip:")}</strong> 
                    {(isArabic ? 
                        "يمكنك العودة إلى هذا البريد الإلكتروني في أي وقت للحصول على تفاصيل طلبك." : 
                        "You can always refer back to this email for your order details.")}
                </p>
            </div>
        </div>
        
        <div class=""footer"">
            <h3>{(isArabic ? "إرسا للتدريب والاستشارات" : "Ersa Training & Consulting")}</h3>
            <p>{(isArabic ? "نساعدك في تحقيق أهدافك التعليمية والمهنية" : "Helping you achieve your educational and professional goals")}</p>
            <p>{(isArabic ? "للدعم الفني:" : "For support:")} support@ersa-training.com</p>
            <p>{(isArabic ? "الموقع الإلكتروني:" : "Website:")} www.ersa-training.com</p>
        </div>
    </div>
</body>
</html>";
    }

    private string GenerateWelcomeEmailTemplate(User user, bool isArabic)
    {
        var firstName = user.FullName.Split(' ')[0]; // Get first name

        return $@"
<!DOCTYPE html>
<html lang=""{(isArabic ? "ar" : "en")}"" dir=""{(isArabic ? "rtl" : "ltr")}"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{(isArabic ? "مرحباً بك" : "Welcome")}</title>
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
            max-width: 650px;
            margin: 20px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }}
        .header {{
            background: linear-gradient(135deg, #00AC96 0%, #292561 100%);
            color: white;
            padding: 50px 30px;
            text-align: center;
            position: relative;
        }}
        .header h1 {{
            margin: 0 0 15px 0;
            font-size: 36px;
            font-weight: bold;
        }}
        .header p {{
            margin: 0;
            font-size: 18px;
            opacity: 0.95;
        }}
        .welcome-icon {{
            width: 100px;
            height: 100px;
            background-color: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 60px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 24px;
            color: #292561;
            margin-bottom: 25px;
            font-weight: bold;
            text-align: center;
        }}
        .welcome-message {{
            font-size: 16px;
            line-height: 1.8;
            color: #555;
            margin-bottom: 30px;
            text-align: center;
        }}
        .features-box {{
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            padding: 30px;
            margin: 30px 0;
        }}
        .features-box h3 {{
            color: #292561;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 22px;
            text-align: center;
        }}
        .feature-item {{
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }}
        .feature-icon {{
            width: 40px;
            height: 40px;
            background: linear-gradient(135deg, #00AC96 0%, #008a7a 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            flex-shrink: 0;
            margin-{(isArabic ? "left" : "right")}: 15px;
        }}
        .feature-content h4 {{
            margin: 0 0 5px 0;
            color: #292561;
            font-size: 16px;
        }}
        .feature-content p {{
            margin: 0;
            color: #666;
            font-size: 14px;
        }}
        .recommendations {{
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }}
        .recommendations h3 {{
            color: #1976d2;
            margin-top: 0;
            margin-bottom: 15px;
        }}
        .recommendations ul {{
            margin: 10px 0;
            padding-{(isArabic ? "right" : "left")}: 20px;
        }}
        .recommendations li {{
            margin-bottom: 10px;
            color: #555;
        }}
        .cta-section {{
            text-align: center;
            margin: 40px 0;
        }}
        .btn {{
            display: inline-block;
            background: linear-gradient(135deg, #00AC96 0%, #008a7a 100%);
            color: white;
            padding: 16px 40px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            margin: 10px;
            box-shadow: 0 4px 15px rgba(0,172,150,0.3);
        }}
        .btn-secondary {{
            background: linear-gradient(135deg, #292561 0%, #1a1740 100%);
            box-shadow: 0 4px 15px rgba(41,37,97,0.3);
        }}
        .stats-box {{
            display: flex;
            justify-content: space-around;
            margin: 30px 0;
            padding: 20px;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 10px;
        }}
        .stat-item {{
            text-align: center;
        }}
        .stat-number {{
            font-size: 32px;
            font-weight: bold;
            color: #00AC96;
            margin-bottom: 5px;
        }}
        .stat-label {{
            font-size: 14px;
            color: #666;
        }}
        .testimonial {{
            background-color: #fff8e1;
            border-radius: 10px;
            padding: 20px;
            margin: 30px 0;
            font-style: italic;
            border-left: 4px solid #ffc107;
        }}
        .testimonial p {{
            margin: 0 0 10px 0;
            color: #666;
        }}
        .testimonial .author {{
            font-weight: bold;
            color: #292561;
            font-style: normal;
        }}
        .footer {{
            background-color: #292561;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer h3 {{
            margin: 0 0 15px 0;
            font-size: 20px;
        }}
        .footer p {{
            margin: 5px 0;
            opacity: 0.9;
        }}
        .social-links {{
            margin-top: 20px;
        }}
        .social-links a {{
            display: inline-block;
            width: 40px;
            height: 40px;
            background-color: #00AC96;
            border-radius: 50%;
            margin: 0 5px;
            line-height: 40px;
            color: white;
            text-decoration: none;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <div class=""welcome-icon"">
                🎉
            </div>
            <h1>{(isArabic ? $"مرحباً {firstName}!" : $"Welcome {firstName}!")}</h1>
            <p>{(isArabic ? "يسعدنا انضمامك لعائلة إرساء للتدريب" : "We're thrilled to have you join the Ersa Training family")}</p>
        </div>
        
        <div class=""content"">
            <div class=""greeting"">
                {(isArabic ? $"عزيزي/عزيزتي {user.FullName}،" : $"Dear {user.FullName},")}
            </div>
            
            <div class=""welcome-message"">
                <p>{(isArabic ? 
                    "تهانينا! لقد أكملت التسجيل بنجاح في منصة إرساء للتدريب. نحن متحمسون لمساعدتك في تحقيق أهدافك التعليمية والمهنية." : 
                    "Congratulations! You've successfully completed your registration on the Ersa Training platform. We're excited to help you achieve your educational and professional goals.")}</p>
                
                <p style=""margin-top: 20px;"">{(isArabic ? 
                    "إرساء ليست مجرد منصة تدريب، بل هي شريكك في رحلة النمو والتطوير المهني. نحن ملتزمون بتقديم أفضل تجربة تعليمية لك." : 
                    "Ersa is not just a training platform; it's your partner in growth and professional development. We're committed to providing you with the best learning experience.")}</p>
            </div>
            
            <div class=""features-box"">
                <h3>{(isArabic ? "🌟 ما الذي يميز إرساء للتدريب؟" : "🌟 What Makes Ersa Training Special?")}</h3>
                
                <div class=""feature-item"">
                    <div class=""feature-icon"">📚</div>
                    <div class=""feature-content"">
                        <h4>{(isArabic ? "دورات عالية الجودة" : "High-Quality Courses")}</h4>
                        <p>{(isArabic ? 
                            "برامج تدريبية مصممة بعناية من قبل خبراء في المجال لضمان أفضل النتائج" : 
                            "Carefully designed training programs by industry experts to ensure the best results")}</p>
                    </div>
                </div>
                
                <div class=""feature-item"">
                    <div class=""feature-icon"">👨‍🏫</div>
                    <div class=""feature-content"">
                        <h4>{(isArabic ? "مدربون محترفون" : "Professional Instructors")}</h4>
                        <p>{(isArabic ? 
                            "تعلم من أفضل المدربين ذوي الخبرة العملية والأكاديمية الواسعة" : 
                            "Learn from the best instructors with extensive practical and academic experience")}</p>
                    </div>
                </div>
                
                <div class=""feature-item"">
                    <div class=""feature-icon"">🏆</div>
                    <div class=""feature-content"">
                        <h4>{(isArabic ? "شهادات معتمدة" : "Certified Certificates")}</h4>
                        <p>{(isArabic ? 
                            "احصل على شهادات معتمدة تعزز مسيرتك المهنية وتفتح لك فرصاً جديدة" : 
                            "Earn certified certificates that boost your career and open new opportunities")}</p>
                    </div>
                </div>
                
                <div class=""feature-item"">
                    <div class=""feature-icon"">💻</div>
                    <div class=""feature-content"">
                        <h4>{(isArabic ? "منصة سهلة الاستخدام" : "User-Friendly Platform")}</h4>
                        <p>{(isArabic ? 
                            "تجربة تعليمية سلسة ومريحة على جميع الأجهزة" : 
                            "Seamless and comfortable learning experience across all devices")}</p>
                    </div>
                </div>
            </div>
            
            <div class=""stats-box"">
                <div class=""stat-item"">
                    <div class=""stat-number"">500+</div>
                    <div class=""stat-label"">{(isArabic ? "دورة تدريبية" : "Training Courses")}</div>
                </div>
                <div class=""stat-item"">
                    <div class=""stat-number"">10K+</div>
                    <div class=""stat-label"">{(isArabic ? "متدرب ناجح" : "Successful Trainees")}</div>
                </div>
                <div class=""stat-item"">
                    <div class=""stat-number"">95%</div>
                    <div class=""stat-label"">{(isArabic ? "نسبة الرضا" : "Satisfaction Rate")}</div>
                </div>
            </div>
            
            <div class=""recommendations"">
                <h3>{(isArabic ? "💡 نصائح للبدء" : "💡 Tips to Get Started")}</h3>
                <ul>
                    <li>{(isArabic ? 
                        "تصفح دوراتنا التدريبية واختر ما يناسب أهدافك المهنية" : 
                        "Browse our training courses and choose what fits your professional goals")}</li>
                    <li>{(isArabic ? 
                        "أكمل ملفك الشخصي لتحصل على توصيات مخصصة لك" : 
                        "Complete your profile to get personalized recommendations")}</li>
                    <li>{(isArabic ? 
                        "انضم إلى مجتمعنا من المتعلمين وتبادل الخبرات" : 
                        "Join our community of learners and exchange experiences")}</li>
                    <li>{(isArabic ? 
                        "تابع جديد الدورات والعروض الخاصة عبر البريد الإلكتروني" : 
                        "Follow new courses and special offers via email")}</li>
                    <li>{(isArabic ? 
                        "لا تتردد في التواصل مع فريق الدعم لأي استفسار" : 
                        "Don't hesitate to contact our support team for any inquiries")}</li>
                </ul>
            </div>
            
            <div class=""testimonial"">
                <p>""{(isArabic ? 
                    "تجربة رائعة! الدورات متميزة والمدربون محترفون. حقاً ساعدتني إرساء في تطوير مهاراتي المهنية." : 
                    "Amazing experience! Excellent courses and professional instructors. Ersa truly helped me develop my professional skills.")}""</p>
                <div class=""author"">- {(isArabic ? "أحمد الشمري، متدرب سابق" : "Ahmed Al-Shammari, Former Trainee")}</div>
            </div>
            
            <div class=""cta-section"">
                <h3 style=""color: #292561; margin-bottom: 20px;"">{(isArabic ? "ابدأ رحلتك التعليمية اليوم!" : "Start Your Learning Journey Today!")}</h3>
                <a href=""{_configuration["Frontend:BaseUrl"]}/{(isArabic ? "ar" : "en")}/courses"" class=""btn"">
                    {(isArabic ? "تصفح الدورات" : "Browse Courses")}
                </a>
                <a href=""{_configuration["Frontend:BaseUrl"]}/{(isArabic ? "ar" : "en")}/profile"" class=""btn btn-secondary"">
                    {(isArabic ? "إكمال الملف الشخصي" : "Complete Profile")}
                </a>
            </div>
            
            <div style=""margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%); border-radius: 10px; border: 2px solid #ffc107;"">
                <p style=""margin: 0 0 15px 0; font-weight: bold; color: #856404; font-size: 18px;"">
                    {(isArabic ? "🎁 عرض ترحيبي خاص!" : "🎁 Special Welcome Offer!")}
                </p>
                <p style=""margin: 0; color: #856404;"">
                    {(isArabic ? 
                        "احصل على خصم 10% على أول دورة تدريبية! استخدم الكود: WELCOME10" : 
                        "Get 10% off your first training course! Use code: WELCOME10")}
                </p>
            </div>
        </div>
        
        <div class=""footer"">
            <h3>{(isArabic ? "إرساء للتدريب والاستشارات" : "Ersa Training & Consulting")}</h3>
            <p>{(isArabic ? "نحن هنا لدعمك في كل خطوة من رحلتك التعليمية" : "We're here to support you every step of your learning journey")}</p>
            <p style=""margin-top: 15px;"">{(isArabic ? "للدعم الفني:" : "For Support:")} support@ersa-training.com</p>
            <p>{(isArabic ? "الهاتف:" : "Phone:")} +966 11 123 4567</p>
            <p>{(isArabic ? "الموقع الإلكتروني:" : "Website:")} www.ersa-training.com</p>
            
            <div class=""social-links"">
                <a href=""#"">📘</a>
                <a href=""#"">📷</a>
                <a href=""#"">🐦</a>
                <a href=""#"">📺</a>
            </div>
        </div>
    </div>
</body>
</html>";
    }

    private string GenerateVerificationEmailTemplate(User user, string verificationCode, bool isArabic)
    {
        var firstName = user.FullName.Split(' ')[0]; // Get first name
        var greeting = isArabic ? $"مرحباً {firstName}!" : $"Welcome {firstName}!";
        var tagline = isArabic ? "خطوة واحدة لإكمال تسجيلك" : "One step away from completing your registration";
        var dear = isArabic ? $"عزيزي/عزيزتي {user.FullName}،" : $"Dear {user.FullName},";
        var thankYou = isArabic ? "شكراً لك على التسجيل في منصة إرساء للتدريب! نحن متحمسون لوجودك معنا." : "Thank you for registering with Ersa Training platform! We're excited to have you with us.";
        var instructions = isArabic ? "لتفعيل حسابك والبدء في استكشاف دوراتنا التدريبية، يرجى استخدام رمز التفعيل أدناه:" : "To activate your account and start exploring our training courses, please use the verification code below:";
        var codeLabel = isArabic ? "رمز التفعيل الخاص بك" : "Your Verification Code";
        var expiryNotice = isArabic ? "هذا الرمز صالح لمدة 24 ساعة فقط" : "This code is valid for 24 hours only";
        var howToVerify = isArabic ? "كيفية التفعيل" : "How to Verify";
        var step1 = isArabic ? "انسخ رمز التفعيل المكون من 6 أرقام أعلاه" : "Copy the 6-digit verification code above";
        var step2 = isArabic ? "ارجع إلى صفحة التفعيل في المتصفح" : "Return to the verification page in your browser";
        var step3 = isArabic ? "الصق الرمز في الحقل المخصص" : "Paste the code in the designated field";
        var step4 = isArabic ? "اضغط على زر تفعيل" : "Click the Verify button";
        var securityTitle = isArabic ? "ملاحظة أمنية هامة:" : "Important Security Notice:";
        var securityNote = isArabic ? "لا تشارك رمز التفعيل هذا مع أي شخص. فريق إرساء للتدريب لن يطلب منك أبداً هذا الرمز." : "Do not share this verification code with anyone. Ersa Training team will never ask you for this code.";
        var tip = isArabic ? "نصيحة: بعد التفعيل، ستتمكن من الوصول إلى مئات الدورات التدريبية المتخصصة وبناء مسارك التعليمي الخاص." : "Tip: After verification, you'll have access to hundreds of specialized training courses and can build your own learning path.";
        var helpTitle = isArabic ? "هل تحتاج إلى مساعدة؟" : "Need Help?";
        var helpText1 = isArabic ? "إذا لم تقم بإنشاء هذا الحساب، يمكنك تجاهل هذا البريد الإلكتروني." : "If you didn't create this account, you can safely ignore this email.";
        var helpText2 = isArabic ? "إذا كنت تواجه مشكلة، لا تتردد في التواصل معنا:" : "If you're having trouble, don't hesitate to contact us:";
        var footerTitle = isArabic ? "إرساء للتدريب والاستشارات" : "Ersa Training & Consulting";
        var footerTagline = isArabic ? "منصتك المتكاملة للتدريب والتطوير المهني" : "Your comprehensive platform for training and professional development";
        var emailLabel = isArabic ? "البريد الإلكتروني:" : "Email:";
        var websiteLabel = isArabic ? "الموقع الإلكتروني:" : "Website:";

        return $@"
<!DOCTYPE html>
<html lang=""{(isArabic ? "ar" : "en")}"" dir=""{(isArabic ? "rtl" : "ltr")}"">
<head>
    <meta charset=""UTF-8"">
    <meta name=""viewport"" content=""width=device-width, initial-scale=1.0"">
    <title>{(isArabic ? "تفعيل الحساب" : "Email Verification")}</title>
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
            margin: 20px auto;
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
            opacity: 0.95;
        }}
        .icon-circle {{
            width: 80px;
            height: 80px;
            background-color: white;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 50px;
        }}
        .content {{
            padding: 40px 30px;
        }}
        .greeting {{
            font-size: 20px;
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
        .verification-box {{
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border: 3px solid #00AC96;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }}
        .verification-label {{
            font-size: 14px;
            color: #666;
            margin-bottom: 15px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        .verification-code {{
            font-size: 42px;
            font-weight: bold;
            color: #00AC96;
            letter-spacing: 8px;
            margin: 15px 0;
            font-family: 'Courier New', monospace;
            padding: 15px;
            background-color: white;
            border-radius: 8px;
            display: inline-block;
        }}
        .expiry-notice {{
            font-size: 13px;
            color: #ff6b6b;
            margin-top: 15px;
            font-weight: bold;
        }}
        .instructions {{
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 5px;
        }}
        .instructions h3 {{
            margin: 0 0 15px 0;
            color: #856404;
            font-size: 18px;
        }}
        .instructions ol {{
            margin: 10px 0;
            padding-{(isArabic ? "right" : "left")}: 20px;
        }}
        .instructions li {{
            margin-bottom: 10px;
            color: #856404;
        }}
        .security-notice {{
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            color: #721c24;
            padding: 15px;
            border-radius: 5px;
            margin: 20px 0;
            font-size: 14px;
        }}
        .security-notice strong {{
            display: block;
            margin-bottom: 5px;
        }}
        .help-section {{
            background-color: #e7f3ff;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }}
        .help-section h3 {{
            color: #292561;
            margin: 0 0 15px 0;
        }}
        .help-section p {{
            color: #666;
            margin: 5px 0;
        }}
        .help-section a {{
            color: #00AC96;
            text-decoration: none;
            font-weight: bold;
        }}
        .footer {{
            background-color: #292561;
            color: white;
            padding: 30px;
            text-align: center;
        }}
        .footer h3 {{
            margin: 0 0 10px 0;
            font-size: 18px;
        }}
        .footer p {{
            margin: 5px 0;
            opacity: 0.9;
            font-size: 14px;
        }}
    </style>
</head>
<body>
    <div class=""container"">
        <div class=""header"">
            <div class=""icon-circle"">
                ✉️
            </div>
            <h1>{greeting}</h1>
            <p>{tagline}</p>
        </div>
        
        <div class=""content"">
            <div class=""greeting"">
                {dear}
            </div>
            
            <div class=""message"">
                <p>{thankYou}</p>
                <p style=""margin-top: 15px;"">{instructions}</p>
            </div>
            
            <div class=""verification-box"">
                <div class=""verification-label"">
                    🔑 {codeLabel}
                </div>
                <div class=""verification-code"">
                    {verificationCode}
                </div>
                <div class=""expiry-notice"">
                    ⏰ {expiryNotice}
                </div>
            </div>
            
            <div class=""instructions"">
                <h3>📋 {howToVerify}</h3>
                <ol>
                    <li>{step1}</li>
                    <li>{step2}</li>
                    <li>{step3}</li>
                    <li>{step4}</li>
                </ol>
            </div>
            
            <div class=""security-notice"">
                <strong>🔒 {securityTitle}</strong>
                {securityNote}
            </div>
            
            <div style=""margin: 30px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; border-left: 4px solid #00AC96;"">
                <p style=""margin: 0; color: #666; font-size: 15px;"">
                    💡 <strong>{tip}</strong>
                </p>
            </div>
            
            <div class=""help-section"">
                <h3>{helpTitle}</h3>
                <p>{helpText1}</p>
                <p>{helpText2}</p>
                <p><a href=""mailto:support@ersa-training.com"">support@ersa-training.com</a></p>
            </div>
        </div>
        
        <div class=""footer"">
            <h3>{footerTitle}</h3>
            <p>{footerTagline}</p>
            <p style=""margin-top: 15px;"">{emailLabel} support@ersa-training.com</p>
            <p>{websiteLabel} www.ersa-training.com</p>
        </div>
    </div>
</body>
</html>";
    }

    private byte[] GenerateInvoicePdf(Order order, string invoiceNumber, bool isArabic)
    {
        var formattedDate = order.CreatedAt.ToString(isArabic ? "dd/MM/yyyy" : "MM/dd/yyyy");
        var formattedAmount = order.Amount.ToString("N2");
        var payment = order.Payments?.FirstOrDefault(p => p.Status == PaymentStatus.Completed);
        var paymentMethod = payment?.Provider ?? (isArabic ? "غير معروف" : "Unknown");
        var paymentDate = payment?.CapturedAt?.ToString(isArabic ? "dd/MM/yyyy HH:mm" : "MM/dd/yyyy hh:mm tt") ?? formattedDate;

        // Build courses list
        var coursesText = new System.Text.StringBuilder();
        foreach (var item in order.OrderItems)
        {
            var courseTitle = isArabic ? item.CourseTitleAr : item.CourseTitleEn;
            var priceFormatted = item.Price.ToString("N2");
            coursesText.AppendLine($"{courseTitle} - {item.Qty}x {priceFormatted} {item.Currency}");
        }

        var separator = new string('=', 60);
        var companyName = isArabic ? "إرساء للتدريب والاستشارات" : "ERSA TRAINING & CONSULTING";
        var invoiceTitle = isArabic ? "فاتورة" : "INVOICE";
        
        // Simple text-based invoice (can be enhanced with a PDF library like QuestPDF or SelectPdf)
        var invoiceContent = $@"{separator}
                {companyName}
                {invoiceTitle}
{separator}

{(isArabic ? "رقم الفاتورة" : "Invoice Number")}: {invoiceNumber}
{(isArabic ? "التاريخ" : "Date")}: {formattedDate}
{(isArabic ? "رقم الطلب" : "Order ID")}: {order.Id.ToString().Substring(0, 8).ToUpper()}

{separator}
           {(isArabic ? "معلومات العميل" : "CUSTOMER INFORMATION")}
{separator}

{(isArabic ? "الاسم" : "Name")}: {order.User.FullName}
{(isArabic ? "البريد الإلكتروني" : "Email")}: {order.User.Email}
{(isArabic ? "الهاتف" : "Phone")}: {order.User.Phone ?? "N/A"}

{separator}
           {(isArabic ? "تفاصيل الطلب" : "ORDER DETAILS")}
{separator}

{coursesText}
{separator}
           {(isArabic ? "معلومات الدفع" : "PAYMENT INFORMATION")}
{separator}

{(isArabic ? "طريقة الدفع" : "Payment Method")}: {paymentMethod}
{(isArabic ? "تاريخ الدفع" : "Payment Date")}: {paymentDate}
{(isArabic ? "الحالة" : "Status")}: {(isArabic ? "مدفوع" : "PAID")}

{separator}
{(isArabic ? "المبلغ الإجمالي" : "TOTAL AMOUNT")}: {formattedAmount} {order.Currency}
{separator}

{(isArabic ? "شكراً لك على اختيارك إرساء للتدريب!" : "Thank you for choosing Ersa Training!")}
{(isArabic ? "للدعم الفني: support@ersa-training.com" : "For support: support@ersa-training.com")}
{(isArabic ? "الموقع الإلكتروني: www.ersa-training.com" : "Website: www.ersa-training.com")}
";

        // Convert to bytes (simple text-based invoice)
        // Note: For production, use a proper PDF library like QuestPDF, SelectPdf, or iTextSharp for true PDF format
        var pdfBytes = System.Text.Encoding.UTF8.GetBytes(invoiceContent);
        
        return pdfBytes;
    }
}

public class SendGridEvent
{
    public string Event { get; set; } = string.Empty;
    public string MessageId { get; set; } = string.Empty;
    public long Timestamp { get; set; }
    public string Email { get; set; } = string.Empty;
}