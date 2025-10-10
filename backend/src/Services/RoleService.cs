using Microsoft.AspNetCore.Identity;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public static class RoleNames
{
    public const string SuperAdmin = "SuperAdmin";
    public const string Admin = "Admin";
    public const string Operation = "Operation";
    public const string PublicUser = "PublicUser";
}

public class RoleService
{
    private readonly RoleManager<IdentityRole<Guid>> _roleManager;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<RoleService> _logger;

    public RoleService(
        RoleManager<IdentityRole<Guid>> roleManager,
        UserManager<User> userManager,
        ILogger<RoleService> logger)
    {
        _roleManager = roleManager;
        _userManager = userManager;
        _logger = logger;
    }

    public async Task SeedRolesAsync()
    {
        var roles = new[]
        {
            RoleNames.SuperAdmin,
            RoleNames.Admin,
            RoleNames.Operation,
            RoleNames.PublicUser
        };

        foreach (var role in roles)
        {
            if (!await _roleManager.RoleExistsAsync(role))
            {
                var identityRole = new IdentityRole<Guid>(role)
                {
                    Id = Guid.NewGuid()
                };

                var result = await _roleManager.CreateAsync(identityRole);
                if (result.Succeeded)
                {
                    _logger.LogInformation("Role '{Role}' created successfully", role);
                }
                else
                {
                    _logger.LogError("Failed to create role '{Role}': {Errors}", 
                        role, string.Join(", ", result.Errors.Select(e => e.Description)));
                }
            }
            else
            {
                _logger.LogInformation("Role '{Role}' already exists", role);
            }
        }
    }

    public async Task AssignUserToRoleAsync(string userEmail, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            _logger.LogWarning("User with email '{Email}' not found", userEmail);
            return;
        }

        var isInRole = await _userManager.IsInRoleAsync(user, roleName);
        if (!isInRole)
        {
            var result = await _userManager.AddToRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                _logger.LogInformation("User '{Email}' assigned to role '{Role}' successfully", userEmail, roleName);
            }
            else
            {
                _logger.LogError("Failed to assign user '{Email}' to role '{Role}': {Errors}", 
                    userEmail, roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            _logger.LogInformation("User '{Email}' is already in role '{Role}'", userEmail, roleName);
        }
    }

    public async Task<List<string>> GetUserRolesAsync(string userEmail)
    {
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            _logger.LogWarning("User with email '{Email}' not found", userEmail);
            return new List<string>();
        }

        var roles = await _userManager.GetRolesAsync(user);
        return roles.ToList();
    }

    public async Task<bool> IsUserInRoleAsync(string userEmail, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            return false;
        }

        return await _userManager.IsInRoleAsync(user, roleName);
    }

    public async Task RemoveUserFromRoleAsync(string userEmail, string roleName)
    {
        var user = await _userManager.FindByEmailAsync(userEmail);
        if (user == null)
        {
            _logger.LogWarning("User with email '{Email}' not found", userEmail);
            return;
        }

        var isInRole = await _userManager.IsInRoleAsync(user, roleName);
        if (isInRole)
        {
            var result = await _userManager.RemoveFromRoleAsync(user, roleName);
            if (result.Succeeded)
            {
                _logger.LogInformation("User '{Email}' removed from role '{Role}' successfully", userEmail, roleName);
            }
            else
            {
                _logger.LogError("Failed to remove user '{Email}' from role '{Role}': {Errors}", 
                    userEmail, roleName, string.Join(", ", result.Errors.Select(e => e.Description)));
            }
        }
        else
        {
            _logger.LogInformation("User '{Email}' is not in role '{Role}'", userEmail, roleName);
        }
    }

    public async Task<List<IdentityRole<Guid>>> GetAllRolesAsync()
    {
        return _roleManager.Roles.ToList();
    }
}
