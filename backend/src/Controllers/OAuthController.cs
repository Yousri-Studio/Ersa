using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Text;
using ErsaTraining.API.Services;
using ErsaTraining.API.DTOs;

namespace ErsaTraining.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class OAuthController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly IUserService _userService;
        private readonly IJwtService _jwtService;
        private readonly HttpClient _httpClient;

        public OAuthController(
            IConfiguration configuration, 
            IUserService userService, 
            IJwtService jwtService,
            HttpClient httpClient)
        {
            _configuration = configuration;
            _userService = userService;
            _jwtService = jwtService;
            _httpClient = httpClient;
        }

        [HttpGet("google")]
        public IActionResult GoogleAuth()
        {
            var clientId = _configuration["OAuth:Google:ClientId"];
            var redirectUri = _configuration["OAuth:Google:RedirectUri"];
            
            if (string.IsNullOrEmpty(clientId) || string.IsNullOrEmpty(redirectUri))
            {
                return BadRequest("Google OAuth not configured");
            }

            var authUrl = $"https://accounts.google.com/o/oauth2/v2/auth?" +
                         $"client_id={clientId}&" +
                         $"redirect_uri={Uri.EscapeDataString(redirectUri)}&" +
                         $"response_type=code&" +
                         $"scope=openid email profile&" +
                         $"access_type=offline";

            return Redirect(authUrl);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback(string code, string error)
        {
            if (!string.IsNullOrEmpty(error))
            {
                return Redirect($"{_configuration["Frontend:BaseUrl"]}/auth/login?error=google_auth_failed");
            }

            try
            {
                var tokenResponse = await ExchangeGoogleCode(code);
                var userInfo = await GetGoogleUserInfo(tokenResponse.AccessToken);
                
                var user = await _userService.FindOrCreateGoogleUser(userInfo);
                var token = _jwtService.GenerateToken(user);

                return Redirect($"{_configuration["Frontend:BaseUrl"]}/auth/success?token={token}");
            }
            catch (Exception ex)
            {
                return Redirect($"{_configuration["Frontend:BaseUrl"]}/auth/login?error=google_auth_failed");
            }
        }

        [HttpPost("apple")]
        public async Task<IActionResult> AppleAuth([FromBody] AppleAuthRequest request)
        {
            try
            {
                var isValid = await ValidateAppleToken(request.IdentityToken);
                if (!isValid)
                {
                    return BadRequest("Invalid Apple token");
                }

                var userInfo = DecodeAppleToken(request.IdentityToken);
                var user = await _userService.FindOrCreateAppleUser(userInfo, request.User);
                var token = _jwtService.GenerateToken(user);

                return Ok(new { token, user = new { user.Id, user.FullName, user.Email } });
            }
            catch (Exception ex)
            {
                return BadRequest("Apple authentication failed");
            }
        }

        private async Task<GoogleTokenResponse> ExchangeGoogleCode(string code)
        {
            var tokenUrl = "https://oauth2.googleapis.com/token";
            var requestBody = new
            {
                client_id = _configuration["OAuth:Google:ClientId"],
                client_secret = _configuration["OAuth:Google:ClientSecret"],
                code = code,
                grant_type = "authorization_code",
                redirect_uri = _configuration["OAuth:Google:RedirectUri"]
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(tokenUrl, content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to exchange Google code: {responseContent}");
            }

            return JsonSerializer.Deserialize<GoogleTokenResponse>(responseContent, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });
        }

        private async Task<GoogleUserInfo> GetGoogleUserInfo(string accessToken)
        {
            var userInfoUrl = $"https://www.googleapis.com/oauth2/v2/userinfo?access_token={accessToken}";
            var response = await _httpClient.GetAsync(userInfoUrl);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Failed to get Google user info: {responseContent}");
            }

            return JsonSerializer.Deserialize<GoogleUserInfo>(responseContent, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
            });
        }

        private Task<bool> ValidateAppleToken(string identityToken)
        {
            // Apple token validation logic
            // This is a simplified version - in production, you should validate the JWT signature
            try
            {
                var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
                var token = handler.ReadJwtToken(identityToken);
                
                // Validate issuer
                if (token.Issuer != "https://appleid.apple.com")
                    return Task.FromResult(false);

                // Validate audience
                if (!token.Audiences.Contains(_configuration["OAuth:Apple:ClientId"]))
                    return Task.FromResult(false);

                // Validate expiration
                if (token.ValidTo < DateTime.UtcNow)
                    return Task.FromResult(false);

                return Task.FromResult(true);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }

        private AppleUserInfo DecodeAppleToken(string identityToken)
        {
            var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
            var token = handler.ReadJwtToken(identityToken);

            return new AppleUserInfo
            {
                Sub = token.Claims.FirstOrDefault(c => c.Type == "sub")?.Value,
                Email = token.Claims.FirstOrDefault(c => c.Type == "email")?.Value,
                EmailVerified = bool.Parse(token.Claims.FirstOrDefault(c => c.Type == "email_verified")?.Value ?? "false")
            };
        }
    }

    public class GoogleTokenResponse
    {
        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public string TokenType { get; set; }
        public int ExpiresIn { get; set; }
    }

    public class GoogleUserInfo
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public bool VerifiedEmail { get; set; }
        public string Name { get; set; }
        public string GivenName { get; set; }
        public string FamilyName { get; set; }
        public string Picture { get; set; }
    }

    public class AppleAuthRequest
    {
        public string IdentityToken { get; set; }
        public AppleUser User { get; set; }
    }

    public class AppleUser
    {
        public AppleName Name { get; set; }
        public string Email { get; set; }
    }

    public class AppleName
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class AppleUserInfo
    {
        public string? Sub { get; set; }
        public string? Email { get; set; }
        public bool EmailVerified { get; set; }
    }
}
