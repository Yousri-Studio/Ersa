using Microsoft.AspNetCore.Identity;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API;

public static class CreateSuperAdmin
{
    public static async Task CreateSuperAdminUser(IServiceProvider serviceProvider)
    {
        using var scope = serviceProvider.CreateScope();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
        var context = scope.ServiceProvider.GetRequiredService<ErsaTrainingDbContext>();

        // Create Super Admin (System Manager)
        await CreateUserIfNotExists(userManager, 
            "superadmin@ersatraining.com", 
            "SuperAdmin123!", 
            "System Manager", 
            true, 
            true);

        // Create Operations Manager
        await CreateUserIfNotExists(userManager, 
            "operations@ersatraining.com", 
            "Operations123!", 
            "Operations Manager", 
            true, 
            false);

        // Create legacy admin account for backward compatibility
        await CreateUserIfNotExists(userManager, 
            "admin@ersatraining.com", 
            "Admin123!", 
            "Legacy Administrator", 
            true, 
            true);
    }

    private static async Task CreateUserIfNotExists(
        UserManager<User> userManager, 
        string email, 
        string password, 
        string fullName, 
        bool isAdmin, 
        bool isSuperAdmin)
    {
        var existingUser = await userManager.FindByEmailAsync(email);
        if (existingUser != null)
        {
            Console.WriteLine($"User {email} already exists!");
            return;
        }

        var user = new User
        {
            UserName = email,
            Email = email,
            FullName = fullName,
            Locale = "en",
            Status = UserStatus.Active,
            IsAdmin = isAdmin,
            IsSuperAdmin = isSuperAdmin,
            EmailConfirmed = true,
            CreatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, password);
        
        if (result.Succeeded)
        {
            Console.WriteLine($"User {email} created successfully!");
            Console.WriteLine($"Email: {email}");
            Console.WriteLine($"Password: {password}");
            Console.WriteLine($"Role: {(isSuperAdmin ? "Super Admin" : "Operations Admin")}");
        }
        else
        {
            Console.WriteLine($"Failed to create user {email}:");
            foreach (var error in result.Errors)
            {
                Console.WriteLine($"- {error.Description}");
            }
        }
    }
}
