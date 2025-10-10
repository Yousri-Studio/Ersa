using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API;

public static class CleanDatabase
{
    public static async Task CleanDatabaseAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole<Guid>>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Starting complete database cleanup...");

            // Delete all users
            var allUsers = await context.Users.ToListAsync();
            logger.LogInformation($"Deleting {allUsers.Count} users...");
            
            foreach (var user in allUsers)
            {
                var result = await userManager.DeleteAsync(user);
                if (result.Succeeded)
                {
                    logger.LogInformation($"Deleted user: {user.Email}");
                }
                else
                {
                    logger.LogError($"Failed to delete user {user.Email}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            // Delete all roles
            var allRoles = await context.Roles.ToListAsync();
            logger.LogInformation($"Deleting {allRoles.Count} roles...");
            
            foreach (var role in allRoles)
            {
                var result = await roleManager.DeleteAsync(role);
                if (result.Succeeded)
                {
                    logger.LogInformation($"Deleted role: {role.Name}");
                }
                else
                {
                    logger.LogError($"Failed to delete role {role.Name}: {string.Join(", ", result.Errors.Select(e => e.Description))}");
                }
            }

            // Delete all orders and related data
            var orders = await context.Orders.ToListAsync();
            if (orders.Any())
            {
                logger.LogInformation($"Deleting {orders.Count} orders...");
                context.Orders.RemoveRange(orders);
            }

            var orderItems = await context.OrderItems.ToListAsync();
            if (orderItems.Any())
            {
                logger.LogInformation($"Deleting {orderItems.Count} order items...");
                context.OrderItems.RemoveRange(orderItems);
            }

            var payments = await context.Payments.ToListAsync();
            if (payments.Any())
            {
                logger.LogInformation($"Deleting {payments.Count} payments...");
                context.Payments.RemoveRange(payments);
            }

            // Save all changes
            await context.SaveChangesAsync();
            
            logger.LogInformation("Database cleanup completed successfully");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error during database cleanup");
            throw;
        }
    }
}
