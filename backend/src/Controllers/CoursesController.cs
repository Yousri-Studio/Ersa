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
        [FromQuery] bool activeOnly = true,
        [FromQuery] string? query = null,
        [FromQuery] CourseCategory? category = null)
    {
        try
        {
            var coursesQuery = _context.Courses.AsQueryable();

            if (activeOnly)
            {
                coursesQuery = coursesQuery.Where(c => c.IsActive);
            }

            if (type.HasValue)
            {
                coursesQuery = coursesQuery.Where(c => c.Type == type.Value);
            }

            if (category.HasValue)
            {
                var searchCategory=(CourseCategory)category.Value;
                coursesQuery = coursesQuery.Where(c => c.Category == searchCategory);
            }

            if (!string.IsNullOrEmpty(query))
            {
                var searchTerm = query.ToLower();
                coursesQuery = coursesQuery.Where(c => 
                    c.TitleAr.ToLower().Contains(searchTerm) ||
                    c.TitleEn.ToLower().Contains(searchTerm) ||
                    (c.DescriptionAr != null && c.DescriptionAr.ToLower().Contains(searchTerm)) ||
                    (c.DescriptionEn != null && c.DescriptionEn.ToLower().Contains(searchTerm)));
            }

            var courses = await coursesQuery
                .OrderBy(c => c.TitleEn)
                .Select(c => new CourseListDto
                {
                    Id = c.Id,
                    Slug = c.Slug,
                    Title = new LocalizedText { Ar = c.TitleAr, En = c.TitleEn },
                    Summary = new LocalizedText { Ar = c.SummaryAr ?? "", En = c.SummaryEn ?? "" },
                    Description = new LocalizedText { Ar = c.DescriptionAr ?? "", En = c.DescriptionEn ?? "" },
                    Price = c.Price,
                    Currency = c.Currency,
                    Type = c.Type,
                    Level = c.Level,
                    Category = c.Category,
                    VideoUrl = c.VideoUrl,
                    Duration = c.Duration,
                    InstructorName = c.InstructorName,
                    Photo = c.Photo,
                    Tags = c.Tags,
                    InstructorsBio = new LocalizedText { Ar = c.InstructorsBioAr ?? "", En = c.InstructorsBioEn ?? "" },
                    IsActive = c.IsActive,
                    IsFeatured = c.IsFeatured,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
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
                Summary = new LocalizedText { Ar = course.SummaryAr ?? "", En = course.SummaryEn ?? "" },
                Description = new LocalizedText { Ar = course.DescriptionAr ?? "", En = course.DescriptionEn ?? "" },
                Price = course.Price,
                Currency = course.Currency,
                Type = course.Type,
                Level = course.Level,
                Category = course.Category,
                VideoUrl = course.VideoUrl,
                Duration = course.Duration,
                InstructorName = course.InstructorName,
                Photo = course.Photo,
                Tags = course.Tags,
                InstructorsBio = new LocalizedText { Ar = course.InstructorsBioAr ?? "", En = course.InstructorsBioEn ?? "" },
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
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
                    Summary = new LocalizedText { Ar = c.SummaryAr ?? "", En = c.SummaryEn ?? "" },
                    Description = new LocalizedText { Ar = c.DescriptionAr ?? "", En = c.DescriptionEn ?? "" },
                    Price = c.Price,
                    Currency = c.Currency,
                    Type = c.Type,
                    Level = c.Level,
                    Category = c.Category,
                    VideoUrl = c.VideoUrl,
                    Duration = c.Duration,
                    InstructorName = c.InstructorName,
                    Photo = c.Photo,
                    Tags = c.Tags,
                    InstructorsBio = new LocalizedText { Ar = c.InstructorsBioAr ?? "", En = c.InstructorsBioEn ?? "" },
                    IsActive = c.IsActive,
                    IsFeatured = c.IsFeatured,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
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

    [HttpPost]
    public async Task<ActionResult<CourseDetailDto>> CreateCourse([FromBody] CreateCourseRequest request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Check if slug already exists
            var existingCourse = await _context.Courses.FirstOrDefaultAsync(c => c.Slug == request.Slug);
            if (existingCourse != null)
            {
                return BadRequest(new { error = "A course with this slug already exists" });
            }

            // Validate price
            if (request.Price <= 0)
            {
                return BadRequest(new { error = "Price must be greater than 0" });
            }
            var course = new Course
            {
                Id = Guid.NewGuid(),
                Slug = request.Slug,
                Price = request.Price,
                Currency = request.Currency,
                Type = request.Type,
                Level = request.Level,
                Category = request.Category,
                VideoUrl = request.VideoUrl,
                Duration = request.Duration,
                InstructorName = request.InstructorName,
                TitleAr = request.TitleAr,
                TitleEn = request.TitleEn,
                SummaryAr = request.SummaryAr,
                SummaryEn = request.SummaryEn,
                DescriptionAr = request.DescriptionAr,
                DescriptionEn = request.DescriptionEn,
                Photo = request.Photo,
                Tags = request.Tags,
                InstructorsBioAr = request.InstructorsBioAr,
                InstructorsBioEn = request.InstructorsBioEn,
                IsActive = true,
                IsFeatured = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            var courseDto = new CourseDetailDto
            {
                Id = course.Id,
                Slug = course.Slug,
                Title = new LocalizedText { Ar = course.TitleAr, En = course.TitleEn },
                Summary = new LocalizedText { Ar = course.SummaryAr ?? "", En = course.SummaryEn ?? "" },
                Description = new LocalizedText { Ar = course.DescriptionAr ?? "", En = course.DescriptionEn ?? "" },
                Price = course.Price,
                Currency = course.Currency,
                Type = course.Type,
                Level = course.Level,
                Category = course.Category,
                VideoUrl = course.VideoUrl,
                Duration = course.Duration,
                InstructorName = course.InstructorName,
                Photo = course.Photo,
                Tags = course.Tags,
                InstructorsBio = new LocalizedText { Ar = course.InstructorsBioAr ?? "", En = course.InstructorsBioEn ?? "" },
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                Sessions = new List<SessionDto>(),
                Attachments = new List<AttachmentDto>()
            };

            return CreatedAtAction(nameof(GetCourseBySlug), new { slug = course.Slug }, courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating course");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<CourseDetailDto>> UpdateCourse(Guid id, [FromBody] UpdateCourseRequest request)
    {
        try
        {
            // Validate request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var course = await _context.Courses.FindAsync(id);
            if (course == null)
            {
                return NotFound(new { error = "Course not found" });
            }

            course.Slug = request.Slug;
            course.Price = request.Price;
            course.Currency = request.Currency;
            course.Type = request.Type;
            course.Level = request.Level;
            course.Category = request.Category;
            course.VideoUrl = request.VideoUrl;
            course.Duration = request.Duration;
            course.InstructorName = request.InstructorName;
            course.TitleAr = request.TitleAr;
            course.TitleEn = request.TitleEn;
            course.SummaryAr = request.SummaryAr;
            course.SummaryEn = request.SummaryEn;
            course.DescriptionAr = request.DescriptionAr;
            course.DescriptionEn = request.DescriptionEn;
            course.Photo = request.Photo;
            course.Tags = request.Tags;
            course.InstructorsBioAr = request.InstructorsBioAr;
            course.InstructorsBioEn = request.InstructorsBioEn;
            course.IsActive = request.IsActive;
            course.IsFeatured = request.IsFeatured;
            course.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var courseDto = new CourseDetailDto
            {
                Id = course.Id,
                Slug = course.Slug,
                Title = new LocalizedText { Ar = course.TitleAr, En = course.TitleEn },
                Summary = new LocalizedText { Ar = course.SummaryAr ?? "", En = course.SummaryEn ?? "" },
                Description = new LocalizedText { Ar = course.DescriptionAr ?? "", En = course.DescriptionEn ?? "" },
                Price = course.Price,
                Currency = course.Currency,
                Type = course.Type,
                Level = course.Level,
                Category = course.Category,
                VideoUrl = course.VideoUrl,
                Duration = course.Duration,
                InstructorName = course.InstructorName,
                Photo = course.Photo,
                Tags = course.Tags,
                InstructorsBio = new LocalizedText { Ar = course.InstructorsBioAr ?? "", En = course.InstructorsBioEn ?? "" },
                IsActive = course.IsActive,
                IsFeatured = course.IsFeatured,
                CreatedAt = course.CreatedAt,
                UpdatedAt = course.UpdatedAt,
                Sessions = new List<SessionDto>(),
                Attachments = new List<AttachmentDto>()
            };

            return Ok(courseDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating course {CourseId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}