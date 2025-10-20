using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/secure-download")]
public class SecureDownloadController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<SecureDownloadController> _logger;
    private readonly IWebHostEnvironment _environment;

    public SecureDownloadController(
        ErsaTrainingDbContext context, 
        ILogger<SecureDownloadController> logger,
        IWebHostEnvironment environment)
    {
        _context = context;
        _logger = logger;
        _environment = environment;
    }

    /// <summary>
    /// Download a file using a secure token
    /// </summary>
    [HttpGet("{token}")]
    public async Task<IActionResult> DownloadFile(string token)
    {
        try
        {
            _logger.LogInformation("Download request received for token: {Token}", token);

            // Find the secure link by token
            var secureLink = await _context.SecureLinks
                .Include(sl => sl.Attachment)
                .Include(sl => sl.Enrollment)
                .FirstOrDefaultAsync(sl => sl.Token == token);

            if (secureLink == null)
            {
                _logger.LogWarning("Secure link not found for token: {Token}", token);
                return NotFound(new { error = "Download link not found or expired" });
            }

            // Check if the link is revoked
            if (secureLink.IsRevoked)
            {
                _logger.LogWarning("Attempted to download from revoked link: {Token}", token);
                return BadRequest(new { error = "This download link has been revoked" });
            }

            // Get the file path - BlobPath might be relative or absolute
            var filePath = secureLink.Attachment.BlobPath;
            
            // If it's a relative path, combine with ContentRootPath
            if (!Path.IsPathRooted(filePath))
            {
                filePath = Path.Combine(_environment.ContentRootPath, filePath);
            }

            _logger.LogInformation("Attempting to access file at: {FilePath}", filePath);

            if (!System.IO.File.Exists(filePath))
            {
                _logger.LogError("File not found on disk. Path: {FilePath}, BlobPath: {BlobPath}", 
                    filePath, secureLink.Attachment.BlobPath);
                return NotFound(new { error = "File not found on server" });
            }

            // Update download statistics BEFORE streaming the file
            secureLink.DownloadCount++;
            secureLink.LastDownloadedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Streaming file. Token: {Token}, FileName: {FileName}, DownloadCount: {Count}, FileSize: {Size}", 
                token, 
                secureLink.Attachment.FileName, 
                secureLink.DownloadCount,
                new FileInfo(filePath).Length);

            // Stream the file directly (more efficient for large files)
            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            var contentType = GetContentType(secureLink.Attachment.FileName);

            // Add CORS and download headers
            Response.Headers["Access-Control-Expose-Headers"] = "Content-Disposition";
            Response.Headers["Content-Disposition"] = $"attachment; filename=\"{secureLink.Attachment.FileName}\"";

            // Return the file with proper headers
            return File(fileStream, contentType, secureLink.Attachment.FileName, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file with token: {Token}", token);
            return StatusCode(500, new { error = "Internal server error", details = ex.Message });
        }
    }

    private string GetContentType(string fileName)
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
            ".txt" => "text/plain",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };
    }
}

