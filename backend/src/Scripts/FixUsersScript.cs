using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Utilities;

namespace ErsaTraining.API.Scripts;

public static class FixUsersScript
{
    public static async Task RunAsync()
    {
        var connectionString = "Data Source=ErsaTrainingDB.db";
        var options = new DbContextOptionsBuilder<ErsaTrainingDbContext>()
            .UseSqlite(connectionString)
            .Options;

        // Build service provider
        var services = new Microsoft.Extensions.DependencyInjection.ServiceCollection();
        services.AddDbContext<ErsaTrainingDbContext>(opt => opt.UseSqlite(connectionString));
        services.AddIdentity<User, IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ErsaTrainingDbContext>()
            .AddDefaultTokenProviders();
            
        var serviceProvider = services.BuildServiceProvider();

        await FixUserIdentityFields.FixExistingUsersAsync(serviceProvider);
    }
}
