using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// Defines the contract for a service that manages order creation.
/// </summary>
public interface IOrderService
{
    /// <summary>
    /// Creates a new order from the items in a user's shopping cart.
    /// </summary>
    /// <param name="cartId">The ID of the cart to process.</param>
    /// <param name="userId">The ID of the user placing the order.</param>
    /// <returns>The newly created order.</returns>
    Task<Order> CreateOrderFromCartAsync(Guid cartId, Guid userId);
}
