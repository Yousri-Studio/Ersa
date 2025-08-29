using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<CoursesController> _logger;

    public CoursesController(ErsaTrainingDbContext context, ILogger<CoursesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseListDto>>> GetCourses(
        [FromQuery] CourseType? type = null,
        [FromQuery] bool activeOnly = true)
    {
        try
        {
            var query = _context.Courses.AsQueryable();

            if (activeOnly)
            {
                query = query.Where(c => c.IsActive);
            }

            if (type.HasValue)
            {
                query = query.Where(c => c.Type == type.Value);
            }

            var courses = await query
                .OrderBy(c => c.TitleEn)
                .Select(c => new CourseListDto
                {
                    Id = c.Id,
                    Slug = c.Slug,
                    Title = new LocalizedText { Ar = c.TitleAr, En = c.TitleEn },
                    Summary = new LocalizedText { Ar = c.DescriptionAr ?? "", En = c.DescriptionEn ?? "" },
                    Price = c.Price,
                    Currency = c.Currency,
                    Type = c.Type,
                    IsActive = c.IsActive,
                    IsFeatured = c.IsFeatured
                })
                .ToListAsync();

            return Ok(courses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving courses");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{slug}")]
    public async Task<ActionResult<CourseDetailDto>> GetCourseBySlug(string slug)
    {
        try
        {
            var course = await _context.Courses
                .Include(c => c.Sessions.Where(s => s.StartAt > DateTime.UtcNow))
                .Include(c => c.Attachments.Where(a => !a.IsRevoked))
                .FirstOrDefaultAsync(c => c.Slug == slug && c.IsActive);

            if (course == null)
            {
                return NotFound(new { error = "Course not found" });
            }

            var courseDto = new CourseDetailDto
            {
                Id = course.Id,
                Slug = course.Slug,
                Title = new LocalizedText { Ar = course.TitleAr, En = course.TitleEn },
                Summary = new LocalizedText { Ar = course.DescriptionAr ?? "", En = course.DescriptionEn ?? "" },
                Price = course.Price,
                Currency = course.Currency,
                Type = course.Type,
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                Sessions = course.Sessions
                    .OrderBy(s => s.StartAt)
                    .Select(s => new SessionDto
                    {
                        Id = s.Id,
                        StartAt = s.StartAt,
                        EndAt = s.EndAt,
                        Capacity = s.Capacity,
                        AvailableSpots = s.Capacity - _context.Enrollments.Count(e => e.SessionId == s.Id && e.Status == EnrollmentStatus.Paid)
                    })
                    .ToList(),
                Attachments = course.Attachments
                    .Select(a => new AttachmentDto
                    {
                        Id = a.Id,
                        FileName = a.FileName,
                        Type = a.Type
                    })
                    .ToList()
            };

            return Ok(courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course by slug: {Slug}", slug);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("featured")]
    public async Task<ActionResult<List<CourseListDto>>> GetFeaturedCourses()
    {
        try
        {
            var featuredCourses = await _context.Courses
                .Where(c => c.IsActive && c.IsFeatured)
                .OrderBy(c => c.TitleEn)
                .Select(c => new CourseListDto
                {
                    Id = c.Id,
                    Slug = c.Slug,
                    Title = new LocalizedText { Ar = c.TitleAr, En = c.TitleEn },
                    Summary = new LocalizedText { Ar = c.DescriptionAr ?? "", En = c.DescriptionEn ?? "" },
                    Price = c.Price,
                    Currency = c.Currency,
                    Type = c.Type,
                    IsActive = c.IsActive,
                    IsFeatured = c.IsFeatured
                })
                .ToListAsync();

            return Ok(featuredCourses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving featured courses");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id:guid}/sessions")]
    public async Task<ActionResult<List<SessionDto>>> GetCourseSessions(Guid id)
    {
        try
        {
            var course = await _context.Courses.FindAsync(id);
            if (course == null || !course.IsActive)
            {
                return NotFound(new { error = "Course not found" });
            }

            var sessions = await _context.Sessions
                .Where(s => s.CourseId == id && s.StartAt > DateTime.UtcNow)
                .OrderBy(s => s.StartAt)
                .Select(s => new SessionDto
                {
                    Id = s.Id,
                    StartAt = s.StartAt,
                    EndAt = s.EndAt,
                    Capacity = s.Capacity,
                    AvailableSpots = s.Capacity - _context.Enrollments.Count(e => e.SessionId == s.Id && e.Status == EnrollmentStatus.Paid)
                })
                .ToListAsync();

            return Ok(sessions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving sessions for course {CourseId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}