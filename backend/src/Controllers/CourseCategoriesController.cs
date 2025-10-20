using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Public endpoint for frontend to fetch categories
public class CourseCategoriesController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<CourseCategoriesController> _logger;

    public CourseCategoriesController(ErsaTrainingDbContext context, ILogger<CourseCategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseCategoryDto>>> GetCategories([FromQuery] bool activeOnly = false)
    {
        try
        {
            _logger.LogInformation("Fetching course categories. ActiveOnly: {ActiveOnly}", activeOnly);
            
            var query = _context.CourseCategories.AsQueryable();

            if (activeOnly)
            {
                query = query.Where(c => c.IsActive);
            }

            var categories = await query
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.TitleEn)
                .Select(c => new CourseCategoryDto
                {
                    Id = c.Id,
                    TitleAr = c.TitleAr,
                    TitleEn = c.TitleEn,
                    SubtitleAr = c.SubtitleAr,
                    SubtitleEn = c.SubtitleEn,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            _logger.LogInformation("Successfully fetched {Count} course categories", categories.Count);
            return Ok(categories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course categories");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseCategoryDto>> GetCategory(Guid id)
    {
        try
        {
            var category = await _context.CourseCategories.FindAsync(id);

            if (category == null)
            {
                return NotFound(new { error = "Category not found" });
            }

            var categoryDto = new CourseCategoryDto
            {
                Id = category.Id,
                TitleAr = category.TitleAr,
                TitleEn = category.TitleEn,
                SubtitleAr = category.SubtitleAr,
                SubtitleEn = category.SubtitleEn,
                DisplayOrder = category.DisplayOrder,
                IsActive = category.IsActive,
                CreatedAt = category.CreatedAt,
                UpdatedAt = category.UpdatedAt
            };

            return Ok(categoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course category {CategoryId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Note: Create, Update, and Delete operations are handled by AdminController
    // These endpoints require authentication and admin privileges
}

