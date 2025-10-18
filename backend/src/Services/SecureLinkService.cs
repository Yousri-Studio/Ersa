using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using System.Security.Cryptography;

namespace ErsaTraining.API.Services;

public class SecureLinkService : ISecureLinkService
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<SecureLinkService> _logger;

    public SecureLinkService(ErsaTrainingDbContext context, ILogger<SecureLinkService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<SecureLink>> CreateSecureLinksAsync(Guid enrollmentId, List<Guid> attachmentIds)
    {
        try
        {
            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                .FirstOrDefaultAsync(e => e.Id == enrollmentId);

            if (enrollment == null)
            {
                throw new InvalidOperationException("Enrollment not found");
            }

            // Validate that all attachments belong to the course
            var attachments = await _context.Attachments
                .Where(a => attachmentIds.Contains(a.Id) && a.CourseId == enrollment.CourseId)
                .ToListAsync();

            if (attachments.Count != attachmentIds.Count)
            {
                throw new InvalidOperationException("One or more attachments do not belong to this course");
            }

            var secureLinks = new List<SecureLink>();

            foreach (var attachment in attachments)
            {
                // Check if a link already exists for this enrollment and attachment
                var existingLink = await _context.SecureLinks
                    .FirstOrDefaultAsync(sl => sl.EnrollmentId == enrollmentId && 
                                              sl.AttachmentId == attachment.Id &&
                                              !sl.IsRevoked);

                if (existingLink != null)
                {
                    secureLinks.Add(existingLink);
                    continue;
                }

                // Generate a cryptographically secure token
                var token = GenerateSecureToken();

                var secureLink = new SecureLink
                {
                    Id = Guid.NewGuid(),
                    EnrollmentId = enrollmentId,
                    AttachmentId = attachment.Id,
                    Token = token,
                    IsRevoked = false,
                    CreatedAt = DateTime.UtcNow,
                    DownloadCount = 0
                };

                _context.SecureLinks.Add(secureLink);
                secureLinks.Add(secureLink);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation("Created {Count} secure links for enrollment {EnrollmentId}", secureLinks.Count, enrollmentId);

            return secureLinks;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating secure links for enrollment {EnrollmentId}", enrollmentId);
            throw;
        }
    }

    public async Task<SecureLink?> GetSecureLinkByTokenAsync(string token)
    {
        try
        {
            return await _context.SecureLinks
                .Include(sl => sl.Enrollment)
                    .ThenInclude(e => e.User)
                .Include(sl => sl.Attachment)
                .FirstOrDefaultAsync(sl => sl.Token == token && !sl.IsRevoked);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving secure link by token");
            return null;
        }
    }

    public async Task<bool> RevokeSecureLinkAsync(Guid linkId)
    {
        try
        {
            var link = await _context.SecureLinks.FindAsync(linkId);
            if (link == null)
            {
                return false;
            }

            link.IsRevoked = true;
            await _context.SaveChangesAsync();
            
            _logger.LogInformation("Revoked secure link {LinkId}", linkId);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error revoking secure link {LinkId}", linkId);
            return false;
        }
    }

    private string GenerateSecureToken()
    {
        // Generate a cryptographically secure random token
        var randomBytes = new byte[32];
        using (var rng = RandomNumberGenerator.Create())
        {
            rng.GetBytes(randomBytes);
        }
        
        // Convert to base64 URL-safe string
        return Convert.ToBase64String(randomBytes)
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");
    }
}

