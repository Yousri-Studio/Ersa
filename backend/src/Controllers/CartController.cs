using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CartController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<CartController> _logger;

    public CartController(ErsaTrainingDbContext context, ILogger<CartController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("init")]
    public async Task<ActionResult<InitCartResponse>> InitCart([FromBody] InitCartRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                AnonymousId = userId == null ? (request.AnonymousId ?? Guid.NewGuid().ToString()) : null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Carts.Add(cart);
            await _context.SaveChangesAsync();

            return Ok(new InitCartResponse
            {
                CartId = cart.Id,
                AnonymousId = cart.AnonymousId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing cart");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("items")]
    public async Task<ActionResult<CartResponse>> AddToCart([FromBody] AddToCartRequest request)
    {
        try
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.Course)
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.Session)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c => c.Id == request.CartId);

            if (cart == null)
            {
                return NotFound(new { error = "Cart not found" });
            }

            var course = await _context.Courses.FindAsync(request.CourseId);
            if (course == null || !course.IsActive)
            {
                return BadRequest(new { error = "Course not found or inactive" });
            }

            Session? session = null;
            if (request.SessionId.HasValue)
            {
                session = await _context.Sessions.FindAsync(request.SessionId.Value);
                if (session == null || session.CourseId != course.Id)
                {
                    return BadRequest(new { error = "Invalid session" });
                }

                // Check session capacity
                var enrolledCount = await _context.Enrollments
                    .CountAsync(e => e.SessionId == session.Id && e.Status == EnrollmentStatus.Paid);
                
                if (session.Capacity.HasValue && enrolledCount >= session.Capacity.Value)
                {
                    return BadRequest(new { error = "Session is full" });
                }
            }

            // Check if item already exists in cart
            var existingItem = cart.Items.FirstOrDefault(i => 
                i.CourseId == request.CourseId && i.SessionId == request.SessionId);

            if (existingItem != null)
            {
                return BadRequest(new { error = "Item already in cart" });
            }

            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                CourseId = course.Id,
                SessionId = session?.Id,
                Qty = 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.CartItems.Add(cartItem);
            cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetCartResponse(cart.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding item to cart");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet]
    public async Task<ActionResult<CartResponse>> GetCart([FromQuery] Guid cartId)
    {
        try
        {
            return await GetCartResponse(cartId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving cart");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("items/{cartItemId:guid}")]
    public async Task<ActionResult<CartResponse>> RemoveFromCart(Guid cartItemId)
    {
        try
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Cart)
                .FirstOrDefaultAsync(ci => ci.Id == cartItemId);

            if (cartItem == null)
            {
                return NotFound(new { error = "Cart item not found" });
            }

            var cartId = cartItem.Cart.Id;
            _context.CartItems.Remove(cartItem);
            cartItem.Cart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetCartResponse(cartId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing item from cart");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("merge")]
    [Authorize]
    public async Task<ActionResult<CartResponse>> MergeCart([FromBody] MergeCartRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            // Find anonymous cart
            var anonymousCart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.AnonymousId == request.AnonymousId && c.UserId == null);

            if (anonymousCart == null)
            {
                return NotFound(new { error = "Anonymous cart not found" });
            }

            // Find or create user cart
            var userCart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId);

            if (userCart == null)
            {
                userCart = new Cart
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Carts.Add(userCart);
                await _context.SaveChangesAsync();
            }

            // Merge items (avoid duplicates)
            foreach (var item in anonymousCart.Items)
            {
                var existingItem = userCart.Items.FirstOrDefault(ui => 
                    ui.CourseId == item.CourseId && ui.SessionId == item.SessionId);

                if (existingItem == null)
                {
                    item.CartId = userCart.Id;
                    userCart.Items.Add(item);
                }
            }

            // Remove anonymous cart
            _context.Carts.Remove(anonymousCart);
            userCart.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return await GetCartResponse(userCart.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error merging cart");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private async Task<ActionResult<CartResponse>> GetCartResponse(Guid cartId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Course)
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Session)
            .AsSplitQuery()
            .FirstOrDefaultAsync(c => c.Id == cartId);

        if (cart == null)
        {
            return NotFound(new { error = "Cart not found" });
        }

        var response = new CartResponse
        {
            CartId = cart.Id,
            Items = cart.Items.Select(ci => new CartItemDto
            {
                Id = ci.Id,
                CourseId = ci.CourseId,
                SessionId = ci.SessionId,
                Title = new LocalizedText 
                { 
                    Ar = ci.Course.TitleAr, 
                    En = ci.Course.TitleEn 
                },
                Price = ci.Course.Price,
                Currency = ci.Course.Currency,
                Qty = ci.Qty,
                Session = ci.Session != null ? new SessionDto
                {
                    Id = ci.Session.Id,
                    StartAt = ci.Session.StartAt,
                    EndAt = ci.Session.EndAt,
                    Capacity = ci.Session.Capacity
                } : null
            }).ToList(),
            Total = cart.Items.Sum(ci => ci.Course.Price * ci.Qty),
            Currency = cart.Items.FirstOrDefault()?.Course.Currency ?? "SAR"
        };

        return Ok(response);
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}