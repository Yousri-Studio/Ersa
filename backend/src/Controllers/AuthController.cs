using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;
using ErsaTraining.API.Authorization;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly SignInManager<User> _signInManager;
    private readonly IJwtService _jwtService;
    private readonly IEmailService _emailService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        UserManager<User> userManager,
        SignInManager<User> signInManager,
        IJwtService jwtService,
        IEmailService emailService,
        ILogger<AuthController> logger)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _jwtService = jwtService;
        _emailService = emailService;
        _logger = logger;
    }

    [HttpPost("register")]
    public async Task<ActionResult<object>> Register([FromBody] RegisterRequest request)
    {
        try
        {
            // Check if user already exists
            var existingUser = await _userManager.FindByEmailAsync(request.Email);
            if (existingUser != null)
            {
                return BadRequest(new { error = "User with this email already exists" });
            }

            var user = new User
            {
                Id = Guid.NewGuid(),
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                Locale = request.Locale,
                CreatedAt = DateTime.UtcNow,
                Status = UserStatus.PendingEmailVerification,
                EmailConfirmed = false
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            
            if (!result.Succeeded)
            {
                return BadRequest(new { error = string.Join(", ", result.Errors.Select(e => e.Description)) });
            }

            // Assign PublicUser role to all new registrations
            try
            {
                await _userManager.AddToRoleAsync(user, RoleNames.PublicUser);
                _logger.LogInformation("User {Email} registered and assigned PublicUser role", user.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to assign PublicUser role to user {UserId}", user.Id);
                // Don't fail registration if role assignment fails
            }

            // Generate verification token and send verification email
            var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            
            // Send email synchronously to avoid DbContext disposal issues
            try
            {
                await _emailService.SendEmailVerificationAsync(user, verificationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send verification email to user {UserId}", user.Id);
                // Don't fail registration if email sending fails
            }
            
            return Ok(new { message = "Registration successful. Please check your email for verification instructions." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user registration");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { error = "Invalid email or password" });
            }

            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);
            
            if (!result.Succeeded)
            {
                if (result.IsLockedOut)
                {
                    return BadRequest(new { error = "Account is locked out" });
                }
                
                return BadRequest(new { error = "Invalid email or password" });
            }

            if (user.Status == UserStatus.PendingEmailVerification)
            {
                return BadRequest(new { error = "Please verify your email address before logging in" });
            }
            
            if (user.Status != UserStatus.Active)
            {
                return BadRequest(new { error = "Account is inactive" });
            }

            // Update last login time
            user.LastLoginAt = DateTime.UtcNow;
            await _userManager.UpdateAsync(user);

            var token = await _jwtService.GenerateTokenAsync(user);
            
            return Ok(new LoginResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email!,
                    Phone = user.Phone,
                    Locale = user.Locale,
                    CreatedAt = user.CreatedAt,
                    IsAdmin = user.IsAdmin,
                    IsSuperAdmin = user.IsSuperAdmin,
                    LastLoginAt = user.LastLoginAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user login");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("refresh-token"),HttpGet("refresh-token")]
    public async Task<ActionResult<LoginResponse>> RefreshToken()
    {
        try
        {
            var authHeader = Request.Headers.Authorization.FirstOrDefault();
            if (string.IsNullOrEmpty(authHeader) || !authHeader.StartsWith("Bearer "))
            {
                _logger.LogWarning("Refresh token attempted without valid Authorization header");
                return Unauthorized(new { error = "Invalid token" });
            }

            var token = authHeader.Substring("Bearer ".Length).Trim();
            
            // Validate token is not empty or just whitespace
            if (string.IsNullOrWhiteSpace(token))
            {
                _logger.LogWarning("Refresh token attempted with empty token");
                return Unauthorized(new { error = "Invalid token" });
            }

            var userId = _jwtService.GetUserIdFromToken(token);
            
            if (userId == null)
            {
                _logger.LogWarning("Refresh token failed: Unable to extract user ID from token");
                return Unauthorized(new { error = "Invalid token" });
            }

            var user = await _userManager.FindByIdAsync(userId.ToString()!);
            if (user == null)
            {
                _logger.LogWarning("Refresh token failed: User {UserId} not found", userId);
                return Unauthorized(new { error = "User not found" });
            }
            
            if (user.Status != UserStatus.Active)
            {
                _logger.LogWarning("Refresh token failed: User {UserId} is not active (Status: {Status})", userId, user.Status);
                return Unauthorized(new { error = "User account is not active" });
            }

            // Generate new token
            var newToken = await _jwtService.GenerateTokenAsync(user);
            
            _logger.LogInformation("Token refreshed successfully for user {UserId}", userId);
            
            return Ok(new LoginResponse
            {
                Token = newToken,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email!,
                    Phone = user.Phone,
                    Locale = user.Locale,
                    CreatedAt = user.CreatedAt,
                    IsAdmin = user.IsAdmin,
                    IsSuperAdmin = user.IsSuperAdmin,
                    LastLoginAt = user.LastLoginAt
                }
            });
        }
        catch (Exception ex)
        {
            // Log the actual error but don't expose it to client for security
            _logger.LogError(ex, "Unexpected error during token refresh");
            // Return 401 instead of 500 - token refresh failures should be treated as auth failures
            return Unauthorized(new { error = "Token refresh failed" });
        }
    }

    [HttpPost("verify-email")]
    public async Task<ActionResult<LoginResponse>> VerifyEmail([FromBody] VerifyEmailRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { error = "Email is already verified" });
            }

            var result = await _userManager.ConfirmEmailAsync(user, request.Code);
            if (!result.Succeeded)
            {
                return BadRequest(new { error = "Invalid verification code" });
            }

            // Update user status to active
            user.Status = UserStatus.Active;
            await _userManager.UpdateAsync(user);

            // Generate token and return login response
            var token = await _jwtService.GenerateTokenAsync(user);
            
            return Ok(new LoginResponse
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    FullName = user.FullName,
                    Email = user.Email!,
                    Phone = user.Phone,
                    Locale = user.Locale,
                    CreatedAt = user.CreatedAt
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during email verification");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("resend-verification")]
    public async Task<ActionResult<object>> ResendVerification([FromBody] ResendVerificationRequest request)
    {
        try
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
            {
                return BadRequest(new { error = "User not found" });
            }

            if (user.EmailConfirmed)
            {
                return BadRequest(new { error = "Email is already verified" });
            }

            // Generate new verification token
            var verificationToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            
            // Send email synchronously to avoid DbContext disposal issues
            try
            {
                await _emailService.SendEmailVerificationAsync(user, verificationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to user {UserId}", user.Id);
                // Don't fail the request if email sending fails
            }
            
            return Ok(new { message = "Verification email sent successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during resending verification email");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }
}