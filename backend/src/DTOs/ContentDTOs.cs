using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

// Content Page DTOs
public class ContentPageDto
{
    public Guid Id { get; set; }
    public string PageKey { get; set; } = string.Empty;
    public string PageName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ContentSectionDto> Sections { get; set; } = new();
}

public class CreateContentPageRequest
{
    [Required]
    [MaxLength(100)]
    public string PageKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string PageName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }
}

public class UpdateContentPageRequest
{
    [Required]
    [MaxLength(255)]
    public string PageName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public bool IsActive { get; set; }
}

// Content Section DTOs
public class ContentSectionDto
{
    public Guid Id { get; set; }
    public Guid ContentPageId { get; set; }
    public string SectionKey { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<ContentBlockDto> Blocks { get; set; } = new();
}

public class CreateContentSectionRequest
{
    [Required]
    [MaxLength(100)]
    public string SectionKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string SectionName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int SortOrder { get; set; } = 0;
}

public class UpdateContentSectionRequest
{
    [Required]
    [MaxLength(255)]
    public string SectionName { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    public int SortOrder { get; set; }

    public bool IsActive { get; set; }
}

// Content Block DTOs
public class ContentBlockDto
{
    public Guid Id { get; set; }
    public Guid ContentSectionId { get; set; }
    public string BlockKey { get; set; } = string.Empty;
    public string BlockName { get; set; } = string.Empty;
    public string BlockType { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    public string? ImageUrl { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateContentBlockRequest
{
    [Required]
    [MaxLength(100)]
    public string BlockKey { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string BlockName { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string BlockType { get; set; } = string.Empty;

    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    public string? ImageUrl { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; } = 0;
}

public class UpdateContentBlockRequest
{
    [Required]
    [MaxLength(255)]
    public string BlockName { get; set; } = string.Empty;

    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    public string? ImageUrl { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; }
    public bool IsActive { get; set; }
}

// Content Version DTOs
public class ContentVersionDto
{
    public Guid Id { get; set; }
    public Guid ContentPageId { get; set; }
    public string VersionName { get; set; } = string.Empty;
    public string? ContentData { get; set; }
    public bool IsPublished { get; set; }
    public DateTime CreatedAt { get; set; }
    public Guid CreatedBy { get; set; }
}

public class CreateContentVersionRequest
{
    [Required]
    [MaxLength(100)]
    public string VersionName { get; set; } = string.Empty;

    public string? ContentData { get; set; }
    public bool IsPublished { get; set; } = false;
}

public class PublishContentRequest
{
    public Guid VersionId { get; set; }
}

// Page Content DTOs
public class PageContentDto
{
    public string PageKey { get; set; } = string.Empty;
    public string PageName { get; set; } = string.Empty;
    public List<SectionContentDto> Sections { get; set; } = new();
}

public class SectionContentDto
{
    public string SectionKey { get; set; } = string.Empty;
    public string SectionName { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<BlockContentDto> Blocks { get; set; } = new();
}

public class BlockContentDto
{
    public string BlockKey { get; set; } = string.Empty;
    public string BlockName { get; set; } = string.Empty;
    public string BlockType { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    public string? ImageUrl { get; set; }
    public string? LinkUrl { get; set; }
    public string? LinkText { get; set; }
    public int SortOrder { get; set; }
}

// File Upload DTOs
public class FileUploadResponse
{
    public string FileName { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public string ContentType { get; set; } = string.Empty;
}

// Admin Content Management DTOs
public class AdminContentSectionDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string PageKey { get; set; } = string.Empty;
    public string PageName { get; set; } = string.Empty;
    public object Content { get; set; } = new();
    public bool IsActive { get; set; }
    public string LastModified { get; set; } = string.Empty;
}

public class AdminPageContentDto
{
    public string PageKey { get; set; } = string.Empty;
    public string PageName { get; set; } = string.Empty;
    public List<AdminContentSectionDto> Sections { get; set; } = new();
}

public class UpdateSectionContentRequest
{
    public object Content { get; set; } = new();
}

// Helper classes for page initialization
public class DefaultSectionData
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int SortOrder { get; set; }
    public List<DefaultBlockData> DefaultBlocks { get; set; } = new();
}

public class DefaultBlockData
{
    public string Key { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string? ContentEn { get; set; }
    public string? ContentAr { get; set; }
    public int SortOrder { get; set; }
}