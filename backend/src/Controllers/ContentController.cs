using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;


namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize(Roles = "Admin,SuperAdmin")]
public class ContentController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<ContentController> _logger;
    private readonly IFileStorageService _fileService;

    public ContentController(
        ErsaTrainingDbContext context,
        ILogger<ContentController> logger,
        IFileStorageService fileService)
    {
        _context = context;
        _logger = logger;
        _fileService = fileService;
    }

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        return userIdClaim != null ? Guid.Parse(userIdClaim.Value) : Guid.Empty;
    }

    // Content Pages
    [HttpGet("pages")]
    public async Task<ActionResult<List<ContentPageDto>>> GetContentPages()
    {
        try
        {
            var pages = await _context.ContentPages
                .Include(p => p.Sections)
                .ThenInclude(s => s.Blocks)
                .OrderBy(p => p.PageName)
                .AsSplitQuery()
                .ToListAsync();

            var pageDtos = pages.Select(p => new ContentPageDto
            {
                Id = p.Id,
                PageKey = p.PageKey,
                PageName = p.PageName,
                Description = p.Description,
                IsActive = p.IsActive,
                CreatedAt = p.CreatedAt,
                UpdatedAt = p.UpdatedAt,
                Sections = p.Sections
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new ContentSectionDto
                    {
                        Id = s.Id,
                        ContentPageId = s.ContentPageId,
                        SectionKey = s.SectionKey,
                        SectionName = s.SectionName,
                        Description = s.Description,
                        SortOrder = s.SortOrder,
                        IsActive = s.IsActive,
                        CreatedAt = s.CreatedAt,
                        UpdatedAt = s.UpdatedAt,
                        Blocks = s.Blocks
                            .Where(b => b.IsActive)
                            .OrderBy(b => b.SortOrder)
                            .Select(b => new ContentBlockDto
                            {
                                Id = b.Id,
                                ContentSectionId = b.ContentSectionId,
                                BlockKey = b.BlockKey,
                                BlockName = b.BlockName,
                                BlockType = b.BlockType,
                                ContentEn = b.ContentEn,
                                ContentAr = b.ContentAr,
                                ImageUrl = b.ImageUrl,
                                LinkUrl = b.LinkUrl,
                                LinkText = b.LinkText,
                                SortOrder = b.SortOrder,
                                IsActive = b.IsActive,
                                CreatedAt = b.CreatedAt,
                                UpdatedAt = b.UpdatedAt
                            }).ToList()
                    }).ToList()
            }).ToList();

            return Ok(pageDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content pages");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("pages/{pageKey}")]
    public async Task<ActionResult<PageContentDto>> GetPageContent(string pageKey)
    {
        try
        {
            var page = await _context.ContentPages
                .Include(p => p.Sections)
                .ThenInclude(s => s.Blocks)
                .AsSplitQuery()
                .FirstOrDefaultAsync(p => p.PageKey == pageKey && p.IsActive);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            var pageContent = new PageContentDto
            {
                PageKey = page.PageKey,
                PageName = page.PageName,
                Sections = page.Sections
                    .Where(s => s.IsActive)
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new SectionContentDto
                    {
                        SectionKey = s.SectionKey,
                        SectionName = s.SectionName,
                        SortOrder = s.SortOrder,
                        Blocks = s.Blocks
                            .Where(b => b.IsActive)
                            .OrderBy(b => b.SortOrder)
                            .Select(b => new BlockContentDto
                            {
                                BlockKey = b.BlockKey,
                                BlockName = b.BlockName,
                                BlockType = b.BlockType,
                                ContentEn = b.ContentEn,
                                ContentAr = b.ContentAr,
                                ImageUrl = b.ImageUrl,
                                LinkUrl = b.LinkUrl,
                                LinkText = b.LinkText,
                                SortOrder = b.SortOrder
                            }).ToList()
                    }).ToList()
            };

            return Ok(pageContent);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting page content for {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("pages")]
    public async Task<ActionResult<ContentPageDto>> CreateContentPage([FromBody] CreateContentPageRequest request)
    {
        try
        {
            var existingPage = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == request.PageKey);

            if (existingPage != null)
            {
                return BadRequest(new { error = "Page key already exists" });
            }

            var page = new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = request.PageKey,
                PageName = request.PageName,
                Description = request.Description,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContentPages.Add(page);
            await _context.SaveChangesAsync();

            var pageDto = new ContentPageDto
            {
                Id = page.Id,
                PageKey = page.PageKey,
                PageName = page.PageName,
                Description = page.Description,
                IsActive = page.IsActive,
                CreatedAt = page.CreatedAt,
                UpdatedAt = page.UpdatedAt,
                Sections = new List<ContentSectionDto>()
            };

            return CreatedAtAction(nameof(GetPageContent), new { pageKey = page.PageKey }, pageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating content page");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("pages/{pageKey}")]
    public async Task<ActionResult<ContentPageDto>> UpdateContentPage(string pageKey, [FromBody] UpdateContentPageRequest request)
    {
        try
        {
            var page = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == pageKey);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            page.PageName = request.PageName;
            page.Description = request.Description;
            page.IsActive = request.IsActive;
            page.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var pageDto = new ContentPageDto
            {
                Id = page.Id,
                PageKey = page.PageKey,
                PageName = page.PageName,
                Description = page.Description,
                IsActive = page.IsActive,
                CreatedAt = page.CreatedAt,
                UpdatedAt = page.UpdatedAt,
                Sections = new List<ContentSectionDto>()
            };

            return Ok(pageDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content page {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Content Sections
    [HttpPost("pages/{pageKey}/sections")]
    public async Task<ActionResult<ContentSectionDto>> CreateContentSection(string pageKey, [FromBody] CreateContentSectionRequest request)
    {
        try
        {
            var page = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == pageKey);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            var existingSection = await _context.ContentSections
                .FirstOrDefaultAsync(s => s.ContentPageId == page.Id && s.SectionKey == request.SectionKey);

            if (existingSection != null)
            {
                return BadRequest(new { error = "Section key already exists for this page" });
            }

            var section = new ContentSection
            {
                Id = Guid.NewGuid(),
                ContentPageId = page.Id,
                SectionKey = request.SectionKey,
                SectionName = request.SectionName,
                Description = request.Description,
                SortOrder = request.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContentSections.Add(section);
            await _context.SaveChangesAsync();

            var sectionDto = new ContentSectionDto
            {
                Id = section.Id,
                ContentPageId = section.ContentPageId,
                SectionKey = section.SectionKey,
                SectionName = section.SectionName,
                Description = section.Description,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive,
                CreatedAt = section.CreatedAt,
                UpdatedAt = section.UpdatedAt,
                Blocks = new List<ContentBlockDto>()
            };

            return Ok(sectionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating content section for page {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("sections/{sectionId}")]
    public async Task<ActionResult<ContentSectionDto>> UpdateContentSection(Guid sectionId, [FromBody] UpdateContentSectionRequest request)
    {
        try
        {
            var section = await _context.ContentSections
                .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
            {
                return NotFound(new { error = "Section not found" });
            }

            section.SectionName = request.SectionName;
            section.Description = request.Description;
            section.SortOrder = request.SortOrder;
            section.IsActive = request.IsActive;
            section.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var sectionDto = new ContentSectionDto
            {
                Id = section.Id,
                ContentPageId = section.ContentPageId,
                SectionKey = section.SectionKey,
                SectionName = section.SectionName,
                Description = section.Description,
                SortOrder = section.SortOrder,
                IsActive = section.IsActive,
                CreatedAt = section.CreatedAt,
                UpdatedAt = section.UpdatedAt,
                Blocks = new List<ContentBlockDto>()
            };

            return Ok(sectionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content section {SectionId}", sectionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Content Blocks
    [HttpPost("sections/{sectionId}/blocks")]
    public async Task<ActionResult<ContentBlockDto>> CreateContentBlock(Guid sectionId, [FromBody] CreateContentBlockRequest request)
    {
        try
        {
            var section = await _context.ContentSections
                .FirstOrDefaultAsync(s => s.Id == sectionId);

            if (section == null)
            {
                return NotFound(new { error = "Section not found" });
            }

            var existingBlock = await _context.ContentBlocks
                .FirstOrDefaultAsync(b => b.ContentSectionId == sectionId && b.BlockKey == request.BlockKey);

            if (existingBlock != null)
            {
                return BadRequest(new { error = "Block key already exists for this section" });
            }

            var block = new ContentBlock
            {
                Id = Guid.NewGuid(),
                ContentSectionId = sectionId,
                BlockKey = request.BlockKey,
                BlockName = request.BlockName,
                BlockType = request.BlockType,
                ContentEn = request.ContentEn,
                ContentAr = request.ContentAr,
                ImageUrl = request.ImageUrl,
                LinkUrl = request.LinkUrl,
                LinkText = request.LinkText,
                SortOrder = request.SortOrder,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContentBlocks.Add(block);
            await _context.SaveChangesAsync();

            var blockDto = new ContentBlockDto
            {
                Id = block.Id,
                ContentSectionId = block.ContentSectionId,
                BlockKey = block.BlockKey,
                BlockName = block.BlockName,
                BlockType = block.BlockType,
                ContentEn = block.ContentEn,
                ContentAr = block.ContentAr,
                ImageUrl = block.ImageUrl,
                LinkUrl = block.LinkUrl,
                LinkText = block.LinkText,
                SortOrder = block.SortOrder,
                IsActive = block.IsActive,
                CreatedAt = block.CreatedAt,
                UpdatedAt = block.UpdatedAt
            };

            return Ok(blockDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating content block for section {SectionId}", sectionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("blocks/{blockId}")]
    public async Task<ActionResult<ContentBlockDto>> UpdateContentBlock(Guid blockId, [FromBody] UpdateContentBlockRequest request)
    {
        try
        {
            var block = await _context.ContentBlocks
                .FirstOrDefaultAsync(b => b.Id == blockId);

            if (block == null)
            {
                return NotFound(new { error = "Block not found" });
            }

            block.BlockName = request.BlockName;
            block.ContentEn = request.ContentEn;
            block.ContentAr = request.ContentAr;
            block.ImageUrl = request.ImageUrl;
            block.LinkUrl = request.LinkUrl;
            block.LinkText = request.LinkText;
            block.SortOrder = request.SortOrder;
            block.IsActive = request.IsActive;
            block.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var blockDto = new ContentBlockDto
            {
                Id = block.Id,
                ContentSectionId = block.ContentSectionId,
                BlockKey = block.BlockKey,
                BlockName = block.BlockName,
                BlockType = block.BlockType,
                ContentEn = block.ContentEn,
                ContentAr = block.ContentAr,
                ImageUrl = block.ImageUrl,
                LinkUrl = block.LinkUrl,
                LinkText = block.LinkText,
                SortOrder = block.SortOrder,
                IsActive = block.IsActive,
                CreatedAt = block.CreatedAt,
                UpdatedAt = block.UpdatedAt
            };

            return Ok(blockDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating content block {BlockId}", blockId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // File Upload
    [HttpPost("upload")]
    public async Task<ActionResult<FileUploadResponse>> UploadFile(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest(new { error = "No file provided" });
            }

            // Validate file type
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/gif", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
            {
                return BadRequest(new { error = "Invalid file type. Only images are allowed." });
            }

            // Validate file size (5MB max)
            if (file.Length > 5 * 1024 * 1024)
            {
                return BadRequest(new { error = "File size too large. Maximum size is 5MB." });
            }

            var fileName = $"{Guid.NewGuid()}_{file.FileName}";
            var fileUrl = await _fileService.UploadFileAsync(file.OpenReadStream(), fileName, file.ContentType);

            var response = new FileUploadResponse
            {
                FileName = fileName,
                FileUrl = fileUrl,
                FileSize = file.Length,
                ContentType = file.ContentType
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Content Versions
    [HttpGet("pages/{pageKey}/versions")]
    public async Task<ActionResult<List<ContentVersionDto>>> GetPageVersions(string pageKey)
    {
        try
        {
            var page = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == pageKey);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            var versions = await _context.ContentVersions
                .Where(v => v.ContentPageId == page.Id)
                .OrderByDescending(v => v.CreatedAt)
                .ToListAsync();

            var versionDtos = versions.Select(v => new ContentVersionDto
            {
                Id = v.Id,
                ContentPageId = v.ContentPageId,
                VersionName = v.VersionName,
                ContentData = v.ContentData,
                IsPublished = v.IsPublished,
                CreatedAt = v.CreatedAt,
                CreatedBy = v.CreatedBy
            }).ToList();

            return Ok(versionDtos);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting page versions for {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("pages/{pageKey}/versions")]
    public async Task<ActionResult<ContentVersionDto>> CreatePageVersion(string pageKey, [FromBody] CreateContentVersionRequest request)
    {
        try
        {
            var page = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == pageKey);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            var version = new ContentVersion
            {
                Id = Guid.NewGuid(),
                ContentPageId = page.Id,
                VersionName = request.VersionName,
                ContentData = request.ContentData,
                IsPublished = request.IsPublished,
                CreatedAt = DateTime.UtcNow,
                CreatedBy = GetCurrentUserId()
            };

            _context.ContentVersions.Add(version);
            await _context.SaveChangesAsync();

            var versionDto = new ContentVersionDto
            {
                Id = version.Id,
                ContentPageId = version.ContentPageId,
                VersionName = version.VersionName,
                ContentData = version.ContentData,
                IsPublished = version.IsPublished,
                CreatedAt = version.CreatedAt,
                CreatedBy = version.CreatedBy
            };

            return Ok(versionDto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating page version for {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("versions/{versionId}/publish")]
    public async Task<ActionResult> PublishVersion(Guid versionId)
    {
        try
        {
            var version = await _context.ContentVersions
                .Include(v => v.ContentPage)
                .FirstOrDefaultAsync(v => v.Id == versionId);

            if (version == null)
            {
                return NotFound(new { error = "Version not found" });
            }

            // Unpublish all other versions for this page
            var otherVersions = await _context.ContentVersions
                .Where(v => v.ContentPageId == version.ContentPageId && v.Id != versionId)
                .ToListAsync();

            foreach (var otherVersion in otherVersions)
            {
                otherVersion.IsPublished = false;
            }

            // Publish the selected version
            version.IsPublished = true;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Version published successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing version {VersionId}", versionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Admin Content Management Endpoints
    [HttpGet("admin/sections")]
    public async Task<ActionResult> GetAllContentSections()
    {
        try
        {
            var sections = await _context.ContentSections
                .Include(s => s.ContentPage)
                .Include(s => s.Blocks)
                .Where(s => s.IsActive)
                .OrderBy(s => s.ContentPage.PageName)
                .ThenBy(s => s.SortOrder)
                .AsSplitQuery()
                .ToListAsync();

            var sectionDtos = sections.Select(s => new AdminContentSectionDto
            {
                Id = s.Id.ToString(),
                Name = s.SectionName,
                Type = s.SectionKey,
                PageKey = s.ContentPage.PageKey,
                PageName = s.ContentPage.PageName,
                Content = GetSectionContentObject(s),
                IsActive = s.IsActive,
                LastModified = s.UpdatedAt.ToString("yyyy-MM-dd")
            }).ToList();

            // If no sections exist, return empty array but still success
            return Ok(new { data = sectionDtos, success = true, message = sectionDtos.Count == 0 ? "No content sections found" : null });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all content sections");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPut("admin/sections/{sectionId}/content")]
    public async Task<ActionResult> UpdateContentSectionContent(string sectionId, [FromBody] UpdateSectionContentRequest request)
    {
        try
        {
            if (!Guid.TryParse(sectionId, out var sectionGuid))
            {
                return BadRequest(new { error = "Invalid section ID" });
            }

            var section = await _context.ContentSections
                .Include(s => s.Blocks)
                .FirstOrDefaultAsync(s => s.Id == sectionGuid);

            if (section == null)
            {
                return NotFound(new { error = "Section not found" });
            }

            // Update section blocks based on content
            await UpdateSectionBlocks(section, request.Content);

            section.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Content updated successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating section content {SectionId}", sectionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpGet("admin/pages/{pageKey}/content")]
    public async Task<ActionResult> GetPageContentForAdmin(string pageKey)
    {
        try
        {
            var page = await _context.ContentPages
                .Include(p => p.Sections.Where(s => s.IsActive))
                .ThenInclude(s => s.Blocks.Where(b => b.IsActive))
                .AsSplitQuery()
                .FirstOrDefaultAsync(p => p.PageKey == pageKey && p.IsActive);

            if (page == null)
            {
                return NotFound(new { error = "Page not found" });
            }

            var pageContent = new AdminPageContentDto
            {
                PageKey = page.PageKey,
                PageName = page.PageName,
                Sections = page.Sections
                    .OrderBy(s => s.SortOrder)
                    .Select(s => new AdminContentSectionDto
                    {
                        Id = s.Id.ToString(),
                        Name = s.SectionName,
                        Type = s.SectionKey,
                        PageKey = page.PageKey,
                        PageName = page.PageName,
                        Content = GetSectionContentObject(s),
                        IsActive = s.IsActive,
                        LastModified = s.UpdatedAt.ToString("yyyy-MM-dd")
                    }).ToList()
            };

            return Ok(new { data = pageContent, success = true });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting page content for admin");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Content Templates endpoint for frontend
    [HttpGet("templates")]
    public async Task<ActionResult<Dictionary<string, object>>> GetContentTemplates()
    {
        try
        {
            var templates = new Dictionary<string, object>();

            // Get all active pages with their sections
            var pages = await _context.ContentPages
                .Include(p => p.Sections.Where(s => s.IsActive))
                .ThenInclude(s => s.Blocks.Where(b => b.IsActive))
                .Where(p => p.IsActive)
                .AsSplitQuery()
                .ToListAsync();

            foreach (var page in pages)
            {
                foreach (var section in page.Sections.OrderBy(s => s.SortOrder))
                {
                    var template = new
                    {
                        id = section.Id.ToString(), // Use actual GUID as ID
                        sectionKey = section.SectionKey, // Keep section key for reference
                        title = section.SectionName,
                        description = section.Description ?? $"Content for {section.SectionName}",
                        status = "published", // Default status
                        lastModified = section.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        pageKey = page.PageKey,
                        fields = GetTemplateFields(section)
                    };

                    templates[section.SectionKey] = template;
                }
            }

            return Ok(templates);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting content templates");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Update section content endpoint for frontend
    [HttpPut("sections/{sectionId}/content")]
    public async Task<ActionResult<object>> UpdateSectionContent(string sectionId, [FromBody] UpdateSectionContentRequest request)
    {
        try
        {
            if (!Guid.TryParse(sectionId, out var sectionGuid))
            {
                return BadRequest(new { error = "Invalid section ID" });
            }

            var section = await _context.ContentSections
                .Include(s => s.Blocks)
                .Include(s => s.ContentPage)
                .AsSplitQuery()
                .FirstOrDefaultAsync(s => s.Id == sectionGuid);

            if (section == null)
            {
                return NotFound(new { error = "Section not found" });
            }

            // Update section blocks based on content
            await UpdateSectionBlocks(section, request.Content);

            section.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Return the updated section template
            var updatedTemplate = new
            {
                id = section.Id.ToString(), // Return the actual GUID
                sectionKey = section.SectionKey,
                title = section.SectionName,
                description = section.Description ?? $"Content for {section.SectionName}",
                status = "published",
                lastModified = section.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                pageKey = section.ContentPage.PageKey,
                fields = GetTemplateFields(section)
            };

            return Ok(updatedTemplate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating section content {SectionId}", sectionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    // Publish section endpoint for frontend
    [HttpPost("sections/{sectionId}/publish")]
    public async Task<ActionResult<object>> PublishSection(string sectionId)
    {
        try
        {
            if (!Guid.TryParse(sectionId, out var sectionGuid))
            {
                return BadRequest(new { error = "Invalid section ID" });
            }

            var section = await _context.ContentSections
                .Include(s => s.Blocks)
                .FirstOrDefaultAsync(s => s.Id == sectionGuid);

            if (section == null)
            {
                return NotFound(new { error = "Section not found" });
            }

            // Mark section as published (update timestamp)
            section.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            // Return the published section template
            var publishedTemplate = new
            {
                id = section.Id.ToString(), // Return the actual GUID
                sectionKey = section.SectionKey,
                title = section.SectionName,
                description = section.Description ?? $"Content for {section.SectionName}",
                status = "published",
                lastModified = section.UpdatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                pageKey = section.ContentPage.PageKey,
                fields = GetTemplateFields(section)
            };

            return Ok(publishedTemplate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error publishing section {SectionId}", sectionId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("admin/initialize-sample-data")]
    public async Task<ActionResult> InitializeSampleData()
    {
        try
        {
            // Check if sections already exist
            var existingSections = await _context.ContentSections.AnyAsync();
            if (existingSections)
            {
                return Ok(new { success = true, message = "Sample data already exists" });
            }

            // Get or create a general content page to hold all sections
            var generalPage = await _context.ContentPages.FirstOrDefaultAsync(p => p.PageKey == "general");
            if (generalPage == null)
            {
                generalPage = new ContentPage
                {
                    Id = Guid.NewGuid(),
                    PageKey = "general",
                    PageName = "General Content",
                    Description = "General content sections for bilingual website",
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.ContentPages.Add(generalPage);
                await _context.SaveChangesAsync(); // Save to get the ID
            }

            // Initialize all sections as standalone entities with bilingual content
            var allSections = new List<DefaultSectionData>
            {
                new() { Key = "hero", Name = "Hero Section", Description = "Main banner section with title, subtitle, and call-to-action buttons", DescriptionAr = "قسم البانر الرئيسي مع العنوان والعنوان الفرعي وأزرار الدعوة للعمل", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("hero") },
                new() { Key = "courses", Name = "Course Management", Description = "Course descriptions, curriculum, pricing, and enrollment details", DescriptionAr = "أوصاف الدورات والمناهج وتفاصيل التسعير والتسجيل", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("courses") },
                new() { Key = "about", Name = "About Company", Description = "Company information, mission, vision, team, and achievements", DescriptionAr = "معلومات الشركة والرسالة والرؤية والفريق والإنجازات", SortOrder = 3, DefaultBlocks = GetDefaultBlocks("about") },
                new() { Key = "privacy", Name = "Privacy Page", Description = "Registration and Cancellation Policies for Public Training Programs – Ersa Institute", DescriptionAr = "سياسات التسجيل والإلغاء للدورات العامة – معهد إرساء", SortOrder = 8, DefaultBlocks = GetDefaultBlocks("privacy") },
                new() { Key = "terms", Name = "Terms Page", Description = "Terms of Service", DescriptionAr = "شروط الخدمة", SortOrder = 9, DefaultBlocks = GetDefaultBlocks("terms") },
                new() { Key = "services", Name = "Services & Solutions", Description = "Consulting services, AI solutions, and service offerings", DescriptionAr = "الخدمات الاستشارية وحلول الذكاء الاصطناعي والعروض الخدمية", SortOrder = 4, DefaultBlocks = GetDefaultBlocks("services") },
                new() { Key = "contact", Name = "Contact Information", Description = "Contact details, office locations, and contact forms", DescriptionAr = "تفاصيل الاتصال ومواقع المكاتب ونماذج التواصل", SortOrder = 5, DefaultBlocks = GetDefaultBlocks("contact") },
                new() { Key = "faq", Name = "FAQ & Help", Description = "Frequently asked questions, help articles, and support content", DescriptionAr = "الأسئلة الشائعة ومقالات المساعدة ومحتوى الدعم", SortOrder = 6, DefaultBlocks = GetDefaultBlocks("faq") },
                new() { Key = "consultation", Name = "Consultation Services", Description = "Consultation offerings and service details", DescriptionAr = "عروض الاستشارة وتفاصيل الخدمات", SortOrder = 7, DefaultBlocks = GetDefaultBlocks("consultation") }
            };

            foreach (var sectionData in allSections)
            {
                var section = new ContentSection
                {
                    Id = Guid.NewGuid(),
                    SectionKey = sectionData.Key,
                    SectionName = sectionData.Name,
                    Description = sectionData.Description,
                    SortOrder = sectionData.SortOrder,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    ContentPageId = generalPage.Id
                };

                _context.ContentSections.Add(section);

                // Add blocks with bilingual content
                foreach (var blockData in sectionData.DefaultBlocks)
                {
                    var block = new ContentBlock
                    {
                        Id = Guid.NewGuid(),
                        BlockKey = blockData.Key,
                        BlockName = blockData.Name,
                        BlockType = blockData.Type,
                        ContentEn = blockData.ContentEn, // English content
                        ContentAr = blockData.ContentAr, // Arabic content
                        SortOrder = blockData.SortOrder,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        ContentSectionId = section.Id
                    };

                    _context.ContentBlocks.Add(block);
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Sample data initialized successfully with bilingual content" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing sample data");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("admin/reinitialize-sample-data")]
    public async Task<ActionResult> ReinitializeSampleData()
    {
        try
        {
            // Clear existing content data
            var existingBlocks = await _context.ContentBlocks.ToListAsync();
            _context.ContentBlocks.RemoveRange(existingBlocks);

            var existingSections = await _context.ContentSections.ToListAsync();
            _context.ContentSections.RemoveRange(existingSections);

            // Keep existing pages but clear their sections
            await _context.SaveChangesAsync();

            // Reinitialize with new structure
            return await InitializeSampleData();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error reinitializing sample data");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("admin/fix-arabic-content")]
    public async Task<ActionResult> FixArabicContent()
    {
        try
        {
            // Get all content blocks
            var blocks = await _context.ContentBlocks.ToListAsync();

            _logger.LogInformation($"Fixing Arabic content for {blocks.Count} blocks...");

            foreach (var block in blocks)
            {
                // Update based on block key
                switch (block.BlockKey)
                {
                    case "hero-badge":
                        block.ContentAr = "\u0625\u0631\u0633\u0627\u0621 \u0645\u0639\u0643 \u0644\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0647\u0627\u0631\u0627\u062a"; // إرساء معك لتطوير المهارات
                        break;
                    case "hero-title":
                        block.ContentAr = "\u0627\u0633\u062a\u0643\u0634\u0641 \u0645\u0646\u0635\u062a\u0646\u0627 \u0627\u0644\u062a\u062f\u0631\u064a\u0628\u064a\u0629 \u0648\u0627\u0631\u062a\u0642\u064a \u0628\u0642\u062f\u0631\u0627\u062a\u0643 \u0644\u062a\u062d\u0642\u064a\u0642 \u0623\u0642\u0635\u0649 \u0625\u0645\u0643\u0627\u0646\u0627\u062a\u0643"; // استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك
                        break;
                    case "hero-description":
                        block.ContentAr = "\u0627\u0628\u0646 \u0645\u0633\u062a\u0642\u0628\u0644\u0627\u064b \u0648\u0627\u0639\u062f\u0627\u064b \u0648\u0642\u0648\u062f \u062d\u064a\u0627\u062a\u0643 \u0645\u0639 \u0628\u0631\u0627\u0645\u062c\u0646\u0627 \u0627\u0644\u062a\u0641\u0627\u0639\u0644\u064a\u0629 \u0648\u0627\u0644\u0634\u0627\u0645\u0644\u0629"; // ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والشاملة
                        break;
                    case "hero-cta-primary":
                        block.ContentAr = "\u0627\u0633\u062a\u0643\u0634\u0641 \u0627\u0644\u062f\u0648\u0631\u0627\u062a"; // استكشف الدورات
                        break;
                    case "hero-cta-secondary":
                        block.ContentAr = "\u0637\u0644\u0628 \u0627\u0633\u062a\u0634\u0627\u0631\u0629"; // طلب استشارة
                        break;
                    case "page-title":
                        if (block.ContentEn == "Our Courses")
                            block.ContentAr = "\u062f\u0648\u0631\u0627\u062a\u0646\u0627"; // دوراتنا
                        break;
                    case "page-description":
                        if (block.ContentEn?.Contains("comprehensive collection") == true)
                            block.ContentAr = "\u0627\u0643\u062a\u0634\u0641 \u0645\u062c\u0645\u0648\u0639\u062a\u0646\u0627 \u0627\u0644\u0634\u0627\u0645\u0644\u0629 \u0645\u0646 \u062f\u0648\u0631\u0627\u062a \u0627\u0644\u062a\u0637\u0648\u064a\u0631 \u0627\u0644\u0645\u0647\u0646\u064a"; // اكتشف مجموعتنا الشاملة من دورات التطوير المهني
                        break;
                    case "company-name":
                        block.ContentAr = "\u0625\u0631\u0633\u0627\u0621 \u0644\u0644\u062a\u062f\u0631\u064a\u0628"; // إرساء للتدريب
                        break;
                    case "content":
                        block.ContentAr = "\u0625\u0631\u0633\u0627\u0621 \u0644\u0644\u062a\u062f\u0631\u064a\u0628"; // إرساء للتدريب
                        break;
                    case "mission":
                        block.ContentAr = "\u062a\u0645\u0643\u064a\u0646 \u0627\u0644\u0623\u0641\u0631\u0627\u062f \u0648\u0627\u0644\u0645\u0646\u0638\u0645\u0627\u062a \u0645\u0646 \u062e\u0644\u0627\u0644 \u062d\u0644\u0648\u0644 \u062a\u062f\u0631\u064a\u0628\u064a\u0629 \u0639\u0627\u0644\u0645\u064a\u0629 \u0627\u0644\u0645\u0633\u062a\u0648\u0649"; // تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى
                        break;
                    case "vision":
                        block.ContentAr = "\u0623\u0646 \u0646\u0643\u0648\u0646 \u0627\u0644\u0634\u0631\u064a\u0643 \u0627\u0644\u062a\u062f\u0631\u064a\u0628\u064a \u0627\u0644\u0645\u0641\u0636\u0644 \u0641\u064a \u0627\u0644\u0645\u0646\u0637\u0642\u0629"; // أن نكون الشريك التدريبي المفضل في المنطقة
                        break;
                    case "title":
                        if (block.ContentEn == "Our Services")
                            block.ContentAr = "\u062e\u062f\u0645\u0627\u062a\u0646\u0627"; // خدماتنا
                        else if (block.ContentEn == "Get in Touch")
                            block.ContentAr = "\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627"; // تواصل معنا
                        break;
                    case "description":
                        if (block.ContentEn?.Contains("comprehensive training") == true)
                            block.ContentAr = "\u0646\u0642\u062f\u0645 \u062e\u062f\u0645\u0627\u062a \u062a\u062f\u0631\u064a\u0628\u064a\u0629 \u0648\u0627\u0633\u062a\u0634\u0627\u0631\u064a\u0629 \u0634\u0627\u0645\u0644\u0629"; // نقدم خدمات تدريبية واستشارية شاملة
                        break;
                    case "address":
                        block.ContentAr = "\u0627\u0644\u0631\u064a\u0627\u0636\u060c \u0627\u0644\u0645\u0645\u0644\u0643\u0629 \u0627\u0644\u0639\u0631\u0628\u064a\u0629 \u0627\u0644\u0633\u0639\u0648\u062f\u064a\u0629"; // الرياض، المملكة العربية السعودية
                        break;
                    case "faq-title":
                        block.ContentAr = "\u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0634\u0627\u0626\u0639\u0629"; // الأسئلة الشائعة
                        break;
                    case "faq-1-question":
                        block.ContentAr = "\u0643\u064a\u0641 \u064a\u0645\u0643\u0646\u0646\u064a \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0641\u064a \u062f\u0648\u0631\u0629\u061f"; // كيف يمكنني التسجيل في دورة؟
                        break;
                    case "faq-1-answer":
                        block.ContentAr = "\u064a\u0645\u0643\u0646\u0643 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0645\u0646 \u062e\u0644\u0627\u0644 \u0645\u0648\u0642\u0639\u0646\u0627 \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0623\u0648 \u0627\u0644\u062a\u0648\u0627\u0635\u0644 \u0645\u0639\u0646\u0627 \u0645\u0628\u0627\u0634\u0631\u0629."; // يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.
                        break;
                }

                block.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation($"Successfully fixed Arabic content for {blocks.Count} blocks");
            return Ok(new { success = true, message = $"Fixed Arabic content for {blocks.Count} blocks", count = blocks.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fixing Arabic content");
            return StatusCode(500, new { error = "Internal server error", details = ex.Message });
        }
    }

    [HttpGet("admin/test-arabic")]
    public async Task<ActionResult> TestArabic()
    {
        try
        {
            var block = await _context.ContentBlocks.FirstOrDefaultAsync(b => b.BlockKey == "hero-badge");
            if (block == null)
                return NotFound("Block not found");

            return Ok(new
            {
                blockKey = block.BlockKey,
                contentEn = block.ContentEn,
                contentAr = block.ContentAr,
                contentArBytes = block.ContentAr != null ? System.Text.Encoding.UTF8.GetBytes(block.ContentAr).Take(20).ToArray() : null,
                testArabic = "إرساء معك لتطوير المهارات",
                testArabicBytes = System.Text.Encoding.UTF8.GetBytes("إرساء معك لتطوير المهارات").Take(20).ToArray()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { error = ex.Message, stackTrace = ex.StackTrace });
        }
    }

    [HttpGet("admin/database-status")]
    public async Task<ActionResult> GetDatabaseStatus()
    {
        try
        {
            var pagesCount = await _context.ContentPages.CountAsync();
            var sectionsCount = await _context.ContentSections.CountAsync();
            var blocksCount = await _context.ContentBlocks.CountAsync();

            var pages = await _context.ContentPages.Select(p => new { p.PageKey, p.PageName }).ToListAsync();
            var sections = await _context.ContentSections.Select(s => new { s.SectionKey, s.SectionName, s.ContentPageId }).ToListAsync();

            // Get sample blocks to debug Arabic content
            var sampleBlocks = await _context.ContentBlocks
                .Where(b => b.BlockKey.StartsWith("hero"))
                .Select(b => new
                {
                    b.BlockKey,
                    b.BlockName,
                    b.ContentEn,
                    b.ContentAr
                })
                .ToListAsync();

            var sampleBlocksPreview = sampleBlocks.Select(b => new
            {
                b.BlockKey,
                b.BlockName,
                ContentEnLength = b.ContentEn?.Length ?? 0,
                ContentArLength = b.ContentAr?.Length ?? 0,
                ContentArPreview = b.ContentAr != null && b.ContentAr.Length > 0 ? b.ContentAr.Substring(0, Math.Min(30, b.ContentAr.Length)) : null
            }).ToList();

            return Ok(new
            {
                success = true,
                counts = new { pages = pagesCount, sections = sectionsCount, blocks = blocksCount },
                pages,
                sections,
                sampleBlocks = sampleBlocksPreview,
                message = "Database status retrieved successfully"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting database status");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("admin/pages/{pageKey}/initialize")]
    public async Task<ActionResult> InitializePageContent(string pageKey)
    {
        try
        {
            await InitializePageContentInternal(pageKey);
            return Ok(new { success = true, message = "Page initialized successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing page content {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private async Task InitializePageContentInternal(string pageKey)
    {
        try
        {
            var existingPage = await _context.ContentPages
                .FirstOrDefaultAsync(p => p.PageKey == pageKey);

            if (existingPage != null)
            {
                return; // Page already exists, skip initialization
            }

            var page = new ContentPage
            {
                Id = Guid.NewGuid(),
                PageKey = pageKey,
                PageName = GetPageDisplayName(pageKey),
                Description = $"Content for {GetPageDisplayName(pageKey)} page",
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.ContentPages.Add(page);

            // Initialize default sections for the page
            var defaultSections = GetDefaultSectionsForPage(pageKey);
            foreach (var sectionData in defaultSections)
            {
                var section = new ContentSection
                {
                    Id = Guid.NewGuid(),
                    ContentPageId = page.Id,
                    SectionKey = sectionData.Key,
                    SectionName = sectionData.Name,
                    Description = sectionData.Description,
                    SortOrder = sectionData.SortOrder,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.ContentSections.Add(section);

                // Add default blocks
                foreach (var blockData in sectionData.DefaultBlocks)
                {
                    var block = new ContentBlock
                    {
                        Id = Guid.NewGuid(),
                        ContentSectionId = section.Id,
                        BlockKey = blockData.Key,
                        BlockName = blockData.Name,
                        BlockType = blockData.Type,
                        ContentEn = blockData.ContentEn,
                        ContentAr = blockData.ContentAr,
                        SortOrder = blockData.SortOrder,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.ContentBlocks.Add(block);
                }
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing page content {PageKey}", pageKey);
            throw;
        }
    }

    // Helper methods
    private object GetSectionContentObject(ContentSection section)
    {
        var blocks = section.Blocks.Where(b => b.IsActive).OrderBy(b => b.SortOrder).ToList();

        switch (section.SectionKey.ToLower())
        {
            case "hero":
                return new
                {
                    title = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? "Welcome to Ersa Training",
                    subtitle = blocks.FirstOrDefault(b => b.BlockKey == "subtitle")?.ContentEn ?? "Professional Training & Consultancy Services",
                    description = blocks.FirstOrDefault(b => b.BlockKey == "description")?.ContentEn ?? "Empowering individuals and organizations with world-class training solutions"
                };

            case "faq":
                var faqBlocks = blocks.Where(b => b.BlockType == "faq").ToList();
                return new
                {
                    faqs = faqBlocks.Select(b => new
                    {
                        question = b.BlockName,
                        answer = b.ContentEn ?? ""
                    }).ToList()
                };

            case "services":
                var serviceBlocks = blocks.Where(b => b.BlockType == "service").ToList();
                return new
                {
                    services = serviceBlocks.Select(b => new
                    {
                        title = b.BlockName,
                        description = b.ContentEn ?? ""
                    }).ToList()
                };

            default:
                return new
                {
                    title = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? section.SectionName,
                    description = blocks.FirstOrDefault(b => b.BlockKey == "description")?.ContentEn ?? ""
                };
        }
    }


    private Dictionary<string, object> JsonElementToDictionary(JsonElement element)
    {
        var dict = new Dictionary<string, object>();

        foreach (var prop in element.EnumerateObject())
        {
            dict[prop.Name] = ConvertJsonElement(prop.Value);
        }

        return dict;
    }

    private object ConvertJsonElement(JsonElement element)
    {
        switch (element.ValueKind)
        {
            case JsonValueKind.Object:
                return JsonElementToDictionary(element);
            case JsonValueKind.Array:
                var list = new List<object>();
                foreach (var item in element.EnumerateArray())
                {
                    list.Add(ConvertJsonElement(item));
                }
                return list;
            case JsonValueKind.String:
                return element.GetString();
            case JsonValueKind.Number:
                return element.TryGetInt64(out long l) ? (object)l : element.GetDouble();
            case JsonValueKind.True:
            case JsonValueKind.False:
                return element.GetBoolean();
            case JsonValueKind.Null:
            case JsonValueKind.Undefined:
            default:
                return null;
        }
    }

    private JsonElement ConvertToJsonElement(dynamic content)
    {
        // Handle content as JsonElement or JSON string
        JsonElement jsonElement;

        if (content is string jsonString)
        {
            jsonElement = JsonSerializer.Deserialize<JsonElement>(jsonString);
        }
        else if (content is JsonElement je)
        {
            jsonElement = je;
        }
        else
        {
            // Optionally: try parsing from object to JSON and back
            var serialized = JsonSerializer.Serialize(content);
            jsonElement = JsonSerializer.Deserialize<JsonElement>(serialized);
        }
        return jsonElement;
    }

    // Helper method to handle bilingual fields with {en, ar} structure
    private async Task UpdateOrCreateBlockFromBilingualField(Guid sectionId, string blockKey, string blockName, string blockType, Dictionary<string, object> contentDict, string fieldKey)
    {
        string? contentEn = null;
        string? contentAr = null;

        // Check if the field has bilingual structure {en: "...", ar: "..."}
        if (contentDict.ContainsKey(fieldKey) && contentDict[fieldKey] is IDictionary<string, object> bilingualField)
        {
            contentEn = bilingualField.ContainsKey("en") ? bilingualField["en"]?.ToString() : null;
            contentAr = bilingualField.ContainsKey("ar") ? bilingualField["ar"]?.ToString() : null;
        }
        // Check for separate -en and -ar fields
        else
        {
            contentEn = contentDict.ContainsKey($"{fieldKey}-en") ? contentDict[$"{fieldKey}-en"]?.ToString() : null;
            contentAr = contentDict.ContainsKey($"{fieldKey}-ar") ? contentDict[$"{fieldKey}-ar"]?.ToString() : null;
        }

        await UpdateOrCreateBlock(sectionId, blockKey, blockName, blockType, contentEn, contentAr);
    }

    // Helper method to handle separate English/Arabic arrays (features, testimonials, categories)
    private async Task HandleSeparateBilingualArrays(Guid sectionId, Dictionary<string, object> contentDict, string arrayName, string itemType)
    {
        // Handle separate English and Arabic arrays
        if (contentDict.ContainsKey($"{arrayName}-en") && contentDict[$"{arrayName}-en"] is IEnumerable<object> englishItems &&
            contentDict.ContainsKey($"{arrayName}-ar") && contentDict[$"{arrayName}-ar"] is IEnumerable<object> arabicItems)
        {
            var englishList = englishItems.ToList();
            var arabicList = arabicItems.ToList();
            var maxCount = Math.Max(englishList.Count, arabicList.Count);

            for (int i = 0; i < maxCount; i++)
            {
                var englishItem = i < englishList.Count ? englishList[i] as IDictionary<string, object> : null;
                var arabicItem = i < arabicList.Count ? arabicList[i] as IDictionary<string, object> : null;

                string? contentEn = null;
                string? contentAr = null;
                string? nameEn = null;
                string? nameAr = null;

                if (itemType == "feature")
                {
                    nameEn = englishItem?.ContainsKey("title") == true ? englishItem["title"]?.ToString() : null;
                    nameAr = arabicItem?.ContainsKey("title") == true ? arabicItem["title"]?.ToString() : null;
                    var descEn = englishItem?.ContainsKey("description") == true ? englishItem["description"]?.ToString() : null;
                    var descAr = arabicItem?.ContainsKey("description") == true ? arabicItem["description"]?.ToString() : null;
                    contentEn = $"{nameEn}: {descEn}";
                    contentAr = $"{nameAr}: {descAr}";
                }
                else if (itemType == "testimonial")
                {
                    nameEn = englishItem?.ContainsKey("name") == true ? englishItem["name"]?.ToString() : null;
                    nameAr = arabicItem?.ContainsKey("name") == true ? arabicItem["name"]?.ToString() : null;
                    var roleEn = englishItem?.ContainsKey("role") == true ? englishItem["role"]?.ToString() : null;
                    var roleAr = arabicItem?.ContainsKey("role") == true ? arabicItem["role"]?.ToString() : null;
                    var textEn = englishItem?.ContainsKey("text") == true ? englishItem["text"]?.ToString() : null;
                    var textAr = arabicItem?.ContainsKey("text") == true ? arabicItem["text"]?.ToString() : null;
                    contentEn = $"{nameEn} - {roleEn}: {textEn}";
                    contentAr = $"{nameAr} - {roleAr}: {textAr}";
                }
                else if (itemType == "category")
                {
                    nameEn = englishItem?.ContainsKey("name") == true ? englishItem["name"]?.ToString() : null;
                    nameAr = arabicItem?.ContainsKey("name") == true ? arabicItem["name"]?.ToString() : null;
                    var descEn = englishItem?.ContainsKey("description") == true ? englishItem["description"]?.ToString() : null;
                    var descAr = arabicItem?.ContainsKey("description") == true ? arabicItem["description"]?.ToString() : null;
                    contentEn = $"{nameEn}: {descEn}";
                    contentAr = $"{nameAr}: {descAr}";
                }

                await UpdateOrCreateBlock(sectionId, $"{itemType}_{i}", nameEn ?? nameAr ?? $"{itemType} {i + 1}", itemType, contentEn, contentAr);
            }
        }
        // Handle single bilingual array with mixed structure (titleEn, titleAr, etc.)
        else if (contentDict.ContainsKey(arrayName) && contentDict[arrayName] is IEnumerable<object> bilingualItems)
        {
            var itemList = bilingualItems.ToList();
            for (int i = 0; i < itemList.Count; i++)
            {
                var item = itemList[i] as IDictionary<string, object>;
                if (item != null)
                {
                    string? contentEn = null;
                    string? contentAr = null;
                    string? nameEn = null;
                    string? nameAr = null;

                    if (itemType == "feature")
                    {
                        nameEn = item.ContainsKey("titleEn") ? item["titleEn"]?.ToString() : null;
                        nameAr = item.ContainsKey("titleAr") ? item["titleAr"]?.ToString() : null;
                        var descEn = item.ContainsKey("descriptionEn") ? item["descriptionEn"]?.ToString() : null;
                        var descAr = item.ContainsKey("descriptionAr") ? item["descriptionAr"]?.ToString() : null;
                        contentEn = $"{nameEn}: {descEn}";
                        contentAr = $"{nameAr}: {descAr}";
                    }
                    else if (itemType == "testimonial")
                    {
                        nameEn = item.ContainsKey("nameEn") ? item["nameEn"]?.ToString() : null;
                        nameAr = item.ContainsKey("nameAr") ? item["nameAr"]?.ToString() : null;
                        var roleEn = item.ContainsKey("roleEn") ? item["roleEn"]?.ToString() : null;
                        var roleAr = item.ContainsKey("roleAr") ? item["roleAr"]?.ToString() : null;
                        var textEn = item.ContainsKey("textEn") ? item["textEn"]?.ToString() : null;
                        var textAr = item.ContainsKey("textAr") ? item["textAr"]?.ToString() : null;
                        contentEn = $"{nameEn} - {roleEn}: {textEn}";
                        contentAr = $"{nameAr} - {roleAr}: {textAr}";
                    }
                    else if (itemType == "category")
                    {
                        nameEn = item.ContainsKey("nameEn") ? item["nameEn"]?.ToString() : null;
                        nameAr = item.ContainsKey("nameAr") ? item["nameAr"]?.ToString() : null;
                        var descEn = item.ContainsKey("descriptionEn") ? item["descriptionEn"]?.ToString() : null;
                        var descAr = item.ContainsKey("descriptionAr") ? item["descriptionAr"]?.ToString() : null;
                        contentEn = $"{nameEn}: {descEn}";
                        contentAr = $"{nameAr}: {descAr}";
                    }

                    await UpdateOrCreateBlock(sectionId, $"{itemType}_{i}", nameEn ?? nameAr ?? $"{itemType} {i + 1}", itemType, contentEn, contentAr);
                }
            }
        }
    }

    // Helper method to handle team members array with bilingual fields per member
    private async Task HandleTeamMembersArray(Guid sectionId, Dictionary<string, object> contentDict)
    {
        if (contentDict.ContainsKey("team") && contentDict["team"] is IEnumerable<object> teamMembers)
        {
            var teamList = teamMembers.ToList();
            for (int i = 0; i < teamList.Count; i++)
            {
                var member = teamList[i] as IDictionary<string, object>;
                if (member != null)
                {
                    var nameEn = member.ContainsKey("nameEn") ? member["nameEn"]?.ToString() : null;
                    var nameAr = member.ContainsKey("nameAr") ? member["nameAr"]?.ToString() : null;
                    var positionEn = member.ContainsKey("positionEn") ? member["positionEn"]?.ToString() : null;
                    var positionAr = member.ContainsKey("positionAr") ? member["positionAr"]?.ToString() : null;
                    var bioEn = member.ContainsKey("bioEn") ? member["bioEn"]?.ToString() : null;
                    var bioAr = member.ContainsKey("bioAr") ? member["bioAr"]?.ToString() : null;

                    var memberContentEn = $"{nameEn} - {positionEn}: {bioEn}";
                    var memberContentAr = $"{nameAr} - {positionAr}: {bioAr}";

                    await UpdateOrCreateBlock(sectionId, $"team_{i}", nameEn ?? nameAr ?? $"Team Member {i + 1}", "team", memberContentEn, memberContentAr);
                }
            }
        }
    }

    // Helper method to handle FAQ items array (separate English/Arabic arrays or bilingual items)
    private async Task HandleFAQItemsArray(Guid sectionId, Dictionary<string, object> contentDict)
    {
        // Handle separate English and Arabic FAQ arrays
        if (contentDict.ContainsKey("faq-items-en") && contentDict["faq-items-en"] is IEnumerable<object> englishFAQs &&
            contentDict.ContainsKey("faq-items-ar") && contentDict["faq-items-ar"] is IEnumerable<object> arabicFAQs)
        {
            var englishList = englishFAQs.ToList();
            var arabicList = arabicFAQs.ToList();
            var maxCount = Math.Max(englishList.Count, arabicList.Count);

            for (int i = 0; i < maxCount; i++)
            {
                var englishFAQ = i < englishList.Count ? englishList[i] as IDictionary<string, object> : null;
                var arabicFAQ = i < arabicList.Count ? arabicList[i] as IDictionary<string, object> : null;

                var questionEn = englishFAQ?.ContainsKey("question") == true ? englishFAQ["question"]?.ToString() : null;
                var questionAr = arabicFAQ?.ContainsKey("question") == true ? arabicFAQ["question"]?.ToString() : null;
                var answerEn = englishFAQ?.ContainsKey("answer") == true ? englishFAQ["answer"]?.ToString() : null;
                var answerAr = arabicFAQ?.ContainsKey("answer") == true ? arabicFAQ["answer"]?.ToString() : null;

                var contentEn = $"{questionEn}|{answerEn}";
                var contentAr = $"{questionAr}|{answerAr}";

                await UpdateOrCreateBlock(sectionId, $"faq_{i}", questionEn ?? questionAr ?? $"FAQ {i + 1}", "faq", contentEn, contentAr);
            }
        }
        // Handle single bilingual FAQ array with mixed structure (questionEn, questionAr, etc.)
        else if (contentDict.ContainsKey("faq-items") && contentDict["faq-items"] is IEnumerable<object> bilingualFAQs)
        {
            var faqList = bilingualFAQs.ToList();
            for (int i = 0; i < faqList.Count; i++)
            {
                var faq = faqList[i] as IDictionary<string, object>;
                if (faq != null)
                {
                    var questionEn = faq.ContainsKey("questionEn") ? faq["questionEn"]?.ToString() : null;
                    var questionAr = faq.ContainsKey("questionAr") ? faq["questionAr"]?.ToString() : null;
                    var answerEn = faq.ContainsKey("answerEn") ? faq["answerEn"]?.ToString() : null;
                    var answerAr = faq.ContainsKey("answerAr") ? faq["answerAr"]?.ToString() : null;

                    var contentEn = $"{questionEn}|{answerEn}";
                    var contentAr = $"{questionAr}|{answerAr}";

                    await UpdateOrCreateBlock(sectionId, $"faq_{i}", questionEn ?? questionAr ?? $"FAQ {i + 1}", "faq", contentEn, contentAr);
                }
            }
        }
        // Handle old format with single faqs array
        else if (contentDict.ContainsKey("faqs") && contentDict["faqs"] is IEnumerable<object> faqs)
        {
            var faqList = faqs.ToList();
            for (int i = 0; i < faqList.Count; i++)
            {
                var faq = faqList[i] as IDictionary<string, object>;
                if (faq != null)
                {
                    var question = faq.ContainsKey("question") ? faq["question"]?.ToString() : null;
                    var answer = faq.ContainsKey("answer") ? faq["answer"]?.ToString() : null;
                    var content = $"{question}|{answer}";

                    await UpdateOrCreateBlock(sectionId, $"faq_{i}", question ?? $"FAQ {i + 1}", "faq", content);
                }
            }
        }
    }

    private async Task UpdateSectionBlocks(ContentSection section, dynamic content)
    {
        // var contentDict = content as IDictionary<string, object> ?? new Dictionary<string, object>();

        //get the json object
        JsonElement jsonElement = ConvertToJsonElement(content);

        // Convert JsonElement to Dictionary<string, object>
        var contentDict = JsonElementToDictionary(jsonElement);

        switch (section.SectionKey.ToLower())
        {
            case "hero":
                // Handle bilingual fields with {en, ar} structure
                await UpdateOrCreateBlockFromBilingualField(section.Id, "hero-badge", "Hero Badge", "text", contentDict, "hero-badge");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "hero-title", "Hero Title", "text", contentDict, "hero-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "hero-description", "Hero Description", "textarea", contentDict, "hero-description");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "hero-cta-primary", "Primary CTA", "text", contentDict, "hero-cta-primary");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "hero-cta-secondary", "Secondary CTA", "text", contentDict, "hero-cta-secondary");

                // Handle separate English/Arabic features arrays
                await HandleSeparateBilingualArrays(section.Id, contentDict, "features", "feature");

                // Handle separate English/Arabic testimonials arrays
                await HandleSeparateBilingualArrays(section.Id, contentDict, "testimonials", "testimonial");
                break;

            case "courses":
                // Handle bilingual page title and description
                await UpdateOrCreateBlockFromBilingualField(section.Id, "page-title", "Page Title", "text", contentDict, "page-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "page-description", "Page Description", "textarea", contentDict, "page-description");

                // Handle separate English/Arabic categories arrays
                await HandleSeparateBilingualArrays(section.Id, contentDict, "categories", "category");
                break;

            case "about":
                // Handle bilingual fields with {en, ar} structure
                await UpdateOrCreateBlockFromBilingualField(section.Id, "company-name", "Title", "text", contentDict, "company-name");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "content", "Sub-Title", "textarea", contentDict, "content");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "mission", "Mission Statement", "textarea", contentDict, "mission-statement");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "vision", "Vision Statement", "textarea", contentDict, "vision-statement");
                
                // Handle team array with bilingual fields per member (nameEn, nameAr, positionEn, positionAr, etc.)
                await HandleTeamMembersArray(section.Id, contentDict);
                break;

            case "privacy":
                // Handle bilingual fields with {en, ar} structure
                await UpdateOrCreateBlockFromBilingualField(section.Id, "privacy-title", "Privacy Title", "text", contentDict, "privacy-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "privacy-content", "Privacy Content", "richtextarea", contentDict, "privacy-content");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "privacy-contact-info", "Privacy Contact Info", "richtextarea", contentDict, "privacy-contact-info");
                break;

            case "terms":
                // Handle bilingual fields with {en, ar} structure
                await UpdateOrCreateBlockFromBilingualField(section.Id, "terms-title", "Privacy Title", "text", contentDict, "terms-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "terms-content", "Privacy Content", "richtextarea", contentDict, "terms-content");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "terms-contact-info", "Privacy Contact Info", "richtextarea", contentDict, "terms-contact-info");
                break;


            case "faq":
                // Handle bilingual FAQ title
                await UpdateOrCreateBlockFromBilingualField(section.Id, "faq-title", "FAQ Title", "text", contentDict, "faq-title");

                // Handle separate English/Arabic FAQ items arrays or bilingual FAQ items
                await HandleFAQItemsArray(section.Id, contentDict);
                break;

            case "services":
                // Handle bilingual services fields
                await UpdateOrCreateBlockFromBilingualField(section.Id, "title", "Services Title", "text", contentDict, "services-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "description", "Services Description", "textarea", contentDict, "services-description");
                break;

            case "contact":
                // Handle bilingual contact fields
                await UpdateOrCreateBlockFromBilingualField(section.Id, "title", "Contact Title", "text", contentDict, "contact-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "address", "Address", "text", contentDict, "address");

                // Handle monolingual fields
                await UpdateOrCreateBlock(section.Id, "phone", "Phone Number", "text", contentDict.ContainsKey("phone") ? contentDict["phone"]?.ToString() : null);
                await UpdateOrCreateBlock(section.Id, "email", "Email Address", "text", contentDict.ContainsKey("email") ? contentDict["email"]?.ToString() : null);
                break;

            case "consultation":
                // Handle bilingual consultation fields
                await UpdateOrCreateBlockFromBilingualField(section.Id, "title", "Consultation Title", "text", contentDict, "consultation-title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "description", "Consultation Description", "textarea", contentDict, "consultation-description");
                break;

            default:
                // Handle generic bilingual fields
                await UpdateOrCreateBlockFromBilingualField(section.Id, "title", "Title", "text", contentDict, "title");
                await UpdateOrCreateBlockFromBilingualField(section.Id, "description", "Description", "textarea", contentDict, "description");
                break;
        }
    }

    private async Task UpdateOrCreateBlock(Guid sectionId, string blockKey, string blockName, string blockType, string? content)
    {
        var existingBlock = await _context.ContentBlocks
            .FirstOrDefaultAsync(b => b.ContentSectionId == sectionId && b.BlockKey == blockKey);

        if (existingBlock != null)
        {
            existingBlock.ContentEn = content;
            existingBlock.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var newBlock = new ContentBlock
            {
                Id = Guid.NewGuid(),
                ContentSectionId = sectionId,
                BlockKey = blockKey,
                BlockName = blockName,
                BlockType = blockType,
                ContentEn = content,
                SortOrder = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.ContentBlocks.Add(newBlock);
        }
    }

    private async Task UpdateOrCreateBlock(Guid sectionId, string blockKey, string blockName, string blockType, string? contentEn, string? contentAr)
    {
        var existingBlock = await _context.ContentBlocks
            .FirstOrDefaultAsync(b => b.ContentSectionId == sectionId && b.BlockKey == blockKey);

        if (existingBlock != null)
        {
            existingBlock.ContentEn = contentEn;
            existingBlock.ContentAr = contentAr;
            existingBlock.BlockType = blockType; // Update BlockType to migrate old blocks
            existingBlock.UpdatedAt = DateTime.UtcNow;
        }
        else
        {
            var newBlock = new ContentBlock
            {
                Id = Guid.NewGuid(),
                ContentSectionId = sectionId,
                BlockKey = blockKey,
                BlockName = blockName,
                BlockType = blockType,
                ContentEn = contentEn,
                ContentAr = contentAr,
                SortOrder = 0,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.ContentBlocks.Add(newBlock);
        }
    }


    private string GetPageDisplayName(string pageKey)
    {
        return pageKey.ToLower() switch
        {
            "home" => "Home Page",
            "courses" => "Courses",
            "contact" => "Contact",
            "faq" => "FAQ",
            "consultation" => "Consultation",
            "about" => "About Us",
            "privacy" => "Privacy Page",
            "terms" => "Terms Page",
            _ => pageKey
        };
    }

    private List<DefaultSectionData> GetDefaultSectionsForPage(string pageKey)
    {
        // Create standalone sections that match frontend expectations
        var allSections = new List<DefaultSectionData>
        {
            new() { Key = "hero", Name = "Hero Section", Description = "Main banner section with title, subtitle, and call-to-action buttons", DescriptionAr = "قسم البانر الرئيسي مع العنوان والعنوان الفرعي وأزرار الدعوة للعمل", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("hero") },
            new() { Key = "courses", Name = "Course Management", Description = "Course descriptions, curriculum, pricing, and enrollment details", DescriptionAr = "أوصاف الدورات والمناهج وتفاصيل التسعير والتسجيل", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("courses") },
            new() { Key = "about", Name = "About Company", Description = "Company information, mission, vision, team, and achievements", DescriptionAr = "معلومات الشركة والرسالة والرؤية والفريق والإنجازات", SortOrder = 3, DefaultBlocks = GetDefaultBlocks("about") },
            new() { Key = "privacy", Name = "Privacy Page", Description = "Registration and Cancellation Policies for Public Training Programs – Ersa Institute", DescriptionAr = "سياسات التسجيل والإلغاء للدورات العامة – معهد إرساء", SortOrder = 8, DefaultBlocks = GetDefaultBlocks("privacy") },
            new() { Key = "terms", Name = "Terms Page", Description = "Terms of Service", DescriptionAr = "شروط الخدمة", SortOrder = 9, DefaultBlocks = GetDefaultBlocks("terms") },
            new() { Key = "services", Name = "Services & Solutions", Description = "Consulting services, AI solutions, and service offerings", DescriptionAr = "الخدمات الاستشارية وحلول الذكاء الاصطناعي والعروض الخدمية", SortOrder = 4, DefaultBlocks = GetDefaultBlocks("services") },
            new() { Key = "contact", Name = "Contact Information", Description = "Contact details, office locations, and contact forms", DescriptionAr = "تفاصيل الاتصال ومواقع المكاتب ونماذج التواصل", SortOrder = 5, DefaultBlocks = GetDefaultBlocks("contact") },
            new() { Key = "faq", Name = "FAQ & Help", Description = "Frequently asked questions, help articles, and support content", DescriptionAr = "الأسئلة الشائعة ومقالات المساعدة ومحتوى الدعم", SortOrder = 6, DefaultBlocks = GetDefaultBlocks("faq") },
            new() { Key = "consultation", Name = "Consultation Services", Description = "Consultation offerings and service details", DescriptionAr = "عروض الاستشارة وتفاصيل الخدمات", SortOrder = 7, DefaultBlocks = GetDefaultBlocks("consultation") }
        };

        return pageKey.ToLower() switch
        {
            "home" => allSections.Where(s => new[] { "hero", "services" }.Contains(s.Key)).ToList(),
            "courses" => allSections.Where(s => s.Key == "courses").ToList(),
            "about" => allSections.Where(s => s.Key == "about").ToList(),
            "privacy" => allSections.Where(s => s.Key == "privacy").ToList(),
            "terms" => allSections.Where(s => s.Key == "terms").ToList(),
            "contact" => allSections.Where(s => s.Key == "contact").ToList(),
            "faq" => allSections.Where(s => s.Key == "faq").ToList(),
            "consultation" => allSections.Where(s => s.Key == "consultation").ToList(),
            _ => allSections // Return all sections for unknown pages
        };
    }

    private List<DefaultBlockData> GetDefaultBlocks(string sectionType)
    {
        return sectionType.ToLower() switch
        {
            "hero" => new List<DefaultBlockData>
            {
                new() { Key = "hero-badge", Name = "Hero Badge", Type = "text", ContentEn = "Ersa with you for skill development", ContentAr = "إرساء معك لتطوير المهارات", SortOrder = 1 },
                new() { Key = "hero-title", Name = "Hero Title", Type = "text", ContentEn = "Explore our training platform and elevate your abilities to achieve your maximum potential", ContentAr = "استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك", SortOrder = 2 },
                new() { Key = "hero-description", Name = "Hero Description", Type = "textarea", ContentEn = "Build a promising future and lead your life with our interactive and comprehensive programs", ContentAr = "ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والشاملة", SortOrder = 3 },
                new() { Key = "hero-cta-primary", Name = "Primary CTA", Type = "text", ContentEn = "Explore Courses", ContentAr = "استكشف الدورات", SortOrder = 4 },
                new() { Key = "hero-cta-secondary", Name = "Secondary CTA", Type = "text", ContentEn = "Request Consultation", ContentAr = "طلب استشارة", SortOrder = 5 }
            },
            "courses" => new List<DefaultBlockData>
            {
                new() { Key = "page-title", Name = "Page Title", Type = "text", ContentEn = "Our Courses", ContentAr = "دوراتنا", SortOrder = 1 },
                new() { Key = "page-description", Name = "Page Description", Type = "textarea", ContentEn = "Discover our comprehensive collection of professional development courses", ContentAr = "اكتشف مجموعتنا الشاملة من دورات التطوير المهني", SortOrder = 2 }
            },
            "about" => new List<DefaultBlockData>
            {
                new() { Key = "company-name", Name = "Title", Type = "text", ContentEn = "Ersa Training", ContentAr = "إرساء للتدريب", SortOrder = 0 },
                new() { Key = "content", Name = "Sub-Title", Type = "textarea", ContentEn = "A local company with global expertise that provides specialized training solutions and innovative management consulting services, with the highest quality standards and best practices, to enhance the efficiency of organizations and effectively achieve their strategic goals.", ContentAr = "شركة محلية وخبرات عالمية تعمل على تقديم حلول تدريبية متخصصة وخدمات استشارية إدارية مبتكرة، وبأعلى معايير الجودة، وأفضل الممارسات؛ لتعزيز كفاءة المنظمات، وتحقيق أهدافها الاستراتيجية بفاعلية.", SortOrder = 1 },
                new() { Key = "mission", Name = "Mission", Type = "textarea", ContentEn = "Empowering individuals and organizations through world-class training solutions", ContentAr = "تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى", SortOrder = 2 },
                new() { Key = "vision", Name = "Vision", Type = "textarea", ContentEn = "To be the preferred training partner in the region", ContentAr = "أن نكون الشريك التدريبي المفضل في المنطقة", SortOrder = 3 }
                
            },
            "privacy" => new List<DefaultBlockData>
            {
                new() { Key = "privacy-title", Name = "Privacy Title", Type = "text", ContentEn = "", ContentAr = "", SortOrder = 1 },
                new() { Key = "privacy-content", Name = "Privacy Content", Type = "textarea", ContentEn = "", ContentAr = "", SortOrder = 2 },
                new() { Key = "privacy-contact-info", Name = "Privacy Contact Info", Type = "textarea", ContentEn = "", ContentAr = "", SortOrder = 3 }
            },
            "terms" => new List<DefaultBlockData>
            {
                new() { Key = "terms-title", Name = "Terms Title", Type = "text", ContentEn = "", ContentAr = "", SortOrder = 1 },
                new() { Key = "terms-content", Name = "Terms Content", Type = "textarea", ContentEn = "", ContentAr = "", SortOrder = 2 },
                new() { Key = "terms-contact-info", Name = "Terms Contact Info", Type = "textarea", ContentEn = "", ContentAr = "", SortOrder = 3 }
            },
            "services" => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Services Title", Type = "text", ContentEn = "Our Services", ContentAr = "خدماتنا", SortOrder = 1 },
                new() { Key = "description", Name = "Services Description", Type = "textarea", ContentEn = "We offer comprehensive training and consultancy services", ContentAr = "نقدم خدمات تدريبية واستشارية شاملة", SortOrder = 2 }
            },
            "contact" => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Contact Title", Type = "text", ContentEn = "Get in Touch", ContentAr = "تواصل معنا", SortOrder = 1 },
                new() { Key = "address", Name = "Address", Type = "text", ContentEn = "Riyadh, Saudi Arabia", ContentAr = "الرياض، المملكة العربية السعودية", SortOrder = 2 },
                new() { Key = "phone", Name = "Phone Number", Type = "text", ContentEn = "+966 XX XXX XXXX", ContentAr = "+966 XX XXX XXXX", SortOrder = 3 },
                new() { Key = "email", Name = "Email Address", Type = "text", ContentEn = "info@ersa-training.com", ContentAr = "info@ersa-training.com", SortOrder = 4 }
            },
            "faq" => new List<DefaultBlockData>
            {
                new() { Key = "faq-title", Name = "FAQ Title", Type = "text", ContentEn = "Frequently Asked Questions", ContentAr = "الأسئلة الشائعة", SortOrder = 1 },
                new() { Key = "faq-1-question", Name = "FAQ 1 Question", Type = "text", ContentEn = "How do I enroll in a course?", ContentAr = "كيف يمكنني التسجيل في دورة؟", SortOrder = 2 },
                new() { Key = "faq-1-answer", Name = "FAQ 1 Answer", Type = "textarea", ContentEn = "You can enroll through our website or contact us directly.", ContentAr = "يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة.", SortOrder = 3 },
                new() { Key = "faq-2-question", Name = "FAQ 2 Question", Type = "text", ContentEn = "What payment methods do you accept?", ContentAr = "ما هي طرق الدفع المقبولة؟", SortOrder = 4 },
                new() { Key = "faq-2-answer", Name = "FAQ 2 Answer", Type = "textarea", ContentEn = "We accept credit cards, bank transfers, and online payments.", ContentAr = "نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية.", SortOrder = 5 }
            },
            "consultation" => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Consultation Title", Type = "text", ContentEn = "Consultation Services", ContentAr = "خدمات الاستشارة", SortOrder = 1 },
                new() { Key = "description", Name = "Consultation Description", Type = "textarea", ContentEn = "Professional consultation services tailored to your needs", ContentAr = "خدمات استشارية مهنية مصممة خصيصاً لاحتياجاتك", SortOrder = 2 }
            },
            _ => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Title", Type = "text", ContentEn = "Section Title", ContentAr = "عنوان القسم", SortOrder = 1 },
                new() { Key = "description", Name = "Description", Type = "text", ContentEn = "Section description", ContentAr = "وصف القسم", SortOrder = 2 }
            }
        };
    }

    // Helper method to convert database blocks to frontend field format
    private List<object> GetTemplateFields(ContentSection section)
    {
        var fields = new List<object>();
        var blocks = section.Blocks.Where(b => b.IsActive).OrderBy(b => b.SortOrder).ToList();

        switch (section.SectionKey.ToLower())
        {
            case "hero":
                // Bilingual fields with {en, ar} structure
                fields.Add(new
                {
                    id = "hero-badge-en",
                    label = "Hero Badge (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-badge")?.ContentEn ?? "Ersa with you for skill development",
                    required = true,
                    placeholder = "Enter hero badge text in English"
                });
                fields.Add(new
                {
                    id = "hero-badge-ar",
                    label = "Hero Badge (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-badge")?.ContentAr ?? "إرساء معك لتطوير المهارات",
                    required = true,
                    placeholder = "Enter hero badge text in Arabic"
                });
                fields.Add(new
                {
                    id = "hero-title-en",
                    label = "Hero Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-title")?.ContentEn ?? "Explore our training platform and elevate your abilities to achieve your maximum potential",
                    required = true,
                    placeholder = "Enter main hero title in English"
                });
                fields.Add(new
                {
                    id = "hero-title-ar",
                    label = "Hero Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-title")?.ContentAr ?? "استكشف منصتنا التدريبية وارتقي بقدراتك لتحقيق أقصى إمكاناتك",
                    required = true,
                    placeholder = "Enter main hero title in Arabic"
                });
                fields.Add(new
                {
                    id = "hero-description-en",
                    label = "Hero Description (English)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-description")?.ContentEn ?? "Build a promising future and lead your life with our interactive and comprehensive programs",
                    required = true,
                    placeholder = "Enter hero description in English"
                });
                fields.Add(new
                {
                    id = "hero-description-ar",
                    label = "Hero Description (Arabic)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-description")?.ContentAr ?? "ابن مستقبلاً واعداً وقود حياتك مع برامجنا التفاعلية والشاملة",
                    required = true,
                    placeholder = "Enter hero description in Arabic"
                });
                fields.Add(new
                {
                    id = "hero-cta-primary-en",
                    label = "Primary CTA Text (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-cta-primary")?.ContentEn ?? "Explore Courses",
                    required = true,
                    placeholder = "Enter primary button text in English"
                });
                fields.Add(new
                {
                    id = "hero-cta-primary-ar",
                    label = "Primary CTA Text (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-cta-primary")?.ContentAr ?? "استكشف الدورات",
                    required = true,
                    placeholder = "Enter primary button text in Arabic"
                });
                fields.Add(new
                {
                    id = "hero-cta-secondary-en",
                    label = "Secondary CTA Text (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-cta-secondary")?.ContentEn ?? "Request Consultation",
                    required = false,
                    placeholder = "Enter secondary button text in English"
                });
                fields.Add(new
                {
                    id = "hero-cta-secondary-ar",
                    label = "Secondary CTA Text (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "hero-cta-secondary")?.ContentAr ?? "طلب استشارة",
                    required = false,
                    placeholder = "Enter secondary button text in Arabic"
                });

                // Features array with bilingual items
                fields.Add(new
                {
                    id = "features",
                    label = "Features",
                    type = "array",
                    value = GetBilingualArrayFromBlocks(blocks, "feature"),
                    required = true
                });

                // Testimonials array with bilingual items
                fields.Add(new
                {
                    id = "testimonials",
                    label = "Testimonials",
                    type = "array",
                    value = GetBilingualArrayFromBlocks(blocks, "testimonial"),
                    required = false
                });
                break;

            case "courses":
                fields.Add(new
                {
                    id = "page-title-en",
                    label = "Page Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "page-title")?.ContentEn ?? "Our Courses",
                    required = true,
                    placeholder = "Enter page title in English"
                });
                fields.Add(new
                {
                    id = "page-title-ar",
                    label = "Page Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "page-title")?.ContentAr ?? "دوراتنا",
                    required = true,
                    placeholder = "Enter page title in Arabic"
                });
                fields.Add(new
                {
                    id = "page-description-en",
                    label = "Page Description (English)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "page-description")?.ContentEn ?? "Discover our comprehensive collection of professional development courses",
                    required = true,
                    placeholder = "Enter page description in English"
                });
                fields.Add(new
                {
                    id = "page-description-ar",
                    label = "Page Description (Arabic)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "page-description")?.ContentAr ?? "اكتشف مجموعتنا الشاملة من دورات التطوير المهني",
                    required = true,
                    placeholder = "Enter page description in Arabic"
                });

                // Categories array with bilingual items
                fields.Add(new
                {
                    id = "categories",
                    label = "Course Categories",
                    type = "array",
                    value = GetBilingualArrayFromBlocks(blocks, "category"),
                    required = true
                });
                break;

            case "about":
                // Bilingual fields with {en, ar} structure
                fields.Add(new
                {
                    id = "company-name",
                    label = "Title",
                    type = "text",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "company-name")?.ContentEn ?? "Ersa Training",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "company-name")?.ContentAr ?? "إرساء للتدريب"
                    },
                    required = true,
                    placeholder = "Enter title"
                });
                fields.Add(new
                {
                    id = "content",
                    label = "Sub-Title",
                    type = "textarea",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "content")?.ContentEn ?? "A local company with global expertise that provides specialized training solutions and innovative management consulting services, with the highest quality standards and best practices, to enhance the efficiency of organizations and effectively achieve their strategic goals.",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "content")?.ContentAr ?? " الجودة، وأفضل الممارسات؛ لتعزيز كفاءة المنظمات، وتحقيق أهدافها الاستراتيجية بفاعلية."
                    },
                    required = true,
                    placeholder = "Enter sub title"
                });
                fields.Add(new
                {
                    id = "mission-statement",
                    label = "Mission Statement",
                    type = "textarea",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "mission")?.ContentEn ?? "Empowering individuals and organizations through world-class training solutions",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "mission")?.ContentAr ?? "تمكين الأفراد والمنظمات من خلال حلول تدريبية عالمية المستوى"
                    },
                    required = true,
                    placeholder = "Enter company mission"
                });
                fields.Add(new
                {
                    id = "vision-statement",
                    label = "Vision Statement",
                    type = "textarea",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "vision")?.ContentEn ?? "To be the preferred training partner in the region",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "vision")?.ContentAr ?? "أن نكون الشريك التدريبي المفضل في المنطقة"
                    },
                    required = true,
                    placeholder = "Enter company vision"
                });
                
                // Team array with bilingual fields per member
                fields.Add(new
                {
                    id = "team",
                    label = "Team Members",
                    type = "array",
                    value = GetTeamMembersFromBlocks(blocks),
                    required = false
                });
                break;
            case "privacy":
                // Bilingual fields with {en, ar} structure
                fields.Add(new
                {
                    id = "privacy-title",
                    label = "Privacy Title",
                    type = "text",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "privacy-title")?.ContentEn ?? "Registration and Cancellation Policies for Public Training Programs – Ersa Institute",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "privacy-title")?.ContentAr ?? "سياسات التسجيل والإلغاء للدورات العامة – معهد إرساء"
                    },
                    required = true,
                    placeholder = "Enter privacy title"
                });
                var privacyContentBlock = blocks.FirstOrDefault(b => b.BlockKey == "privacy-content");
                fields.Add(new
                {
                    id = "privacy-content",
                    label = "Privacy Content",
                    type = "rich-text", // Always use rich-text for privacy-content
                    value = new
                    {
                        en = privacyContentBlock?.ContentEn ?? "",
                        ar = privacyContentBlock?.ContentAr ?? ""
                    },
                    required = true,
                    placeholder = "Enter privacy content"
                });
                var privacyContactBlock = blocks.FirstOrDefault(b => b.BlockKey == "privacy-contact-info");
                fields.Add(new
                {
                    id = "privacy-contact-info",
                    label = "Privacy Contact Info",
                    type = "rich-text", // Always use rich-text for privacy-contact-info
                    value = new
                    {
                        en = privacyContactBlock?.ContentEn ?? "",
                        ar = privacyContactBlock?.ContentAr ?? ""
                    },
                    required = true,
                    placeholder = "Enter contact info"
                });

                break;

            case "terms":
                // Bilingual fields with {en, ar} structure
                fields.Add(new
                {
                    id = "terms-title",
                    label = "Terms Title",
                    type = "text",
                    value = new
                    {
                        en = blocks.FirstOrDefault(b => b.BlockKey == "terms-title")?.ContentEn ?? "Terms of Service",
                        ar = blocks.FirstOrDefault(b => b.BlockKey == "terms-title")?.ContentAr ?? "شروط الخدمة"
                    },
                    required = true,
                    placeholder = "Enter terms title"
                });
                var termsContentBlock = blocks.FirstOrDefault(b => b.BlockKey == "terms-content");
                fields.Add(new
                {
                    id = "terms-content",
                    label = "Terms Content",
                    type = "rich-text", // Always use rich-text for terms-content
                    value = new
                    {
                        en = termsContentBlock?.ContentEn ?? "",
                        ar = termsContentBlock?.ContentAr ?? ""
                    },
                    required = true,
                    placeholder = "Enter terms content"
                });
                var termsContactBlock = blocks.FirstOrDefault(b => b.BlockKey == "terms-contact-info");
                fields.Add(new
                {
                    id = "terms-contact-info",
                    label = "Terms Contact Info",
                    type = "rich-text", // Always use rich-text for terms-contact-info
                    value = new
                    {
                        en = termsContactBlock?.ContentEn ?? "",
                        ar = termsContactBlock?.ContentAr ?? ""
                    },
                    required = true,
                    placeholder = "Enter contact info"
                });

                break;

            case "services":
                fields.Add(new
                {
                    id = "title-en",
                    label = "Services Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? "Our Services",
                    required = true,
                    placeholder = "Enter services title in English"
                });
                fields.Add(new
                {
                    id = "title-ar",
                    label = "Services Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentAr ?? "خدماتنا",
                    required = true,
                    placeholder = "Enter services title in Arabic"
                });
                fields.Add(new
                {
                    id = "description",
                    label = "Services Description (English)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "description-en")?.ContentEn ?? "We offer comprehensive training and consultancy services",
                    required = true,
                    placeholder = "Enter services description in English"
                });
                fields.Add(new
                {
                    id = "description",
                    label = "Services Description (Arabic)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "description-ar")?.ContentAr ?? "نقدم خدمات تدريبية واستشارية شاملة",
                    required = true,
                    placeholder = "Enter services description in Arabic"
                });
                break;

            case "contact":
                fields.Add(new
                {
                    id = "title",
                    label = "Contact Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? "Get in Touch",
                    required = true,
                    placeholder = "Enter contact title in English"
                });
                fields.Add(new
                {
                    id = "title",
                    label = "Contact Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentAr ?? "تواصل معنا",
                    required = true,
                    placeholder = "Enter contact title in Arabic"
                });
                fields.Add(new
                {
                    id = "address-en",
                    label = "Address (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "address-en")?.ContentEn ?? "Riyadh, Saudi Arabia",
                    required = true,
                    placeholder = "Enter address in English"
                });
                fields.Add(new
                {
                    id = "address-ar",
                    label = "Address (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "address-ar")?.ContentAr ?? "الرياض، المملكة العربية السعودية",
                    required = true,
                    placeholder = "Enter address in Arabic"
                });
                fields.Add(new
                {
                    id = "phone",
                    label = "Phone Number",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "phone")?.ContentEn ?? "+966 XX XXX XXXX",
                    required = true,
                    placeholder = "Enter phone number"
                });
                fields.Add(new
                {
                    id = "email",
                    label = "Email Address",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "email")?.ContentEn ?? "info@ersa-training.com",
                    required = true,
                    placeholder = "Enter email address"
                });
                break;

            case "faq":
                fields.Add(new
                {
                    id = "faq-title-en",
                    label = "FAQ Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "faq-title")?.ContentEn ?? "Frequently Asked Questions",
                    required = true,
                    placeholder = "Enter FAQ title in English"
                });
                fields.Add(new
                {
                    id = "faq-title-ar",
                    label = "FAQ Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "faq-title")?.ContentAr ?? "الأسئلة الشائعة",
                    required = true,
                    placeholder = "Enter FAQ title in Arabic"
                });

                // Separate English/Arabic arrays for FAQ items
                fields.Add(new
                {
                    id = "faq-items-en",
                    label = "FAQ Items (English)",
                    type = "array",
                    value = GetFAQItemsFromBlocks(blocks, true), // English content
                    required = true
                });
                fields.Add(new
                {
                    id = "faq-items-ar",
                    label = "FAQ Items (Arabic)",
                    type = "array",
                    value = GetFAQItemsFromBlocks(blocks, false), // Arabic content
                    required = true
                });
                break;

            case "consultation":
                fields.Add(new
                {
                    id = "title-en",
                    label = "Consultation Title (English)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? "Consultation Services",
                    required = true,
                    placeholder = "Enter consultation title in English"
                });
                fields.Add(new
                {
                    id = "title-ar",
                    label = "Consultation Title (Arabic)",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentAr ?? "خدمات الاستشارة",
                    required = true,
                    placeholder = "Enter consultation title in Arabic"
                });
                fields.Add(new
                {
                    id = "description-en",
                    label = "Consultation Description (English)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "description")?.ContentEn ?? "Professional consultation services tailored to your needs",
                    required = true,
                    placeholder = "Enter consultation description in English"
                });
                fields.Add(new
                {
                    id = "description-ar",
                    label = "Consultation Description (Arabic)",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "description")?.ContentAr ?? "خدمات استشارية مهنية مصممة خصيصاً لاحتياجاتك",
                    required = true,
                    placeholder = "Enter consultation description in Arabic"
                });
                break;

            default:
                // Generic section with title and description
                fields.Add(new
                {
                    id = "title",
                    label = "Title",
                    type = "text",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "title")?.ContentEn ?? section.SectionName,
                    required = true,
                    placeholder = "Enter section title"
                });
                fields.Add(new
                {
                    id = "description",
                    label = "Description",
                    type = "textarea",
                    value = blocks.FirstOrDefault(b => b.BlockKey == "description")?.ContentEn ?? "",
                    required = false,
                    placeholder = "Enter section description"
                });
                break;
        }

        return fields;
    }

    // Helper method to get array items from blocks (features, testimonials, categories)
    private object[] GetArrayFromBlocks(List<ContentBlock> blocks, string itemType, bool isEnglish)
    {
        var arrayBlocks = blocks.Where(b => b.BlockKey.StartsWith($"{itemType}_")).OrderBy(b => b.BlockKey).ToList();
        var result = new List<object>();

        foreach (var block in arrayBlocks)
        {
            var content = isEnglish ? block.ContentEn : block.ContentAr;
            if (!string.IsNullOrEmpty(content))
            {
                // Parse the content based on item type
                if (itemType == "feature")
                {
                    var parts = content.Split(':', 2);
                    result.Add(new
                    {
                        title = parts.Length > 0 ? parts[0].Trim() : "",
                        description = parts.Length > 1 ? parts[1].Trim() : ""
                    });
                }
                else if (itemType == "testimonial")
                {
                    var parts = content.Split(" - ", 2);
                    if (parts.Length > 1)
                    {
                        var nameAndRole = parts[0].Trim();
                        var textPart = parts[1].Trim();
                        var roleParts = textPart.Split(':', 2);

                        result.Add(new
                        {
                            name = nameAndRole,
                            role = roleParts.Length > 0 ? roleParts[0].Trim() : "",
                            text = roleParts.Length > 1 ? roleParts[1].Trim() : ""
                        });
                    }
                }
                else if (itemType == "category")
                {
                    var parts = content.Split(':', 2);
                    result.Add(new
                    {
                        name = parts.Length > 0 ? parts[0].Trim() : "",
                        description = parts.Length > 1 ? parts[1].Trim() : ""
                    });
                }
            }
        }

        // If no data from database, return default values
        if (result.Count == 0)
        {
            if (itemType == "feature")
            {
                if (isEnglish)
                {
                    result.AddRange(new[]
                    {
                        new { title = "Advanced Courses", description = "Latest technologies and methodologies" },
                        new { title = "Expert Trainers", description = "Extensive experience in the field" },
                        new { title = "Continuous Support", description = "24/7 assistance available" }
                    });
                }
                else
                {
                    result.AddRange(new[]
                    {
                        new { title = "دورات متقدمة", description = "أحدث التقنيات والمناهج" },
                        new { title = "مدربون خبراء", description = "خبرة واسعة في المجال" },
                        new { title = "دعم متواصل", description = "مساعدة على مدار الساعة" }
                    });
                }
            }
            else if (itemType == "testimonial")
            {
                if (isEnglish)
                {
                    result.AddRange(new[]
                    {
                        new { name = "Ahmed Ali", role = "Student", text = "Excellent training experience" },
                        new { name = "Sarah Johnson", role = "Manager", text = "Professional and effective" }
                    });
                }
                else
                {
                    result.AddRange(new[]
                    {
                        new { name = "أحمد علي", role = "طالب", text = "تجربة تدريبية ممتازة" },
                        new { name = "سارة جونسون", role = "مدير", text = "مهني وفعال" }
                    });
                }
            }
            else if (itemType == "category")
            {
                if (isEnglish)
                {
                    result.AddRange(new[]
                    {
                        new { name = "Graphic Design", description = "Professional design courses" },
                        new { name = "Web Development", description = "Modern development skills" },
                        new { name = "Digital Marketing", description = "Marketing strategies and tools" }
                    });
                }
                else
                {
                    result.AddRange(new[]
                    {
                        new { name = "التصميم الجرافيكي", description = "دورات تصميم احترافية" },
                        new { name = "تطوير الويب", description = "مهارات تطوير حديثة" },
                        new { name = "التسويق الرقمي", description = "استراتيجيات وأدوات التسويق" }
                    });
                }
            }
        }

        return result.ToArray();
    }

    // Helper method to get bilingual array items from blocks (features, testimonials, categories)
    private object[] GetBilingualArrayFromBlocks(List<ContentBlock> blocks, string itemType)
    {
        var arrayBlocks = blocks.Where(b => b.BlockKey.StartsWith($"{itemType}_")).OrderBy(b => b.BlockKey).ToList();
        var result = new List<object>();

        foreach (var block in arrayBlocks)
        {
            if (!string.IsNullOrEmpty(block.ContentEn) && !string.IsNullOrEmpty(block.ContentAr))
            {
                // Parse the content based on item type
                if (itemType == "feature")
                {
                    var enParts = block.ContentEn.Split(':', 2);
                    var arParts = block.ContentAr.Split(':', 2);

                    result.Add(new
                    {
                        titleEn = enParts.Length > 0 ? enParts[0].Trim() : "",
                        titleAr = arParts.Length > 0 ? arParts[0].Trim() : "",
                        descriptionEn = enParts.Length > 1 ? enParts[1].Trim() : "",
                        descriptionAr = arParts.Length > 1 ? arParts[1].Trim() : ""
                    });
                }
                else if (itemType == "testimonial")
                {
                    var enParts = block.ContentEn.Split(" - ", 2);
                    var arParts = block.ContentAr.Split(" - ", 2);

                    if (enParts.Length > 1 && arParts.Length > 1)
                    {
                        var nameEn = enParts[0].Trim();
                        var nameAr = arParts[0].Trim();
                        var textPartEn = enParts[1].Trim();
                        var textPartAr = arParts[1].Trim();
                        var rolePartsEn = textPartEn.Split(':', 2);
                        var rolePartsAr = textPartAr.Split(':', 2);

                        result.Add(new
                        {
                            nameEn = nameEn,
                            nameAr = nameAr,
                            roleEn = rolePartsEn.Length > 0 ? rolePartsEn[0].Trim() : "",
                            roleAr = rolePartsAr.Length > 0 ? rolePartsAr[0].Trim() : "",
                            textEn = rolePartsEn.Length > 1 ? rolePartsEn[1].Trim() : "",
                            textAr = rolePartsAr.Length > 1 ? rolePartsAr[1].Trim() : ""
                        });
                    }
                }
                else if (itemType == "category")
                {
                    var enParts = block.ContentEn.Split(':', 2);
                    var arParts = block.ContentAr.Split(':', 2);

                    result.Add(new
                    {
                        nameEn = enParts.Length > 0 ? enParts[0].Trim() : "",
                        nameAr = arParts.Length > 0 ? arParts[0].Trim() : "",
                        descriptionEn = enParts.Length > 1 ? enParts[1].Trim() : "",
                        descriptionAr = arParts.Length > 1 ? arParts[1].Trim() : ""
                    });
                }
            }
        }

        // If no data from database, return default values
        if (result.Count == 0)
        {
            if (itemType == "feature")
            {
                result.AddRange(new[]
                {
                    new {
                        titleEn = "Advanced Courses",
                        titleAr = "دورات متقدمة",
                        descriptionEn = "Latest technologies and methodologies",
                        descriptionAr = "أحدث التقنيات والمناهج"
                    },
                    new {
                        titleEn = "Expert Trainers",
                        titleAr = "مدربون خبراء",
                        descriptionEn = "Extensive experience in the field",
                        descriptionAr = "خبرة واسعة في المجال"
                    },
                    new {
                        titleEn = "Continuous Support",
                        titleAr = "دعم متواصل",
                        descriptionEn = "24/7 assistance available",
                        descriptionAr = "مساعدة على مدار الساعة"
                    }
                });
            }
            else if (itemType == "testimonial")
            {
                result.AddRange(new[]
                {
                    new {
                        nameEn = "Ahmed Ali",
                        nameAr = "أحمد علي",
                        roleEn = "Student",
                        roleAr = "طالب",
                        textEn = "Excellent training experience",
                        textAr = "تجربة تدريبية ممتازة"
                    },
                    new {
                        nameEn = "Sarah Johnson",
                        nameAr = "سارة جونسون",
                        roleEn = "Manager",
                        roleAr = "مدير",
                        textEn = "Professional and effective",
                        textAr = "مهني وفعال"
                    }
                });
            }
            else if (itemType == "category")
            {
                result.AddRange(new[]
                {
                    new {
                        nameEn = "Graphic Design",
                        nameAr = "التصميم الجرافيكي",
                        descriptionEn = "Professional design courses",
                        descriptionAr = "دورات تصميم احترافية"
                    },
                    new {
                        nameEn = "Web Development",
                        nameAr = "تطوير الويب",
                        descriptionEn = "Modern development skills",
                        descriptionAr = "مهارات تطوير حديثة"
                    },
                    new {
                        nameEn = "Digital Marketing",
                        nameAr = "التسويق الرقمي",
                        descriptionEn = "Marketing strategies and tools",
                        descriptionAr = "استراتيجيات وأدوات التسويق"
                    }
                });
            }
        }

        return result.ToArray();
    }

    // Helper method to get team members from blocks
    private object[] GetTeamMembersFromBlocks(List<ContentBlock> blocks)
    {
        var teamBlocks = blocks.Where(b => b.BlockKey.StartsWith("team_")).OrderBy(b => b.BlockKey).ToList();
        var result = new List<object>();

        foreach (var block in teamBlocks)
        {
            if (!string.IsNullOrEmpty(block.ContentEn) && !string.IsNullOrEmpty(block.ContentAr))
            {
                // Parse English content: "Name - Position: Bio"
                var enParts = block.ContentEn.Split(" - ", 2);
                var nameEn = enParts.Length > 0 ? enParts[0].Trim() : "";
                var positionBioEn = enParts.Length > 1 ? enParts[1].Trim() : "";
                var enBioParts = positionBioEn.Split(':', 2);
                var positionEn = enBioParts.Length > 0 ? enBioParts[0].Trim() : "";
                var bioEn = enBioParts.Length > 1 ? enBioParts[1].Trim() : "";

                // Parse Arabic content: "Name - Position: Bio"
                var arParts = block.ContentAr.Split(" - ", 2);
                var nameAr = arParts.Length > 0 ? arParts[0].Trim() : "";
                var positionBioAr = arParts.Length > 1 ? arParts[1].Trim() : "";
                var arBioParts = positionBioAr.Split(':', 2);
                var positionAr = arBioParts.Length > 0 ? arBioParts[0].Trim() : "";
                var bioAr = arBioParts.Length > 1 ? arBioParts[1].Trim() : "";

                result.Add(new
                {
                    nameEn = nameEn,
                    nameAr = nameAr,
                    positionEn = positionEn,
                    positionAr = positionAr,
                    bioEn = bioEn,
                    bioAr = bioAr
                });
            }
        }

        // If no data from database, return default values
        if (result.Count == 0)
        {
            result.AddRange(new[]
            {
                new
                {
                    nameEn = "Ahmed Mohammed",
                    nameAr = "أحمد محمد",
                    positionEn = "Chief Executive Officer",
                    positionAr = "المدير التنفيذي",
                    bioEn = "15 years of experience in training",
                    bioAr = "خبرة 15 عام في التدريب"
                },
                new
                {
                    nameEn = "Fatima Ali",
                    nameAr = "فاطمة علي",
                    positionEn = "Training Manager",
                    positionAr = "مدير التدريب",
                    bioEn = "10 years of experience in curriculum development",
                    bioAr = "خبرة 10 أعوام في تطوير المناهج"
                }
            });
        }

        return result.ToArray();
    }

    // Helper method to get FAQ items from blocks
    private object[] GetFAQItemsFromBlocks(List<ContentBlock> blocks, bool isEnglish)
    {
        var faqBlocks = blocks.Where(b => b.BlockKey.StartsWith("faq_")).OrderBy(b => b.BlockKey).ToList();
        var result = new List<object>();

        foreach (var block in faqBlocks)
        {
            var content = isEnglish ? block.ContentEn : block.ContentAr;
            if (!string.IsNullOrEmpty(content))
            {
                // Parse the content: "Question|Answer"
                var parts = content.Split('|', 2);
                result.Add(new
                {
                    question = parts.Length > 0 ? parts[0].Trim() : "",
                    answer = parts.Length > 1 ? parts[1].Trim() : ""
                });
            }
        }

        // If no data from database, return default values
        if (result.Count == 0)
        {
            if (isEnglish)
            {
                result.AddRange(new[]
                {
                    new { question = "How do I enroll in a course?", answer = "You can enroll through our website or contact us directly." },
                    new { question = "What payment methods do you accept?", answer = "We accept credit cards, bank transfers, and online payments." },
                    new { question = "Do you offer certificates?", answer = "Yes, we provide certificates of completion for all our courses." }
                });
            }
            else
            {
                result.AddRange(new[]
                {
                    new { question = "كيف يمكنني التسجيل في دورة؟", answer = "يمكنك التسجيل من خلال موقعنا الإلكتروني أو التواصل معنا مباشرة." },
                    new { question = "ما هي طرق الدفع المقبولة؟", answer = "نقبل بطاقات الائتمان والتحويلات البنكية والمدفوعات الإلكترونية." },
                    new { question = "هل تقدمون شهادات؟", answer = "نعم، نقدم شهادات إتمام لجميع دوراتنا." }
                });
            }
        }

        return result.ToArray();
    }
}

// Helper classes for content initialization
public class DefaultSectionData
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string DescriptionAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<DefaultBlockData> DefaultBlocks { get; set; } = new();
}

public class DefaultBlockData
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string ContentEn { get; set; } = string.Empty;
    public string ContentAr { get; set; } = string.Empty;
    public int SortOrder { get; set; }
}
