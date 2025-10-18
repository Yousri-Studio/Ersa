using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using System.Security.Claims;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class WishlistController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<WishlistController> _logger;

    public WishlistController(ErsaTrainingDbContext context, ILogger<WishlistController> logger)
    {
        _context = context;
        _logger = logger;
    }

    // GET: api/wishlist/items
    [HttpGet("items")]
    public async Task<ActionResult<WishlistResponse>> GetWishlistItems()
    {
        try
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Get or create wishlist for user
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                    .ThenInclude(wi => wi.Course)
                        .ThenInclude(c => c!.Category)
                .Include(w => w.Items)
                    .ThenInclude(wi => wi.Course)
                        .ThenInclude(c => c!.CourseInstructors)
                            .ThenInclude(ci => ci.Instructor)
                .FirstOrDefaultAsync(w => w.UserId == userId.Value);

            if (wishlist == null)
            {
                // Create new wishlist if doesn't exist
                wishlist = new Wishlist
                {
                    UserId = userId.Value,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Wishlists.Add(wishlist);
                await _context.SaveChangesAsync();
            }

            var items = wishlist.Items.Select(wi => new WishlistItemDto
            {
                Id = wi.Id.ToString(),
                CourseId = wi.CourseId.ToString(),
                Title = new LocalizedString
                {
                    Ar = wi.Course?.TitleAr ?? "",
                    En = wi.Course?.TitleEn ?? ""
                },
                Description = new LocalizedString
                {
                    Ar = wi.Course?.DescriptionAr ?? "",
                    En = wi.Course?.DescriptionEn ?? ""
                },
                Price = wi.Course?.Price ?? 0,
                OriginalPrice = wi.Course?.Price ?? 0, // Course doesn't have OriginalPrice, use same as Price
                ImageUrl = null, // Course uses Photo (byte[]), not ImageUrl
                Rating = 0, // Course doesn't have Rating property
                StudentsCount = 0, // Course doesn't have StudentsCount property
                Duration = 0, // Course doesn't have DurationHours, has DurationEn/DurationAr strings instead
                Level = wi.Course?.Level.ToString() ?? "Beginner",
                Instructor = wi.Course?.CourseInstructors?.FirstOrDefault()?.Instructor?.InstructorNameEn ?? "Unknown",
                CategoryName = new LocalizedString
                {
                    Ar = wi.Course?.Category?.TitleAr ?? "",
                    En = wi.Course?.Category?.TitleEn ?? ""
                },
                CreatedAt = wi.CreatedAt
            }).OrderByDescending(x => x.CreatedAt).ToList();

            return Ok(new WishlistResponse
            {
                Items = items,
                TotalCount = items.Count
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting wishlist items");
            return StatusCode(500, new { message = "An error occurred while fetching wishlist items" });
        }
    }

    // POST: api/wishlist/items
    [HttpPost("items")]
    public async Task<ActionResult> AddToWishlist([FromBody] AddToWishlistRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            if (!Guid.TryParse(request.CourseId, out var courseId))
            {
                return BadRequest(new { message = "Invalid course ID" });
            }

            // Check if course exists
            var course = await _context.Courses.FindAsync(courseId);
            if (course == null)
            {
                return NotFound(new { message = "Course not found" });
            }

            // Get or create wishlist
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId.Value);

            if (wishlist == null)
            {
                wishlist = new Wishlist
                {
                    UserId = userId.Value,
                    CreatedAt = DateTime.UtcNow
                };
                _context.Wishlists.Add(wishlist);
                await _context.SaveChangesAsync();
            }

            // Check if item already exists in wishlist
            var existingItem = wishlist.Items.FirstOrDefault(wi => wi.CourseId == courseId);
            if (existingItem != null)
            {
                return Ok(new { message = "Course already in wishlist", itemId = existingItem.Id });
            }

            // Add new item to wishlist
            var wishlistItem = new WishlistItem
            {
                WishlistId = wishlist.Id,
                CourseId = courseId,
                CreatedAt = DateTime.UtcNow
            };

            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Course added to wishlist successfully", 
                itemId = wishlistItem.Id 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding item to wishlist");
            return StatusCode(500, new { message = "An error occurred while adding item to wishlist" });
        }
    }

    // DELETE: api/wishlist/items/{courseId}
    [HttpDelete("items/{courseId}")]
    public async Task<ActionResult> RemoveFromWishlist(string courseId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            if (!Guid.TryParse(courseId, out var courseGuid))
            {
                return BadRequest(new { message = "Invalid course ID" });
            }

            // Get wishlist
            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId.Value);

            if (wishlist == null)
            {
                return NotFound(new { message = "Wishlist not found" });
            }

            // Find and remove item
            var item = wishlist.Items.FirstOrDefault(wi => wi.CourseId == courseGuid);
            if (item == null)
            {
                return NotFound(new { message = "Course not found in wishlist" });
            }

            _context.WishlistItems.Remove(item);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Course removed from wishlist successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing item from wishlist");
            return StatusCode(500, new { message = "An error occurred while removing item from wishlist" });
        }
    }

    // DELETE: api/wishlist/clear
    [HttpDelete("clear")]
    public async Task<ActionResult> ClearWishlist()
    {
        try
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            var wishlist = await _context.Wishlists
                .Include(w => w.Items)
                .FirstOrDefaultAsync(w => w.UserId == userId.Value);

            if (wishlist != null && wishlist.Items.Any())
            {
                _context.WishlistItems.RemoveRange(wishlist.Items);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Wishlist cleared successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error clearing wishlist");
            return StatusCode(500, new { message = "An error occurred while clearing wishlist" });
        }
    }

    // GET: api/wishlist/check/{courseId}
    [HttpGet("check/{courseId}")]
    public async Task<ActionResult<WishlistCheckResponse>> CheckIfInWishlist(string courseId)
    {
        try
        {
            var userId = GetUserId();
            if (userId == null)
            {
                return Ok(new WishlistCheckResponse { IsInWishlist = false });
            }

            if (!Guid.TryParse(courseId, out var courseGuid))
            {
                return BadRequest(new { message = "Invalid course ID" });
            }

            var isInWishlist = await _context.WishlistItems
                .AnyAsync(wi => wi.Wishlist.UserId == userId.Value && wi.CourseId == courseGuid);

            return Ok(new WishlistCheckResponse { IsInWishlist = isInWishlist });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking wishlist");
            return StatusCode(500, new { message = "An error occurred while checking wishlist" });
        }
    }

    private Guid? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }
        return userId;
    }
}

// DTOs
public class WishlistResponse
{
    public List<WishlistItemDto> Items { get; set; } = new();
    public int TotalCount { get; set; }
}

public class WishlistItemDto
{
    public string Id { get; set; } = string.Empty;
    public string CourseId { get; set; } = string.Empty;
    public LocalizedString Title { get; set; } = new();
    public LocalizedString Description { get; set; } = new();
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public string? ImageUrl { get; set; }
    public decimal Rating { get; set; }
    public int StudentsCount { get; set; }
    public decimal Duration { get; set; }
    public string Level { get; set; } = string.Empty;
    public string Instructor { get; set; } = string.Empty;
    public LocalizedString CategoryName { get; set; } = new();
    public DateTime CreatedAt { get; set; }
}

public class LocalizedString
{
    public string Ar { get; set; } = string.Empty;
    public string En { get; set; } = string.Empty;
}

public class AddToWishlistRequest
{
    public string CourseId { get; set; } = string.Empty;
}

public class WishlistCheckResponse
{
    public bool IsInWishlist { get; set; }
}

