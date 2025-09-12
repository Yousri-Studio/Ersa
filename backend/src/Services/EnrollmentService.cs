using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using System.Security.Cryptography;
using System.Text;

namespace ErsaTraining.API.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly ErsaTrainingDbContext _context;
    private readonly IEmailService _emailService;
    private readonly ILogger<EnrollmentService> _logger;

    public EnrollmentService(
        ErsaTrainingDbContext context,
        IEmailService emailService,
        ILogger<EnrollmentService> logger)
    {
        _context = context;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<List<Enrollment>> CreateEnrollmentsFromOrderAsync(Order order)
    {
        try
        {
            var enrollments = new List<Enrollment>();

            // The order should already have its items loaded.
            if (order.OrderItems == null || !order.OrderItems.Any())
            {
                _logger.LogWarning("Order {OrderId} has no items to enroll.", order.Id);
                return enrollments; // Return empty list
            }

            foreach (var item in order.OrderItems)
            {
                var enrollment = new Enrollment
                {
                    Id = Guid.NewGuid(),
                    UserId = order.UserId,
                    CourseId = item.CourseId,
                    SessionId = item.SessionId,
                    OrderId = order.Id,
                    Status = EnrollmentStatus.Paid,
                    EnrolledAt = DateTime.UtcNow
                };

                _context.Enrollments.Add(enrollment);
                enrollments.Add(enrollment);
            }

            await _context.SaveChangesAsync();

            // Send welcome emails and handle post-enrollment tasks
            foreach (var enrollment in enrollments)
            {
                await PostEnrollmentProcessingAsync(enrollment);
            }

            return enrollments;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating enrollments from order {OrderId}", order.Id);
            throw;
        }
    }

    public async Task<List<Enrollment>> GetUserEnrollmentsAsync(Guid userId)
    {
        return await _context.Enrollments
            .Include(e => e.Course)
            .Include(e => e.Session)
            .Include(e => e.SecureLinks)
                .ThenInclude(sl => sl.Attachment)
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();
    }

    public async Task<bool> SendLiveDetailsAsync(Guid enrollmentId, string locale)
    {
        try
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .Include(e => e.Session)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);

            if (enrollment == null || enrollment.Course.Type != CourseType.Live)
            {
                return false;
            }

            var success = await _emailService.SendLiveDetailsEmailAsync(enrollment, locale);
            
            if (success)
            {
                enrollment.Status = EnrollmentStatus.Notified;
                await _context.SaveChangesAsync();

                // Schedule reminders
                await ScheduleLiveRemindersAsync(enrollment);
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending live details for enrollment {EnrollmentId}", enrollmentId);
            return false;
        }
    }

    public async Task<bool> DeliverMaterialsAsync(Guid enrollmentId, List<Guid> attachmentIds)
    {
        try
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.User)
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);

            if (enrollment == null) return false;

            var attachments = await _context.Attachments
                .Where(a => attachmentIds.Contains(a.Id) && a.CourseId == enrollment.CourseId && !a.IsRevoked)
                .ToListAsync();

            if (!attachments.Any()) return false;

            var secureLinks = await CreateSecureLinksAsync(enrollment, attachments);
            var success = await _emailService.SendMaterialsDeliveryEmailAsync(enrollment, secureLinks, enrollment.User.Locale);

            if (success)
            {
                enrollment.Status = EnrollmentStatus.Notified;
                await _context.SaveChangesAsync();
            }

            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error delivering materials for enrollment {EnrollmentId}", enrollmentId);
            return false;
        }
    }

    public async Task<List<SecureLink>> CreateSecureLinksAsync(Enrollment enrollment, List<Attachment> attachments)
    {
        var secureLinks = new List<SecureLink>();

        foreach (var attachment in attachments)
        {
            // Check if secure link already exists
            var existingLink = await _context.SecureLinks
                .FirstOrDefaultAsync(sl => sl.EnrollmentId == enrollment.Id && sl.AttachmentId == attachment.Id);

            if (existingLink != null && !existingLink.IsRevoked)
            {
                secureLinks.Add(existingLink);
                continue;
            }

            var secureLink = new SecureLink
            {
                Id = Guid.NewGuid(),
                EnrollmentId = enrollment.Id,
                AttachmentId = attachment.Id,
                Token = GenerateSecureToken(),
                IsRevoked = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.SecureLinks.Add(secureLink);
            secureLinks.Add(secureLink);
        }

        await _context.SaveChangesAsync();
        return secureLinks;
    }

    public async Task<bool> RevokeSecureLinkAsync(Guid secureLinkId)
    {
        try
        {
            var secureLink = await _context.SecureLinks.FindAsync(secureLinkId);
            if (secureLink == null) return false;

            secureLink.IsRevoked = true;
            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking secure link {SecureLinkId}", secureLinkId);
            return false;
        }
    }

    public Task ScheduleLiveRemindersAsync(Enrollment enrollment)
    {
        try
        {
            if (enrollment.Session == null || enrollment.Course.Type != CourseType.Live)
                return Task.CompletedTask;

            // In a real implementation, you would use a background job scheduler like Hangfire
            // For now, we'll just log the scheduling
            _logger.LogInformation("Scheduling reminders for enrollment {EnrollmentId} - Session starts at {StartTime}", 
                enrollment.Id, enrollment.Session.StartAt);

            // TODO: Implement with Hangfire or similar background job processor
            // Schedule 24-hour reminder
            // Schedule 1-hour reminder
            
            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error scheduling reminders for enrollment {EnrollmentId}", enrollment.Id);
            return Task.CompletedTask;
        }
    }

    private async Task PostEnrollmentProcessingAsync(Enrollment enrollment)
    {
        try
        {
            var course = await _context.Courses.FindAsync(enrollment.CourseId);
            var user = await _context.Users.FindAsync(enrollment.UserId);
            
            if (course == null || user == null) return;

            if (course.Type == CourseType.Live)
            {
                // For live courses, send details immediately and schedule reminders
                await SendLiveDetailsAsync(enrollment.Id, user.Locale);
            }
            else if (course.Type == CourseType.PDF)
            {
                // For PDF courses, automatically deliver all materials
                var attachments = await _context.Attachments
                    .Where(a => a.CourseId == course.Id && !a.IsRevoked)
                    .Select(a => a.Id)
                    .ToListAsync();

                if (attachments.Any())
                {
                    await DeliverMaterialsAsync(enrollment.Id, attachments);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in post-enrollment processing for enrollment {EnrollmentId}", enrollment.Id);
        }
    }


    private static string GenerateSecureToken()
    {
        using var rng = RandomNumberGenerator.Create();
        var bytes = new byte[32];
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes).Replace("+", "-").Replace("/", "_").Replace("=", "");
    }
}