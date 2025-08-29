using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/secure")]
public class SecureController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly ILogger<SecureController> _logger;

    public SecureController(
        ErsaTrainingDbContext context,
        IFileStorageService fileStorageService,
        ILogger<SecureController> logger)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _logger = logger;
    }

    [HttpGet("materials/{token}")]
    public async Task<IActionResult> DownloadMaterial(string token)
    {
        try
        {
            var secureLink = await _context.SecureLinks
                .Include(sl => sl.Attachment)
                .Include(sl => sl.Enrollment)
                    .ThenInclude(e => e.User)
                .FirstOrDefaultAsync(sl => sl.Token == token);

            if (secureLink == null)
            {
                return NotFound(new { error = "Invalid or expired link" });
            }

            if (secureLink.IsRevoked)
            {
                return BadRequest(new { error = "Link has been revoked" });
            }

            if (secureLink.Attachment.IsRevoked)
            {
                return BadRequest(new { error = "File is no longer available" });
            }

            // Check if enrollment is still valid
            if (secureLink.Enrollment.Status != Data.Entities.EnrollmentStatus.Paid && 
                secureLink.Enrollment.Status != Data.Entities.EnrollmentStatus.Notified &&
                secureLink.Enrollment.Status != Data.Entities.EnrollmentStatus.Completed)
            {
                return BadRequest(new { error = "Access denied" });
            }

            // Download file from storage
            var fileStream = await _fileStorageService.DownloadFileAsync(secureLink.Attachment.BlobPath);
            if (fileStream == null)
            {
                _logger.LogError("File not found in storage: {BlobPath}", secureLink.Attachment.BlobPath);
                return NotFound(new { error = "File not found" });
            }

            // Log download
            secureLink.LastDownloadedAt = DateTime.UtcNow;
            secureLink.DownloadCount++;
            await _context.SaveChangesAsync();

            // Determine content type
            var contentType = GetContentType(secureLink.Attachment.FileName);
            
            // Return file
            return File(fileStream, contentType, secureLink.Attachment.FileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading material with token {Token}", token);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("materials/{token}/info")]
    public async Task<IActionResult> GetMaterialInfo(string token)
    {
        try
        {
            var secureLink = await _context.SecureLinks
                .Include(sl => sl.Attachment)
                .Include(sl => sl.Enrollment)
                    .ThenInclude(e => e.Course)
                .FirstOrDefaultAsync(sl => sl.Token == token);

            if (secureLink == null)
            {
                return NotFound(new { error = "Invalid or expired link" });
            }

            if (secureLink.IsRevoked || secureLink.Attachment.IsRevoked)
            {
                return BadRequest(new { error = "Link or file has been revoked" });
            }

            var fileSize = await _fileStorageService.GetFileSizeAsync(secureLink.Attachment.BlobPath);

            var info = new
            {
                FileName = secureLink.Attachment.FileName,
                FileSize = fileSize,
                FileType = secureLink.Attachment.Type.ToString(),
                CourseName = new
                {
                    Ar = secureLink.Enrollment.Course.TitleAr,
                    En = secureLink.Enrollment.Course.TitleEn
                },
                DownloadCount = secureLink.DownloadCount,
                LastDownloaded = secureLink.LastDownloadedAt,
                CreatedAt = secureLink.CreatedAt
            };

            return Ok(info);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting material info for token {Token}", token);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private static string GetContentType(string fileName)
    {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch
        {
            ".pdf" => "application/pdf",
            ".doc" => "application/msword",
            ".docx" => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".xls" => "application/vnd.ms-excel",
            ".xlsx" => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            ".ppt" => "application/vnd.ms-powerpoint",
            ".pptx" => "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            ".zip" => "application/zip",
            ".rar" => "application/x-rar-compressed",
            ".mp4" => "video/mp4",
            ".avi" => "video/x-msvideo",
            ".mov" => "video/quicktime",
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".txt" => "text/plain",
            _ => "application/octet-stream"
        };
    }
}