using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IJwtService
{
    string GenerateToken(User user);
    bool ValidateToken(string token);
    Guid? GetUserIdFromToken(string token);
}