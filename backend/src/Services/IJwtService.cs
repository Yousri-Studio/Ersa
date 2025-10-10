using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IJwtService
{
    Task<string> GenerateTokenAsync(User user);
    string GenerateToken(User user); // Keep for backward compatibility
    bool ValidateToken(string token);
    Guid? GetUserIdFromToken(string token);
}