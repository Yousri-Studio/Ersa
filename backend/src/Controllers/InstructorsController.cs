using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Public endpoint for frontend to fetch instructors
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
            _logger.LogInformation("Fetching instructors");
            
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

            _logger.LogInformation("Successfully fetched {Count} instructors", instructors.Count);
            return Ok(instructors);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructors");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<InstructorDto>> GetInstructor(Guid id)
    {
        try
        {
            _logger.LogInformation("Fetching instructor {InstructorId}", id);
            
            var instructor = await _context.Instructors
                .FirstOrDefaultAsync(i => i.Id == id);

            if (instructor == null)
            {
                return NotFound(new { error = "Instructor not found" });
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

            _logger.LogInformation("Successfully fetched instructor {InstructorId}", id);
            return Ok(instructorDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving instructor {InstructorId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}
