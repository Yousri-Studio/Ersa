using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public class EmailReminderService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<EmailReminderService> _logger;
    private readonly TimeSpan _interval = TimeSpan.FromMinutes(10);

    public EmailReminderService(IServiceProvider serviceProvider, ILogger<EmailReminderService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Email Reminder Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessSessionRemindersAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing session reminders");
            }

            await Task.Delay(_interval, stoppingToken);
        }

        _logger.LogInformation("Email Reminder Service stopped");
    }

    private async Task ProcessSessionRemindersAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var emailService = scope.ServiceProvider.GetRequiredService<IEmailService>();

        var now = DateTime.UtcNow;
        var reminderWindowStart = now.AddMinutes(50);
        var reminderWindowEnd = now.AddMinutes(70);

        // Find sessions starting in 50-70 minutes
        var upcomingSessions = await context.Sessions
            .Where(s => s.StartAt >= reminderWindowStart && s.StartAt <= reminderWindowEnd)
            .ToListAsync(cancellationToken);

        _logger.LogInformation("Found {Count} sessions starting in 50-70 minutes", upcomingSessions.Count);

        foreach (var session in upcomingSessions)
        {
            // Find enrollments for this session that need reminders
            var enrollments = await context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .Where(e => e.SessionId == session.Id && 
                           (e.Status == EnrollmentStatus.Paid || e.Status == EnrollmentStatus.Notified))
                .ToListAsync(cancellationToken);

            foreach (var enrollment in enrollments)
            {
                try
                {
                    // Check if we've already sent a 1-hour reminder for this enrollment
                    var reminderAlreadySent = await context.EmailLogs
                        .AnyAsync(el => el.EnrollmentId == enrollment.Id && 
                                       el.TemplateKey == "LiveReminder1h" &&
                                       el.Status == EmailStatus.Sent,
                                 cancellationToken);

                    if (reminderAlreadySent)
                    {
                        _logger.LogDebug("Reminder already sent for enrollment {EnrollmentId}", enrollment.Id);
                        continue;
                    }

                    // Calculate hours before start (should be close to 1)
                    var hoursBeforeStart = (int)Math.Round((session.StartAt - now).TotalHours);
                    
                    var locale = enrollment.User.Locale ?? "en";
                    var sent = await emailService.SendLiveReminderEmailAsync(enrollment, locale, hoursBeforeStart);

                    if (sent)
                    {
                        _logger.LogInformation("Sent 1-hour reminder for enrollment {EnrollmentId}, session {SessionId}", 
                            enrollment.Id, session.Id);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to send reminder for enrollment {EnrollmentId}", enrollment.Id);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error sending reminder for enrollment {EnrollmentId}", enrollment.Id);
                }
            }
        }
    }
}

