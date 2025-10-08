using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[AllowAnonymous] // Public endpoint for frontend to fetch subcategories
public class CourseSubCategoriesController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<CourseSubCategoriesController> _logger;

    public CourseSubCategoriesController(ErsaTrainingDbContext context, ILogger<CourseSubCategoriesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<CourseSubCategoryDto>>> GetSubCategories([FromQuery] bool activeOnly = false)
    {
        try
        {
            _logger.LogInformation("Fetching course sub-categories. ActiveOnly: {ActiveOnly}", activeOnly);
            
            var query = _context.CourseSubCategories.AsQueryable();

            if (activeOnly)
            {
                query = query.Where(c => c.IsActive);
            }

            var subCategories = await query
                .OrderBy(c => c.DisplayOrder)
                .ThenBy(c => c.TitleEn)
                .Select(c => new CourseSubCategoryDto
                {
                    Id = c.Id,
                    TitleAr = c.TitleAr,
                    TitleEn = c.TitleEn,
                    DisplayOrder = c.DisplayOrder,
                    IsActive = c.IsActive,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            _logger.LogInformation("Successfully fetched {Count} course sub-categories", subCategories.Count);
            return Ok(subCategories);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course sub-categories");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CourseSubCategoryDto>> GetSubCategory(Guid id)
    {
        try
        {
            var subCategory = await _context.CourseSubCategories.FindAsync(id);

            if (subCategory == null)
            {
                return NotFound(new { error = "Sub-category not found" });
            }

            var subCategoryDto = new CourseSubCategoryDto
            {
                Id = subCategory.Id,
                TitleAr = subCategory.TitleAr,
                TitleEn = subCategory.TitleEn,
                DisplayOrder = subCategory.DisplayOrder,
                IsActive = subCategory.IsActive,
                CreatedAt = subCategory.CreatedAt,
                UpdatedAt = subCategory.UpdatedAt
            };

            return Ok(subCategoryDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving course sub-category {SubCategoryId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Note: Create, Update, and Delete operations are handled by AdminController
    // These endpoints require authentication and admin privileges
}

