using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin,SuperAdmin")]
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

    [HttpPut("admin/sections/{sectionId}")]
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
            _logger.LogError(ex, "Error getting page content for admin {PageKey}", pageKey);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("admin/initialize-sample-data")]
    public async Task<ActionResult> InitializeSampleData()
    {
        try
        {
            // Check if data already exists
            var existingPages = await _context.ContentPages.AnyAsync();
            if (existingPages)
            {
                return Ok(new { success = true, message = "Sample data already exists" });
            }

            // Initialize sample pages
            var pageKeys = new[] { "home", "courses", "contact", "faq", "consultation", "about" };
            
            foreach (var pageKey in pageKeys)
            {
                await InitializePageContentInternal(pageKey);
            }

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Sample data initialized successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initializing sample data");
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

    private async Task UpdateSectionBlocks(ContentSection section, dynamic content)
    {
        var contentDict = content as IDictionary<string, object> ?? new Dictionary<string, object>();
        
        switch (section.SectionKey.ToLower())
        {
            case "hero":
                await UpdateOrCreateBlock(section.Id, "title", "Title", "text", contentDict.ContainsKey("title") ? contentDict["title"]?.ToString() : null);
                await UpdateOrCreateBlock(section.Id, "subtitle", "Subtitle", "text", contentDict.ContainsKey("subtitle") ? contentDict["subtitle"]?.ToString() : null);
                await UpdateOrCreateBlock(section.Id, "description", "Description", "text", contentDict.ContainsKey("description") ? contentDict["description"]?.ToString() : null);
                break;
            
            case "faq":
                if (contentDict.ContainsKey("faqs") && contentDict["faqs"] is IEnumerable<object> faqs)
                {
                    var faqList = faqs.ToList();
                    for (int i = 0; i < faqList.Count; i++)
                    {
                        var faq = faqList[i] as IDictionary<string, object>;
                        if (faq != null)
                        {
                            var question = faq.ContainsKey("question") ? faq["question"]?.ToString() : null;
                            var answer = faq.ContainsKey("answer") ? faq["answer"]?.ToString() : null;
                            await UpdateOrCreateBlock(section.Id, $"faq_{i}", question ?? $"FAQ {i + 1}", "faq", answer);
                        }
                    }
                }
                break;
            
            default:
                await UpdateOrCreateBlock(section.Id, "title", "Title", "text", contentDict.ContainsKey("title") ? contentDict["title"]?.ToString() : null);
                await UpdateOrCreateBlock(section.Id, "description", "Description", "text", contentDict.ContainsKey("description") ? contentDict["description"]?.ToString() : null);
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
            _ => pageKey
        };
    }

    private List<DefaultSectionData> GetDefaultSectionsForPage(string pageKey)
    {
        return pageKey.ToLower() switch
        {
            "home" => new List<DefaultSectionData>
            {
                new() { Key = "hero", Name = "Hero Section", Description = "Main banner section", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("hero") },
                new() { Key = "services", Name = "Services", Description = "Services overview", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("services") },
                new() { Key = "testimonials", Name = "Testimonials", Description = "Client testimonials", SortOrder = 3, DefaultBlocks = GetDefaultBlocks("testimonials") }
            },
            "courses" => new List<DefaultSectionData>
            {
                new() { Key = "header", Name = "Page Header", Description = "Courses page header", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("header") },
                new() { Key = "categories", Name = "Course Categories", Description = "Available course categories", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("categories") },
                new() { Key = "featured", Name = "Featured Courses", Description = "Featured course listings", SortOrder = 3, DefaultBlocks = GetDefaultBlocks("featured") }
            },
            "contact" => new List<DefaultSectionData>
            {
                new() { Key = "header", Name = "Contact Header", Description = "Contact page header", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("header") },
                new() { Key = "info", Name = "Contact Information", Description = "Contact details and location", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("contact_info") }
            },
            "faq" => new List<DefaultSectionData>
            {
                new() { Key = "faq", Name = "FAQ Section", Description = "Frequently asked questions", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("faq") }
            },
            "consultation" => new List<DefaultSectionData>
            {
                new() { Key = "header", Name = "Consultation Header", Description = "Consultation page header", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("header") },
                new() { Key = "services", Name = "Consultation Services", Description = "Available consultation services", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("consultation_services") }
            },
            "about" => new List<DefaultSectionData>
            {
                new() { Key = "header", Name = "About Header", Description = "About page header", SortOrder = 1, DefaultBlocks = GetDefaultBlocks("header") },
                new() { Key = "story", Name = "Our Story", Description = "Company story and mission", SortOrder = 2, DefaultBlocks = GetDefaultBlocks("story") },
                new() { Key = "team", Name = "Our Team", Description = "Team members", SortOrder = 3, DefaultBlocks = GetDefaultBlocks("team") },
                new() { Key = "achievements", Name = "Achievements", Description = "Company achievements and statistics", SortOrder = 4, DefaultBlocks = GetDefaultBlocks("achievements") }
            },
            _ => new List<DefaultSectionData>()
        };
    }

    private List<DefaultBlockData> GetDefaultBlocks(string sectionType)
    {
        return sectionType.ToLower() switch
        {
            "hero" => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Title", Type = "text", ContentEn = "Welcome to Ersa Training", SortOrder = 1 },
                new() { Key = "subtitle", Name = "Subtitle", Type = "text", ContentEn = "Professional Training & Consultancy Services", SortOrder = 2 },
                new() { Key = "description", Name = "Description", Type = "text", ContentEn = "Empowering individuals and organizations with world-class training solutions", SortOrder = 3 }
            },
            "faq" => new List<DefaultBlockData>
            {
                new() { Key = "faq_0", Name = "How do I enroll in a course?", Type = "faq", ContentEn = "You can enroll through our website or contact us directly.", SortOrder = 1 },
                new() { Key = "faq_1", Name = "What payment methods do you accept?", Type = "faq", ContentEn = "We accept credit cards, bank transfers, and online payments.", SortOrder = 2 }
            },
            _ => new List<DefaultBlockData>
            {
                new() { Key = "title", Name = "Title", Type = "text", ContentEn = "Section Title", SortOrder = 1 },
                new() { Key = "description", Name = "Description", Type = "text", ContentEn = "Section description", SortOrder = 2 }
            }
        };
    }
}
