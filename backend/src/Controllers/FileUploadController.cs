using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
public class FileUploadController : ControllerBase
{
    private readonly ILogger<FileUploadController> _logger;
    private const int MaxFileSize = 5 * 1024 * 1024; // 5MB
    private readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };

    public FileUploadController(ILogger<FileUploadController> logger)
    {
        _logger = logger;
    }

    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file provided" });
            }

            if (file.Length > MaxFileSize)
            {
                return BadRequest(new { error = $"File size exceeds maximum limit of {MaxFileSize / (1024 * 1024)}MB" });
            }

            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!AllowedExtensions.Contains(extension))
            {
                return BadRequest(new { error = "Invalid file type. Only image files are allowed." });
            }

            using var memoryStream = new MemoryStream();
            await file.CopyToAsync(memoryStream);
            var fileBytes = memoryStream.ToArray();

            return Ok(new { 
                data = fileBytes,
                fileName = file.FileName,
                contentType = file.ContentType,
                size = file.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("convert-base64")]
    public IActionResult ConvertBase64ToBytes([FromBody] Base64ImageRequest request)
    {
        try
        {
            if (string.IsNullOrEmpty(request.Base64Data))
            {
                return BadRequest(new { error = "No base64 data provided" });
            }

            // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
            var base64Data = request.Base64Data;
            if (base64Data.Contains(","))
            {
                base64Data = base64Data.Split(',')[1];
            }

            var fileBytes = Convert.FromBase64String(base64Data);

            if (fileBytes.Length > MaxFileSize)
            {
                return BadRequest(new { error = $"File size exceeds maximum limit of {MaxFileSize / (1024 * 1024)}MB" });
            }

            return Ok(new { 
                data = fileBytes,
                size = fileBytes.Length
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error converting base64 to bytes");
            return BadRequest(new { error = "Invalid base64 data" });
        }
    }
}

public class Base64ImageRequest
{
    public string Base64Data { get; set; } = string.Empty;
}
