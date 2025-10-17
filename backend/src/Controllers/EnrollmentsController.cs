using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using System.Security.Claims;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/my/enrollments")]
[Authorize]
public class EnrollmentsController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<EnrollmentsController> _logger;

    public EnrollmentsController(ErsaTrainingDbContext context, ILogger<EnrollmentsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
        {
            return userId;
        }
        return null;
    }

    /// <summary>
    /// Get all enrollments (paid courses) for the current user
    /// </summary>
    /// <returns>List of user's enrollments</returns>
    [HttpGet]
    public async Task<ActionResult<List<EnrollmentDto>>> GetMyEnrollments()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            _logger.LogInformation("Getting enrollments for user {UserId}", userId);

            // Get enrollments with paid status (Paid, Notified, or Completed)
            var enrollments = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Category)
                .Include(e => e.Order)
                .Where(e => e.UserId == userId.Value && 
                           (e.Status == EnrollmentStatus.Paid || 
                            e.Status == EnrollmentStatus.Notified || 
                            e.Status == EnrollmentStatus.Completed))
                .OrderByDescending(e => e.EnrolledAt)
                .ToListAsync();

            var enrollmentDtos = enrollments.Select(e => new EnrollmentDto
            {
                Id = e.Id,
                CourseId = e.CourseId,
                CourseSlug = e.Course.Slug,
                CourseTitleEn = e.Course.TitleEn,
                CourseTitleAr = e.Course.TitleAr,
                CourseImage = e.Course.Photo != null ? Convert.ToBase64String(e.Course.Photo) : null,
                OrderId = e.OrderId ?? Guid.Empty,
                EnrolledAt = e.EnrolledAt,
                Status = MapEnrollmentStatus(e.Status),
                Progress = CalculateProgress(e), // You can implement progress tracking later
                Category = e.Course.Category?.TitleEn ?? e.Course.Category?.TitleAr
            }).ToList();

            _logger.LogInformation("Found {Count} enrollments for user {UserId}", enrollmentDtos.Count, userId);

            return Ok(enrollmentDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user enrollments");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get a specific enrollment by ID
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EnrollmentDto>> GetEnrollment(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized(new { error = "User not authenticated" });
            }

            var enrollment = await _context.Enrollments
                .Include(e => e.Course)
                    .ThenInclude(c => c.Category)
                .Include(e => e.Order)
                .FirstOrDefaultAsync(e => e.Id == id && e.UserId == userId.Value);

            if (enrollment == null)
            {
                return NotFound(new { error = "Enrollment not found" });
            }

            var enrollmentDto = new EnrollmentDto
            {
                Id = enrollment.Id,
                CourseId = enrollment.CourseId,
                CourseTitleEn = enrollment.Course.TitleEn,
                CourseTitleAr = enrollment.Course.TitleAr,
                CourseImage = enrollment.Course.Photo != null ? Convert.ToBase64String(enrollment.Course.Photo) : null,
                OrderId = enrollment.OrderId ?? Guid.Empty,
                EnrolledAt = enrollment.EnrolledAt,
                Status = MapEnrollmentStatus(enrollment.Status),
                Progress = CalculateProgress(enrollment),
                Category = enrollment.Course.Category?.TitleEn ?? enrollment.Course.Category?.TitleAr
            };

            return Ok(enrollmentDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting enrollment {EnrollmentId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private string MapEnrollmentStatus(EnrollmentStatus status)
    {
        return status switch
        {
            EnrollmentStatus.Pending => "pending",
            EnrollmentStatus.Paid => "active",
            EnrollmentStatus.Notified => "active",
            EnrollmentStatus.Completed => "completed",
            EnrollmentStatus.Cancelled => "cancelled",
            _ => "active"
        };
    }

    private int? CalculateProgress(Enrollment enrollment)
    {
        // TODO: Implement actual progress tracking
        // For now, return null or a default value
        // You can implement this based on:
        // - Videos watched
        // - Lessons completed
        // - Assignments submitted
        // - etc.
        
        if (enrollment.Status == EnrollmentStatus.Completed)
        {
            return 100;
        }
        
        return null; // Will not show progress bar if null
    }
}

