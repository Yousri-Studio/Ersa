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
}

public class SendGridEvent
{
    public string Event { get; set; } = string.Empty;
    public string MessageId { get; set; } = string.Empty;
    public long Timestamp { get; set; }
    public string Email { get; set; } = string.Empty;
}