using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Controllers;

namespace ErsaTraining.API.Services;

public class UserService : IUserService
{
    private readonly UserManager<User> _userManager;
    private readonly ILogger<UserService> _logger;

    public UserService(UserManager<User> userManager, ILogger<UserService> logger)
    {
        _userManager = userManager;
        _logger = logger;
    }

    public async Task<User> FindOrCreateGoogleUser(GoogleUserInfo googleUser)
    {
        try
        {
            // First, try to find user by email
            var existingUser = await _userManager.FindByEmailAsync(googleUser.Email);
            
            if (existingUser != null)
            {
                _logger.LogInformation("Found existing user for Google login: {Email}", googleUser.Email);
                return existingUser;
            }

            // Create new user
            var newUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = googleUser.Email,
                Email = googleUser.Email,
                EmailConfirmed = googleUser.VerifiedEmail,
                FullName = googleUser.Name ?? $"{googleUser.GivenName} {googleUser.FamilyName}".Trim(),
                Locale = "ar", // Default to Arabic
                CreatedAt = DateTime.UtcNow,
                Status = UserStatus.Active
            };

            var result = await _userManager.CreateAsync(newUser);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create Google user: {Errors}", errors);
                throw new Exception($"Failed to create user: {errors}");
            }

            _logger.LogInformation("Created new user from Google login: {Email}", googleUser.Email);
            return newUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in FindOrCreateGoogleUser for email: {Email}", googleUser.Email);
            throw;
        }
    }

    public async Task<User> FindOrCreateAppleUser(AppleUserInfo appleUser, AppleUser? additionalInfo = null)
    {
        try
        {
            // First, try to find user by email
            var existingUser = await _userManager.FindByEmailAsync(appleUser.Email);
            
            if (existingUser != null)
            {
                _logger.LogInformation("Found existing user for Apple login: {Email}", appleUser.Email);
                return existingUser;
            }

            // Create new user
            var fullName = "Apple User"; // Default name
            if (additionalInfo?.Name != null)
            {
                fullName = $"{additionalInfo.Name.FirstName} {additionalInfo.Name.LastName}".Trim();
            }

            var newUser = new User
            {
                Id = Guid.NewGuid(),
                UserName = appleUser.Email,
                Email = appleUser.Email,
                EmailConfirmed = appleUser.EmailVerified,
                FullName = fullName,
                Locale = "ar", // Default to Arabic
                CreatedAt = DateTime.UtcNow,
                Status = UserStatus.Active
            };

            var result = await _userManager.CreateAsync(newUser);
            
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogError("Failed to create Apple user: {Errors}", errors);
                throw new Exception($"Failed to create user: {errors}");
            }

            _logger.LogInformation("Created new user from Apple login: {Email}", appleUser.Email);
            return newUser;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in FindOrCreateAppleUser for email: {Email}", appleUser.Email);
            throw;
        }
    }
}
