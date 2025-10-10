using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API;

public static class DeleteOldDomainUsers
{
    public static async Task DeleteOldDomainUsersAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Starting deletion of users with old domain...");

            // Find all users with old domain
            var usersWithOldDomain = await context.Users
                .Where(u => u.Email!.Contains("ersatraining.com"))
                .ToListAsync();

            if (usersWithOldDomain.Count == 0)
            {
                logger.LogInformation("No users with old domain found. Skipping deletion.");
                return;
            }

            logger.LogInformation($"Found {usersWithOldDomain.Count} users with old domain to delete");

            var userIds = usersWithOldDomain.Select(u => u.Id).ToList();

            // Step 1: Delete all related data first to avoid FK constraint violations
            
            // Delete Enrollments for these users
            var enrollments = await context.Enrollments
                .Where(e => userIds.Contains(e.UserId))
                .ToListAsync();
            if (enrollments.Any())
            {
                context.Enrollments.RemoveRange(enrollments);
                logger.LogInformation($"Deleting {enrollments.Count} enrollments");
            }

            // Delete Payments for these users' orders
            var payments = await context.Payments
                .Where(p => context.Orders.Any(o => o.UserId == p.Order.UserId && userIds.Contains(o.UserId)))
                .ToListAsync();
            if (payments.Any())
            {
                context.Payments.RemoveRange(payments);
                logger.LogInformation($"Deleting {payments.Count} payments");
            }

            // Delete Bills for these users' orders
            var bills = await context.Bills
                .Where(b => userIds.Contains(b.Order.UserId))
                .ToListAsync();
            if (bills.Any())
            {
                context.Bills.RemoveRange(bills);
                logger.LogInformation($"Deleting {bills.Count} bills");
            }

            // Delete OrderItems for these users' orders
            var orderItems = await context.OrderItems
                .Where(oi => userIds.Contains(oi.Order.UserId))
                .ToListAsync();
            if (orderItems.Any())
            {
                context.OrderItems.RemoveRange(orderItems);
                logger.LogInformation($"Deleting {orderItems.Count} order items");
            }

            // Delete Orders for these users
            var orders = await context.Orders
                .Where(o => userIds.Contains(o.UserId))
                .ToListAsync();
            if (orders.Any())
            {
                context.Orders.RemoveRange(orders);
                logger.LogInformation($"Deleting {orders.Count} orders");
            }

            // Delete CartItems for these users (through Cart)
            var cartItems = await context.CartItems
                .Where(ci => ci.Cart.UserId.HasValue && userIds.Contains(ci.Cart.UserId.Value))
                .ToListAsync();
            if (cartItems.Any())
            {
                context.CartItems.RemoveRange(cartItems);
                logger.LogInformation($"Deleting {cartItems.Count} cart items");
            }

            // Delete Carts for these users
            var carts = await context.Carts
                .Where(c => c.UserId.HasValue && userIds.Contains(c.UserId.Value))
                .ToListAsync();
            if (carts.Any())
            {
                context.Carts.RemoveRange(carts);
                logger.LogInformation($"Deleting {carts.Count} carts");
            }

            // Delete WishlistItems for these users (through Wishlist)
            var wishlistItems = await context.WishlistItems
                .Where(wi => userIds.Contains(wi.Wishlist.UserId))
                .ToListAsync();
            if (wishlistItems.Any())
            {
                context.WishlistItems.RemoveRange(wishlistItems);
                logger.LogInformation($"Deleting {wishlistItems.Count} wishlist items");
            }

            // Delete Wishlists for these users
            var wishlists = await context.Wishlists
                .Where(w => userIds.Contains(w.UserId))
                .ToListAsync();
            if (wishlists.Any())
            {
                context.Wishlists.RemoveRange(wishlists);
                logger.LogInformation($"Deleting {wishlists.Count} wishlists");
            }

            // Save all deletions
            await context.SaveChangesAsync();
            logger.LogInformation("Successfully deleted all related data for old domain users");

            // Step 2: Now delete the users (UserManager will handle Identity tables)
            foreach (var user in usersWithOldDomain)
            {
                logger.LogInformation($"Deleting user: {user.Email}");
                
                // Delete user from Identity system (this will also remove role assignments)
                var result = await userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    logger.LogInformation($"Successfully deleted user: {user.Email}");
                }
                else
                {
                    logger.LogError($"Failed to delete user {user.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            // Step 3: Clean up any remaining orphaned user-role mappings
            var userRoleMappings = await context.UserRoles
                .Where(ur => !context.Users.Any(u => u.Id == ur.UserId))
                .ToListAsync();

            if (userRoleMappings.Any())
            {
                context.UserRoles.RemoveRange(userRoleMappings);
                await context.SaveChangesAsync();
                logger.LogInformation($"Cleaned up {userRoleMappings.Count} orphaned user-role mappings");
            }

            logger.LogInformation($"Successfully deleted {usersWithOldDomain.Count} users with old domain and all their related data");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting users with old domain");
            throw;
        }
    }
}
