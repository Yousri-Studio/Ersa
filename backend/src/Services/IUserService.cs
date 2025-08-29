using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.Controllers;

namespace ErsaTraining.API.Services;

public interface IUserService
{
    Task<User> FindOrCreateGoogleUser(GoogleUserInfo googleUser);
    Task<User> FindOrCreateAppleUser(AppleUserInfo appleUser, AppleUser? additionalInfo = null);
}
