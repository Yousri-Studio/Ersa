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
        [FromQuery] Guid? categoryId = null,
        [FromQuery] Guid? subCategoryId = null)
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

            if (categoryId.HasValue)
            {
                coursesQuery = coursesQuery.Where(c => c.CategoryId == categoryId.Value);
            }

            if (subCategoryId.HasValue)
            {
                coursesQuery = coursesQuery.Where(c => c.CourseSubCategoryMappings.Any(m => m.SubCategoryId == subCategoryId.Value));
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
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .Include(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
                .AsSplitQuery()
                .OrderBy(c => c.TitleEn)
                .ToListAsync();

            var courseDtos = courses.Select(c => new CourseListDto
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
                CategoryId = c.CategoryId,
                Category = c.Category != null ? new CourseCategoryDto
                {
                    Id = c.Category.Id,
                    TitleAr = c.Category.TitleAr,
                    TitleEn = c.Category.TitleEn,
                    DisplayOrder = c.Category.DisplayOrder,
                    IsActive = c.Category.IsActive,
                    CreatedAt = c.Category.CreatedAt,
                    UpdatedAt = c.Category.UpdatedAt
                } : null,
                SubCategories = c.CourseSubCategoryMappings
                    .Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    })
                    .ToList(),
                VideoUrl = c.VideoUrl,
                Duration = new LocalizedText { Ar = c.DurationAr ?? "", En = c.DurationEn ?? "" },
                From = c.From,
                To = c.To,
                SessionsNotes = new LocalizedText { Ar = c.SessionsNotesAr ?? "", En = c.SessionsNotesEn ?? "" },
                InstructorName = new LocalizedText { Ar = c.InstructorNameAr, En = c.InstructorNameEn },
                Instructors = c.CourseInstructors.Select(ci => new InstructorDto
                {
                    Id = ci.Instructor.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorNameAr, 
                        En = ci.Instructor.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorBioAr ?? "", 
                        En = ci.Instructor.InstructorBioEn ?? "" 
                    },
                    CreatedAt = ci.Instructor.CreatedAt,
                    UpdatedAt = ci.Instructor.UpdatedAt
                }).ToList(),
                Photo = c.Photo,
                Tags = c.Tags,
                InstructorsBio = new LocalizedText { Ar = c.InstructorsBioAr ?? "", En = c.InstructorsBioEn ?? "" },
                CourseTopics = new LocalizedText { Ar = c.CourseTopicsAr ?? "", En = c.CourseTopicsEn ?? "" },
                IsActive = c.IsActive,
                IsFeatured = c.IsFeatured,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();

            return Ok(courseDtos);
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
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .Include(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
                .Include(c => c.Sessions.Where(s => s.StartAt > DateTime.UtcNow))
                .Include(c => c.Attachments.Where(a => !a.IsRevoked))
                .AsSplitQuery()
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
                CategoryId = course.CategoryId,
                Category = course.Category != null ? new CourseCategoryDto
                {
                    Id = course.Category.Id,
                    TitleAr = course.Category.TitleAr,
                    TitleEn = course.Category.TitleEn,
                    DisplayOrder = course.Category.DisplayOrder,
                    IsActive = course.Category.IsActive,
                    CreatedAt = course.Category.CreatedAt,
                    UpdatedAt = course.Category.UpdatedAt
                } : null,
                SubCategories = course.CourseSubCategoryMappings
                    .Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    })
                    .ToList(),
                VideoUrl = course.VideoUrl,
                Duration = new LocalizedText { Ar = course.DurationAr ?? "", En = course.DurationEn ?? "" },
                From = course.From,
                To = course.To,
                SessionsNotes = new LocalizedText { Ar = course.SessionsNotesAr ?? "", En = course.SessionsNotesEn ?? "" },
                InstructorName = new LocalizedText { Ar = course.InstructorNameAr, En = course.InstructorNameEn },
                Instructors = course.CourseInstructors.Select(ci => new InstructorDto
                {
                    Id = ci.Instructor.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorNameAr, 
                        En = ci.Instructor.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorBioAr ?? "", 
                        En = ci.Instructor.InstructorBioEn ?? "" 
                    },
                    CreatedAt = ci.Instructor.CreatedAt,
                    UpdatedAt = ci.Instructor.UpdatedAt
                }).ToList(),
                Photo = course.Photo,
                Tags = course.Tags,
                InstructorsBio = new LocalizedText { Ar = course.InstructorsBioAr ?? "", En = course.InstructorsBioEn ?? "" },
                CourseTopics = new LocalizedText { Ar = course.CourseTopicsAr ?? "", En = course.CourseTopicsEn ?? "" },
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
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .Include(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
                .AsSplitQuery()
                .Where(c => c.IsActive && c.IsFeatured)
                .OrderBy(c => c.TitleEn)
                .ToListAsync();

            var courseDtos = featuredCourses.Select(c => new CourseListDto
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
                CategoryId = c.CategoryId,
                Category = c.Category != null ? new CourseCategoryDto
                {
                    Id = c.Category.Id,
                    TitleAr = c.Category.TitleAr,
                    TitleEn = c.Category.TitleEn,
                    DisplayOrder = c.Category.DisplayOrder,
                    IsActive = c.Category.IsActive,
                    CreatedAt = c.Category.CreatedAt,
                    UpdatedAt = c.Category.UpdatedAt
                } : null,
                SubCategories = c.CourseSubCategoryMappings
                    .Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    })
                    .ToList(),
                VideoUrl = c.VideoUrl,
                Duration = new LocalizedText { Ar = c.DurationAr ?? "", En = c.DurationEn ?? "" },
                From = c.From,
                To = c.To,
                SessionsNotes = new LocalizedText { Ar = c.SessionsNotesAr ?? "", En = c.SessionsNotesEn ?? "" },
                InstructorName = new LocalizedText { Ar = c.InstructorNameAr, En = c.InstructorNameEn },
                Instructors = c.CourseInstructors.Select(ci => new InstructorDto
                {
                    Id = ci.Instructor.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorNameAr, 
                        En = ci.Instructor.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorBioAr ?? "", 
                        En = ci.Instructor.InstructorBioEn ?? "" 
                    },
                    CreatedAt = ci.Instructor.CreatedAt,
                    UpdatedAt = ci.Instructor.UpdatedAt
                }).ToList(),
                Photo = c.Photo,
                Tags = c.Tags,
                InstructorsBio = new LocalizedText { Ar = c.InstructorsBioAr ?? "", En = c.InstructorsBioEn ?? "" },
                CourseTopics = new LocalizedText { Ar = c.CourseTopicsAr ?? "", En = c.CourseTopicsEn ?? "" },
                IsActive = c.IsActive,
                IsFeatured = c.IsFeatured,
                CreatedAt = c.CreatedAt,
                UpdatedAt = c.UpdatedAt
            }).ToList();

            return Ok(courseDtos);
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

            // Validate CategoryId if provided
            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.CourseCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    return BadRequest(new { error = "Invalid category ID" });
                }
            }

            // Validate SubCategoryIds if provided
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var validSubCategoryIds = await _context.CourseSubCategories
                    .Where(sc => request.SubCategoryIds.Contains(sc.Id))
                    .Select(sc => sc.Id)
                    .ToListAsync();

                if (validSubCategoryIds.Count != request.SubCategoryIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid sub-category IDs" });
                }
            }

            // Validate InstructorIds if provided
            if (request.InstructorIds != null && request.InstructorIds.Any())
            {
                var validInstructorIds = await _context.Instructors
                    .Where(i => request.InstructorIds.Contains(i.Id))
                    .Select(i => i.Id)
                    .ToListAsync();

                if (validInstructorIds.Count != request.InstructorIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid instructor IDs" });
                }
            }

            var course = new Course
            {
                Id = Guid.NewGuid(),
                Slug = request.Slug,
                Price = request.Price,
                Currency = request.Currency,
                Type = request.Type,
                Level = request.Level,
                CategoryId = request.CategoryId,
                VideoUrl = request.VideoUrl,
                DurationEn = request.DurationEn,
                DurationAr = request.DurationAr,
                From = request.From,
                To = request.To,
                SessionsNotesEn = request.SessionsNotesEn,
                SessionsNotesAr = request.SessionsNotesAr,
                InstructorNameAr = request.InstructorNameAr,
                InstructorNameEn = request.InstructorNameEn,
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
                CourseTopicsAr = request.CourseTopicsAr,
                CourseTopicsEn = request.CourseTopicsEn,
                IsActive = true,
                IsFeatured = false,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Courses.Add(course);
            await _context.SaveChangesAsync();

            // Add sub-category mappings
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var mappings = request.SubCategoryIds.Select(subCatId => new CourseSubCategoryMapping
                {
                    CourseId = course.Id,
                    SubCategoryId = subCatId,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseSubCategoryMappings.AddRange(mappings);
                await _context.SaveChangesAsync();
            }

            // Add instructor mappings
            if (request.InstructorIds != null && request.InstructorIds.Any())
            {
                var instructorMappings = request.InstructorIds.Select(instructorId => new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = instructorId,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseInstructors.AddRange(instructorMappings);
                await _context.SaveChangesAsync();
            }

            // Reload course with related data
            var createdCourse = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .Include(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c => c.Id == course.Id);

            var courseDto = new CourseDetailDto
            {
                Id = createdCourse!.Id,
                Slug = createdCourse.Slug,
                Title = new LocalizedText { Ar = createdCourse.TitleAr, En = createdCourse.TitleEn },
                Summary = new LocalizedText { Ar = createdCourse.SummaryAr ?? "", En = createdCourse.SummaryEn ?? "" },
                Description = new LocalizedText { Ar = createdCourse.DescriptionAr ?? "", En = createdCourse.DescriptionEn ?? "" },
                Price = createdCourse.Price,
                Currency = createdCourse.Currency,
                Type = createdCourse.Type,
                Level = createdCourse.Level,
                CategoryId = createdCourse.CategoryId,
                Category = createdCourse.Category != null ? new CourseCategoryDto
                {
                    Id = createdCourse.Category.Id,
                    TitleAr = createdCourse.Category.TitleAr,
                    TitleEn = createdCourse.Category.TitleEn,
                    DisplayOrder = createdCourse.Category.DisplayOrder,
                    IsActive = createdCourse.Category.IsActive,
                    CreatedAt = createdCourse.Category.CreatedAt,
                    UpdatedAt = createdCourse.Category.UpdatedAt
                } : null,
                SubCategories = createdCourse.CourseSubCategoryMappings
                    .Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    })
                    .ToList(),
                VideoUrl = createdCourse.VideoUrl,
                Duration = new LocalizedText { Ar = createdCourse.DurationAr ?? "", En = createdCourse.DurationEn ?? "" },
                From = createdCourse.From,
                To = createdCourse.To,
                SessionsNotes = new LocalizedText { Ar = createdCourse.SessionsNotesAr ?? "", En = createdCourse.SessionsNotesEn ?? "" },
                InstructorName = new LocalizedText { Ar = createdCourse.InstructorNameAr, En = createdCourse.InstructorNameEn },
                Instructors = createdCourse.CourseInstructors.Select(ci => new InstructorDto
                {
                    Id = ci.Instructor.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorNameAr, 
                        En = ci.Instructor.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorBioAr ?? "", 
                        En = ci.Instructor.InstructorBioEn ?? "" 
                    },
                    CreatedAt = ci.Instructor.CreatedAt,
                    UpdatedAt = ci.Instructor.UpdatedAt
                }).ToList(),
                Photo = createdCourse.Photo,
                Tags = createdCourse.Tags,
                InstructorsBio = new LocalizedText { Ar = createdCourse.InstructorsBioAr ?? "", En = createdCourse.InstructorsBioEn ?? "" },
                CourseTopics = new LocalizedText { Ar = createdCourse.CourseTopicsAr ?? "", En = createdCourse.CourseTopicsEn ?? "" },
                IsActive = createdCourse.IsActive,
                IsFeatured = createdCourse.IsFeatured,
                CreatedAt = createdCourse.CreatedAt,
                UpdatedAt = createdCourse.UpdatedAt,
                Sessions = new List<SessionDto>(),
                Attachments = new List<AttachmentDto>()
            };

            return CreatedAtAction(nameof(GetCourseBySlug), new { slug = createdCourse.Slug }, courseDto);
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

            var course = await _context.Courses
                .Include(c => c.CourseSubCategoryMappings)
                .Include(c => c.CourseInstructors)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (course == null)
            {
                return NotFound(new { error = "Course not found" });
            }

            // Validate CategoryId if provided
            if (request.CategoryId.HasValue)
            {
                var categoryExists = await _context.CourseCategories.AnyAsync(c => c.Id == request.CategoryId.Value);
                if (!categoryExists)
                {
                    return BadRequest(new { error = "Invalid category ID" });
                }
            }

            // Validate SubCategoryIds if provided
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var validSubCategoryIds = await _context.CourseSubCategories
                    .Where(sc => request.SubCategoryIds.Contains(sc.Id))
                    .Select(sc => sc.Id)
                    .ToListAsync();

                if (validSubCategoryIds.Count != request.SubCategoryIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid sub-category IDs" });
                }
            }

            // Validate InstructorIds if provided
            if (request.InstructorIds != null && request.InstructorIds.Any())
            {
                var validInstructorIds = await _context.Instructors
                    .Where(i => request.InstructorIds.Contains(i.Id))
                    .Select(i => i.Id)
                    .ToListAsync();

                if (validInstructorIds.Count != request.InstructorIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid instructor IDs" });
                }
            }

            course.Slug = request.Slug;
            course.Price = request.Price;
            course.Currency = request.Currency;
            course.Type = request.Type;
            course.Level = request.Level;
            course.CategoryId = request.CategoryId;
            course.VideoUrl = request.VideoUrl;
            course.DurationEn = request.DurationEn;
            course.DurationAr = request.DurationAr;
            course.From = request.From;
            course.To = request.To;
            course.SessionsNotesEn = request.SessionsNotesEn;
            course.SessionsNotesAr = request.SessionsNotesAr;
            course.InstructorNameAr = request.InstructorNameAr;
            course.InstructorNameEn = request.InstructorNameEn;
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
            course.CourseTopicsAr = request.CourseTopicsAr;
            course.CourseTopicsEn = request.CourseTopicsEn;
            course.IsActive = request.IsActive;
            course.IsFeatured = request.IsFeatured;
            course.UpdatedAt = DateTime.UtcNow;

            // Update sub-category mappings
            // Remove existing mappings
            _context.CourseSubCategoryMappings.RemoveRange(course.CourseSubCategoryMappings);

            // Add new mappings
            if (request.SubCategoryIds != null && request.SubCategoryIds.Any())
            {
                var mappings = request.SubCategoryIds.Select(subCatId => new CourseSubCategoryMapping
                {
                    CourseId = course.Id,
                    SubCategoryId = subCatId,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseSubCategoryMappings.AddRange(mappings);
            }

            // Update instructor mappings
            _context.CourseInstructors.RemoveRange(course.CourseInstructors);

            if (request.InstructorIds != null && request.InstructorIds.Any())
            {
                var instructorMappings = request.InstructorIds.Select(instructorId => new CourseInstructor
                {
                    CourseId = course.Id,
                    InstructorId = instructorId,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseInstructors.AddRange(instructorMappings);
            }

            await _context.SaveChangesAsync();

            // Reload course with related data
            var updatedCourse = await _context.Courses
                .Include(c => c.Category)
                .Include(c => c.CourseSubCategoryMappings)
                    .ThenInclude(m => m.SubCategory)
                .Include(c => c.CourseInstructors)
                    .ThenInclude(ci => ci.Instructor)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c => c.Id == id);

            var courseDto = new CourseDetailDto
            {
                Id = updatedCourse!.Id,
                Slug = updatedCourse.Slug,
                Title = new LocalizedText { Ar = updatedCourse.TitleAr, En = updatedCourse.TitleEn },
                Summary = new LocalizedText { Ar = updatedCourse.SummaryAr ?? "", En = updatedCourse.SummaryEn ?? "" },
                Description = new LocalizedText { Ar = updatedCourse.DescriptionAr ?? "", En = updatedCourse.DescriptionEn ?? "" },
                Price = updatedCourse.Price,
                Currency = updatedCourse.Currency,
                Type = updatedCourse.Type,
                Level = updatedCourse.Level,
                CategoryId = updatedCourse.CategoryId,
                Category = updatedCourse.Category != null ? new CourseCategoryDto
                {
                    Id = updatedCourse.Category.Id,
                    TitleAr = updatedCourse.Category.TitleAr,
                    TitleEn = updatedCourse.Category.TitleEn,
                    DisplayOrder = updatedCourse.Category.DisplayOrder,
                    IsActive = updatedCourse.Category.IsActive,
                    CreatedAt = updatedCourse.Category.CreatedAt,
                    UpdatedAt = updatedCourse.Category.UpdatedAt
                } : null,
                SubCategories = updatedCourse.CourseSubCategoryMappings
                    .Select(m => new CourseSubCategoryDto
                    {
                        Id = m.SubCategory.Id,
                        TitleAr = m.SubCategory.TitleAr,
                        TitleEn = m.SubCategory.TitleEn,
                        DisplayOrder = m.SubCategory.DisplayOrder,
                        IsActive = m.SubCategory.IsActive,
                        CreatedAt = m.SubCategory.CreatedAt,
                        UpdatedAt = m.SubCategory.UpdatedAt
                    })
                    .ToList(),
                VideoUrl = updatedCourse.VideoUrl,
                Duration = new LocalizedText { Ar = updatedCourse.DurationAr ?? "", En = updatedCourse.DurationEn ?? "" },
                From = updatedCourse.From,
                To = updatedCourse.To,
                SessionsNotes = new LocalizedText { Ar = updatedCourse.SessionsNotesAr ?? "", En = updatedCourse.SessionsNotesEn ?? "" },
                InstructorName = new LocalizedText { Ar = updatedCourse.InstructorNameAr, En = updatedCourse.InstructorNameEn },
                Instructors = updatedCourse.CourseInstructors.Select(ci => new InstructorDto
                {
                    Id = ci.Instructor.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorNameAr, 
                        En = ci.Instructor.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = ci.Instructor.InstructorBioAr ?? "", 
                        En = ci.Instructor.InstructorBioEn ?? "" 
                    },
                    CreatedAt = ci.Instructor.CreatedAt,
                    UpdatedAt = ci.Instructor.UpdatedAt
                }).ToList(),
                Photo = updatedCourse.Photo,
                Tags = updatedCourse.Tags,
                InstructorsBio = new LocalizedText { Ar = updatedCourse.InstructorsBioAr ?? "", En = updatedCourse.InstructorsBioEn ?? "" },
                CourseTopics = new LocalizedText { Ar = updatedCourse.CourseTopicsAr ?? "", En = updatedCourse.CourseTopicsEn ?? "" },
                IsActive = updatedCourse.IsActive,
                IsFeatured = updatedCourse.IsFeatured,
                CreatedAt = updatedCourse.CreatedAt,
                UpdatedAt = updatedCourse.UpdatedAt,
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