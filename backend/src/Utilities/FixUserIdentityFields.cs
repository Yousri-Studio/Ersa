using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Utilities;

public static class FixUserIdentityFields
{
    public static async Task FixExistingUsersAsync(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        
        Console.WriteLine("Checking for users with missing Identity fields...");
        
        // Find users with null or empty SecurityStamp
        var usersToFix = await context.Users
            .Where(u => string.IsNullOrEmpty(u.SecurityStamp) || 
                       string.IsNullOrEmpty(u.ConcurrencyStamp) ||
                       string.IsNullOrEmpty(u.UserName) ||
                       string.IsNullOrEmpty(u.NormalizedUserName) ||
                       string.IsNullOrEmpty(u.NormalizedEmail))
            .ToListAsync();
            
        if (!usersToFix.Any())
        {
            Console.WriteLine("No users need fixing.");
            return;
        }
        
        Console.WriteLine($"Found {usersToFix.Count} users that need Identity fields fixed.");
        
        foreach (var user in usersToFix)
        {
            Console.WriteLine($"Fixing user: {user.Email}");
            
            // Set required Identity fields
            if (string.IsNullOrEmpty(user.SecurityStamp))
            {
                user.SecurityStamp = Guid.NewGuid().ToString();
            }
            
            if (string.IsNullOrEmpty(user.ConcurrencyStamp))
            {
                user.ConcurrencyStamp = Guid.NewGuid().ToString();
            }
            
            if (string.IsNullOrEmpty(user.UserName))
            {
                user.UserName = user.Email;
            }
            
            if (string.IsNullOrEmpty(user.NormalizedUserName))
            {
                user.NormalizedUserName = user.Email?.ToUpperInvariant();
            }
            
            if (string.IsNullOrEmpty(user.NormalizedEmail))
            {
                user.NormalizedEmail = user.Email?.ToUpperInvariant();
            }
            
            // Update the user
            var result = await userManager.UpdateAsync(user);
            if (result.Succeeded)
            {
                Console.WriteLine($"✓ Fixed user: {user.Email}");
            }
            else
            {
                Console.WriteLine($"✗ Failed to fix user: {user.Email}");
                foreach (var error in result.Errors)
                {
                    Console.WriteLine($"  Error: {error.Description}");
                }
            }
        }
        
        Console.WriteLine("User Identity fields fix completed.");
    }
}
