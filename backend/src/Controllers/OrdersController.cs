using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
/// <summary>
/// API controller for managing orders.
/// </summary>
public class OrdersController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly IOrderService _orderService;
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(ErsaTrainingDbContext context, IOrderService orderService, ILogger<OrdersController> logger)
    {
        _context = context;
        _orderService = orderService;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new order from the user's shopping cart.
    /// </summary>
    /// <param name="request">The request containing the cart ID.</param>
    /// <returns>A response containing the details of the newly created order.</returns>
    [HttpPost]
    public async Task<ActionResult<CreateOrderResponse>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.Course)
                .Include(c => c.Items)
                    .ThenInclude(ci => ci.Session)
                .AsSplitQuery()
                .FirstOrDefaultAsync(c => c.Id == request.CartId && 
                    (c.UserId == userId || (c.UserId == null && c.AnonymousId != null)));

            if (cart == null || !cart.Items.Any())
            {
                return BadRequest(new { error = "Cart not found or empty" });
            }

            // Validate cart items
            foreach (var item in cart.Items)
            {
                if (!item.Course.IsActive)
                {
                    return BadRequest(new { error = $"Course {item.Course.TitleEn} is no longer active" });
                }

                if (item.SessionId.HasValue && item.Session != null)
                {
                    var enrolledCount = await _context.Enrollments
                        .CountAsync(e => e.SessionId == item.Session.Id && e.Status == EnrollmentStatus.Paid);
                    
                    if (item.Session.Capacity.HasValue && enrolledCount >= item.Session.Capacity.Value)
                    {
                        return BadRequest(new { error = $"Session for {item.Course.TitleEn} is full" });
                    }
                }
            }

            var totalAmount = cart.Items.Sum(ci => ci.Course.Price * ci.Qty);
            var currency = cart.Items.First().Course.Currency;

            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = userId.Value,
                Amount = totalAmount,
                Currency = currency,
                Status = OrderStatus.PendingPayment,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Orders.Add(order);
            
            // Create order items from cart items
            foreach (var cartItem in cart.Items)
            {
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    CourseId = cartItem.CourseId,
                    SessionId = cartItem.SessionId,
                    CourseTitleEn = cartItem.Course.TitleEn,
                    CourseTitleAr = cartItem.Course.TitleAr,
                    Price = cartItem.Course.Price,
                    Currency = cartItem.Course.Currency,
                    Qty = cartItem.Qty,
                    CreatedAt = DateTime.UtcNow
                };
                _context.OrderItems.Add(orderItem);
            }
            
            await _context.SaveChangesAsync();

            return Ok(new CreateOrderResponse
            {
                OrderId = order.Id,
                Amount = order.Amount,
                Currency = order.Currency,
                Status = order.Status,
                CreatedAt = order.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating order");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Retrieves all orders for the current user.
    /// </summary>
    /// <returns>A list of the user's orders.</returns>
    [HttpGet]
    public async Task<ActionResult<List<OrderDto>>> GetUserOrders()
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var orders = await _context.Orders
                .Include(o => o.OrderItems)
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync();

            var orderDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                Amount = o.Amount,
                Currency = o.Currency,
                Status = o.Status,
                CreatedAt = o.CreatedAt,
                UpdatedAt = o.UpdatedAt,
                Items = o.OrderItems.Select(oi => new OrderItemDto
                {
                    CourseId = oi.CourseId,
                    CourseTitleEn = oi.CourseTitleEn,
                    CourseTitleAr = oi.CourseTitleAr,
                    SessionId = oi.SessionId,
                    Price = oi.Price,
                    Currency = oi.Currency,
                    Qty = oi.Qty
                }).ToList()
            }).ToList();

            return Ok(orderDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user orders");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Retrieves a specific order by its ID.
    /// </summary>
    /// <param name="id">The ID of the order to retrieve.</param>
    /// <returns>The details of the specified order.</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> GetOrder(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            var orderDto = new OrderDto
            {
                Id = order.Id,
                Amount = order.Amount,
                Currency = order.Currency,
                Status = order.Status,
                CreatedAt = order.CreatedAt,
                Items = new List<OrderItemDto>() // TODO: Implement order items
            };

            return Ok(orderDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving order");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    /// <summary>
    /// Cancels an order if it's still pending payment.
    /// </summary>
    /// <param name="id">The ID of the order to cancel.</param>
    /// <returns>A success or error message.</returns>
    [HttpPost("{id:guid}/cancel")]
    public async Task<ActionResult> CancelOrder(Guid id)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            // Only allow cancellation of pending payment or new orders
            if (order.Status != OrderStatus.PendingPayment && order.Status != OrderStatus.New)
            {
                return BadRequest(new { error = $"Cannot cancel order with status: {order.Status}" });
            }

            order.Status = OrderStatus.Cancelled;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Order {OrderId} cancelled by user {UserId}", id, userId);

            return Ok(new { message = "Order cancelled successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cancelling order {OrderId}", id);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}