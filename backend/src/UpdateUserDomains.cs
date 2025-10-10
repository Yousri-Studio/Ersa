using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API;

public static class UpdateUserDomains
{
    public static async Task UpdateUserDomainsAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

        try
        {
            logger.LogInformation("Starting user domain update...");

            // Find all users with old domain
            var usersWithOldDomain = await context.Users
                .Where(u => u.Email!.Contains("ersatraining.com"))
                .ToListAsync();

            logger.LogInformation($"Found {usersWithOldDomain.Count} users with old domain");

            foreach (var user in usersWithOldDomain)
            {
                var oldEmail = user.Email;
                var newEmail = oldEmail!.Replace("ersatraining.com", "ersa-training.com");
                
                // Update email and username
                user.Email = newEmail;
                user.UserName = newEmail;
                
                logger.LogInformation($"Updating user: {oldEmail} -> {newEmail}");
            }

            // Save changes
            await context.SaveChangesAsync();
            
            logger.LogInformation($"Successfully updated {usersWithOldDomain.Count} user domains");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating user domains");
            throw;
        }
    }
}
