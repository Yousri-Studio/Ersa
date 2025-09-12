using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using Microsoft.EntityFrameworkCore;

namespace ErsaTraining.API.Services;

/// <summary>
/// Provides services for managing orders.
/// </summary>
public class OrderService : IOrderService
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<OrderService> _logger;

    public OrderService(ErsaTrainingDbContext context, ILogger<OrderService> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Creates a new order from the items in a user's shopping cart.
    /// </summary>
    /// <param name="cartId">The ID of the cart to process.</param>
    /// <param name="userId">The ID of the user placing the order.</param>
    /// <returns>The newly created order.</returns>
    public async Task<Order> CreateOrderFromCartAsync(Guid cartId, Guid userId)
    {
        var cart = await _context.Carts
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Course)
            .Include(c => c.Items)
                .ThenInclude(ci => ci.Session)
            .FirstOrDefaultAsync(c => c.Id == cartId && c.UserId == userId);

        if (cart == null || !cart.Items.Any())
        {
            throw new ArgumentException("Cart not found or is empty.");
        }

        var totalAmount = cart.Items.Sum(ci => ci.Course.Price * ci.Qty);
        var currency = cart.Items.First().Course.Currency;

        var order = new Order
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Amount = totalAmount,
            Currency = currency,
            Status = OrderStatus.New,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var item in cart.Items)
        {
            order.OrderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                CourseId = item.CourseId,
                SessionId = item.SessionId,
                CourseTitleEn = item.Course.TitleEn,
                CourseTitleAr = item.Course.TitleAr.ToString(), // Fix the bug here
                Price = item.Course.Price,
                Currency = item.Course.Currency,
                Qty = item.Qty
            });
        }

        var bill = new Bill
        {
            Id = Guid.NewGuid(),
            OrderId = order.Id,
            Amount = totalAmount,
            Currency = currency,
            Status = BillStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        order.Bill = bill;
        order.Status = OrderStatus.PendingPayment;

        _context.Orders.Add(order);
        _context.Bills.Add(bill);

        // Clear the cart after creating the order
        _context.CartItems.RemoveRange(cart.Items);
        _context.Carts.Remove(cart);

        await _context.SaveChangesAsync();

        return order;
    }
}
