using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Services;
using ErsaTraining.API.Authorization;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = PolicyNames.SuperAdminOnly)]
public class RoleController : ControllerBase
{
    private readonly RoleService _roleService;
    private readonly UserManager<User> _userManager;
    private readonly ILogger<RoleController> _logger;

    public RoleController(
        RoleService roleService,
        UserManager<User> userManager,
        ILogger<RoleController> logger)
    {
        _roleService = roleService;
        _userManager = userManager;
        _logger = logger;
    }

    [HttpGet("roles")]
    public async Task<ActionResult<List<IdentityRole<Guid>>>> GetAllRoles()
    {
        try
        {
            var roles = await _roleService.GetAllRolesAsync();
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all roles");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("user/{email}/roles")]
    public async Task<ActionResult<List<string>>> GetUserRoles(string email)
    {
        try
        {
            var roles = await _roleService.GetUserRolesAsync(email);
            return Ok(roles);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user roles for {Email}", email);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("user/{email}/role/{roleName}")]
    public async Task<ActionResult> AssignUserToRole(string email, string roleName)
    {
        try
        {
            // Validate role name
            if (!IsValidRoleName(roleName))
            {
                return BadRequest(new { error = $"Invalid role name: {roleName}" });
            }

            await _roleService.AssignUserToRoleAsync(email, roleName);
            return Ok(new { message = $"User {email} assigned to role {roleName} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error assigning user {Email} to role {RoleName}", email, roleName);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpDelete("user/{email}/role/{roleName}")]
    public async Task<ActionResult> RemoveUserFromRole(string email, string roleName)
    {
        try
        {
            // Validate role name
            if (!IsValidRoleName(roleName))
            {
                return BadRequest(new { error = $"Invalid role name: {roleName}" });
            }

            await _roleService.RemoveUserFromRoleAsync(email, roleName);
            return Ok(new { message = $"User {email} removed from role {roleName} successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing user {Email} from role {RoleName}", email, roleName);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("user/{email}/has-role/{roleName}")]
    public async Task<ActionResult<bool>> CheckUserRole(string email, string roleName)
    {
        try
        {
            var hasRole = await _roleService.IsUserInRoleAsync(email, roleName);
            return Ok(hasRole);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking user role for {Email} and role {RoleName}", email, roleName);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("seed")]
    public async Task<ActionResult> SeedRoles()
    {
        try
        {
            await _roleService.SeedRolesAsync();
            return Ok(new { message = "Roles seeded successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error seeding roles");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private bool IsValidRoleName(string roleName)
    {
        var validRoles = new[] { RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Operation, RoleNames.PublicUser };
        return validRoles.Contains(roleName);
    }
}

// DTOs for role management
public class AssignRoleRequest
{
    public string Email { get; set; } = string.Empty;
    public string RoleName { get; set; } = string.Empty;
}
