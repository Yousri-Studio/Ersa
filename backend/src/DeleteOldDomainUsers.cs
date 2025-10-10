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

            logger.LogInformation($"Found {usersWithOldDomain.Count} users with old domain to delete");

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

            // Also delete any remaining user-role mappings for old domain users
            var userRoleMappings = await context.UserRoles
                .Where(ur => !context.Users.Any(u => u.Id == ur.UserId))
                .ToListAsync();

            if (userRoleMappings.Any())
            {
                context.UserRoles.RemoveRange(userRoleMappings);
                await context.SaveChangesAsync();
                logger.LogInformation($"Cleaned up {userRoleMappings.Count} orphaned user-role mappings");
            }

            logger.LogInformation($"Successfully deleted {usersWithOldDomain.Count} users with old domain");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting users with old domain");
            throw;
        }
    }
}
