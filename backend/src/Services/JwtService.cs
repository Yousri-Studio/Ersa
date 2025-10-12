using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public class JwtService : IJwtService
{
    private readonly IConfiguration _configuration;
    private readonly UserManager<User> _userManager;
    private readonly string _secretKey;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _clockSkewMinutes;

    public JwtService(IConfiguration configuration, UserManager<User> userManager)
    {
        _configuration = configuration;
        _userManager = userManager;
        _secretKey = _configuration["Jwt:SecretKey"] ?? throw new InvalidOperationException("JWT SecretKey is not configured");
        _issuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer is not configured");
        _audience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience is not configured");
        _clockSkewMinutes = _configuration.GetValue<int>("Jwt:ClockSkewMinutes", 5);
    }

    public async Task<string> GenerateTokenAsync(User user)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_secretKey);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.Name, user.FullName),
            new("locale", user.Locale),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
        };

        // Get user roles from UserManager
        var roles = await _userManager.GetRolesAsync(user);
        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        // Keep backward compatibility with boolean properties
        if (user.IsSuperAdmin && !roles.Contains("SuperAdmin"))
        {
            claims.Add(new Claim(ClaimTypes.Role, "SuperAdmin"));
        }
        if (user.IsAdmin && !roles.Contains("Admin"))
        {
            claims.Add(new Claim(ClaimTypes.Role, "Admin"));
        }

        // Determine expiration based on user role
        DateTime expiration;
        var isAdminUser = user.IsAdmin || user.IsSuperAdmin || 
                         roles.Contains("Admin") || roles.Contains("SuperAdmin");
        
        if (isAdminUser)
        {
            // Admin users: Use configured admin expiration (default 8 hours)
            var adminExpirationHours = _configuration.GetValue<int>("Jwt:AdminExpirationInHours", 8);
            expiration = DateTime.UtcNow.AddHours(adminExpirationHours);
        }
        else
        {
            // Regular users: Use configured expiration (default 7 days)
            var expirationDays = _configuration.GetValue<int>("Jwt:ExpirationInDays", 7);
            expiration = DateTime.UtcNow.AddDays(expirationDays);
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration,
            Issuer = _issuer,
            Audience = _audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    // Backward compatibility method
    public string GenerateToken(User user)
    {
        return GenerateTokenAsync(user).GetAwaiter().GetResult();
    }

    public bool ValidateToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_secretKey);

            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _issuer,
                ValidateAudience = true,
                ValidAudience = _audience,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(_clockSkewMinutes) // Use configured clock skew
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }

    public Guid? GetUserIdFromToken(string token)
    {
        try
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jsonToken = tokenHandler.ReadJwtToken(token);
            var userIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
            
            if (userIdClaim != null && Guid.TryParse(userIdClaim.Value, out var userId))
            {
                return userId;
            }

            return null;
        }
        catch
        {
            return null;
        }
    }
}