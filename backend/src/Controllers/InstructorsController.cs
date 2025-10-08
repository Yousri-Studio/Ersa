using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InstructorsController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<InstructorsController> _logger;

    public InstructorsController(ErsaTrainingDbContext context, ILogger<InstructorsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<InstructorDto>>> GetInstructors()
    {
        try
        {
            var instructors = await _context.Instructors
                .OrderBy(i => i.InstructorNameEn)
                .Select(i => new InstructorDto
                {
                    Id = i.Id,
                    InstructorName = new LocalizedText 
                    { 
                        Ar = i.InstructorNameAr, 
                        En = i.InstructorNameEn 
                    },
                    InstructorBio = new LocalizedText 
                    { 
                        Ar = i.InstructorBioAr ?? "", 
                        En = i.InstructorBioEn ?? "" 
                    },
                    CreatedAt = i.CreatedAt,
                    UpdatedAt = i.UpdatedAt
                })
                .ToListAsync();

            return Ok(instructors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructors");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InstructorDetailDto>> GetInstructor(Guid id)
    {
        try
        {
            var instructor = await _context.Instructors
                .Include(i => i.CourseInstructors)
                    .ThenInclude(ci => ci.Course)
                        .ThenInclude(c => c.Category)
                .Include(i => i.CourseInstructors)
                    .ThenInclude(ci => ci.Course)
                        .ThenInclude(c => c.CourseSubCategoryMappings)
                            .ThenInclude(m => m.SubCategory)
                .AsSplitQuery()
                .FirstOrDefaultAsync(i => i.Id == id);

            if (instructor == null)
            {
                return NotFound(new { error = "Instructor not found" });
            }

            var instructorDto = new InstructorDetailDto
            {
                Id = instructor.Id,
                InstructorName = new LocalizedText 
                { 
                    Ar = instructor.InstructorNameAr, 
                    En = instructor.InstructorNameEn 
                },
                InstructorBio = new LocalizedText 
                { 
                    Ar = instructor.InstructorBioAr ?? "", 
                    En = instructor.InstructorBioEn ?? "" 
                },
                CreatedAt = instructor.CreatedAt,
                UpdatedAt = instructor.UpdatedAt,
                Courses = instructor.CourseInstructors
                    .Select(ci => new CourseListDto
                    {
                        Id = ci.Course.Id,
                        Slug = ci.Course.Slug,
                        Title = new LocalizedText { Ar = ci.Course.TitleAr, En = ci.Course.TitleEn },
                        Summary = new LocalizedText { Ar = ci.Course.SummaryAr ?? "", En = ci.Course.SummaryEn ?? "" },
                        Description = new LocalizedText { Ar = ci.Course.DescriptionAr ?? "", En = ci.Course.DescriptionEn ?? "" },
                        Price = ci.Course.Price,
                        Currency = ci.Course.Currency,
                        Type = ci.Course.Type,
                        Level = ci.Course.Level,
                        CategoryId = ci.Course.CategoryId,
                        Category = ci.Course.Category != null ? new CourseCategoryDto
                        {
                            Id = ci.Course.Category.Id,
                            TitleAr = ci.Course.Category.TitleAr,
                            TitleEn = ci.Course.Category.TitleEn,
                            DisplayOrder = ci.Course.Category.DisplayOrder,
                            IsActive = ci.Course.Category.IsActive,
                            CreatedAt = ci.Course.Category.CreatedAt,
                            UpdatedAt = ci.Course.Category.UpdatedAt
                        } : null,
                        SubCategories = ci.Course.CourseSubCategoryMappings
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
                        VideoUrl = ci.Course.VideoUrl,
                        Duration = ci.Course.Duration,
                        From = ci.Course.From,
                        To = ci.Course.To,
                        SessionsNotes = new LocalizedText { Ar = ci.Course.SessionsNotesAr ?? "", En = ci.Course.SessionsNotesEn ?? "" },
                        InstructorName = new LocalizedText { Ar = ci.Course.InstructorNameAr, En = ci.Course.InstructorNameEn },
                        Instructors = new List<InstructorDto>(),
                        Photo = ci.Course.Photo,
                        Tags = ci.Course.Tags,
                        InstructorsBio = new LocalizedText { Ar = ci.Course.InstructorsBioAr ?? "", En = ci.Course.InstructorsBioEn ?? "" },
                        CourseTopics = new LocalizedText { Ar = ci.Course.CourseTopicsAr ?? "", En = ci.Course.CourseTopicsEn ?? "" },
                        IsActive = ci.Course.IsActive,
                        IsFeatured = ci.Course.IsFeatured,
                        CreatedAt = ci.Course.CreatedAt,
                        UpdatedAt = ci.Course.UpdatedAt
                    })
                    .ToList()
            };

            return Ok(instructorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructor {InstructorId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost]
    public async Task<ActionResult<InstructorDto>> CreateInstructor([FromBody] CreateInstructorRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Validate CourseIds if provided
            if (request.CourseIds != null && request.CourseIds.Any())
            {
                var validCourseIds = await _context.Courses
                    .Where(c => request.CourseIds.Contains(c.Id))
                    .Select(c => c.Id)
                    .ToListAsync();

                if (validCourseIds.Count != request.CourseIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid course IDs" });
                }
            }

            var instructor = new Instructor
            {
                Id = Guid.NewGuid(),
                InstructorNameEn = request.InstructorNameEn,
                InstructorNameAr = request.InstructorNameAr,
                InstructorBioEn = request.InstructorBioEn,
                InstructorBioAr = request.InstructorBioAr,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Instructors.Add(instructor);
            await _context.SaveChangesAsync();

            // Add course-instructor mappings
            if (request.CourseIds != null && request.CourseIds.Any())
            {
                var mappings = request.CourseIds.Select(courseId => new CourseInstructor
                {
                    CourseId = courseId,
                    InstructorId = instructor.Id,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseInstructors.AddRange(mappings);
                await _context.SaveChangesAsync();
            }

            var instructorDto = new InstructorDto
            {
                Id = instructor.Id,
                InstructorName = new LocalizedText 
                { 
                    Ar = instructor.InstructorNameAr, 
                    En = instructor.InstructorNameEn 
                },
                InstructorBio = new LocalizedText 
                { 
                    Ar = instructor.InstructorBioAr ?? "", 
                    En = instructor.InstructorBioEn ?? "" 
                },
                CreatedAt = instructor.CreatedAt,
                UpdatedAt = instructor.UpdatedAt
            };

            return CreatedAtAction(nameof(GetInstructor), new { id = instructor.Id }, instructorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating instructor");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<InstructorDto>> UpdateInstructor(Guid id, [FromBody] UpdateInstructorRequest request)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var instructor = await _context.Instructors
                .Include(i => i.CourseInstructors)
                .FirstOrDefaultAsync(i => i.Id == id);

            if (instructor == null)
            {
                return NotFound(new { error = "Instructor not found" });
            }

            // Validate CourseIds if provided
            if (request.CourseIds != null && request.CourseIds.Any())
            {
                var validCourseIds = await _context.Courses
                    .Where(c => request.CourseIds.Contains(c.Id))
                    .Select(c => c.Id)
                    .ToListAsync();

                if (validCourseIds.Count != request.CourseIds.Count)
                {
                    return BadRequest(new { error = "One or more invalid course IDs" });
                }
            }

            instructor.InstructorNameEn = request.InstructorNameEn;
            instructor.InstructorNameAr = request.InstructorNameAr;
            instructor.InstructorBioEn = request.InstructorBioEn;
            instructor.InstructorBioAr = request.InstructorBioAr;
            instructor.UpdatedAt = DateTime.UtcNow;

            // Update course-instructor mappings
            _context.CourseInstructors.RemoveRange(instructor.CourseInstructors);

            if (request.CourseIds != null && request.CourseIds.Any())
            {
                var mappings = request.CourseIds.Select(courseId => new CourseInstructor
                {
                    CourseId = courseId,
                    InstructorId = instructor.Id,
                    CreatedAt = DateTime.UtcNow
                }).ToList();

                _context.CourseInstructors.AddRange(mappings);
            }

            await _context.SaveChangesAsync();

            var instructorDto = new InstructorDto
            {
                Id = instructor.Id,
                InstructorName = new LocalizedText 
                { 
                    Ar = instructor.InstructorNameAr, 
                    En = instructor.InstructorNameEn 
                },
                InstructorBio = new LocalizedText 
                { 
                    Ar = instructor.InstructorBioAr ?? "", 
                    En = instructor.InstructorBioEn ?? "" 
                },
                CreatedAt = instructor.CreatedAt,
                UpdatedAt = instructor.UpdatedAt
            };

            return Ok(instructorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating instructor {InstructorId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteInstructor(Guid id)
    {
        try
        {
            var instructor = await _context.Instructors.FindAsync(id);

            if (instructor == null)
            {
                return NotFound(new { error = "Instructor not found" });
            }

            _context.Instructors.Remove(instructor);
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting instructor {InstructorId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}

