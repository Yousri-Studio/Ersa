using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class ContentPage
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string PageKey { get; set; } = string.Empty; // e.g., "home", "about", "contact"
    
    [Required]
    [MaxLength(255)]
    public string PageName { get; set; } = string.Empty; // Display name
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<ContentSection> Sections { get; set; } = new List<ContentSection>();
    public virtual ICollection<ContentVersion> Versions { get; set; } = new List<ContentVersion>();
}

public class ContentSection
{
    public Guid Id { get; set; }
    
    public Guid ContentPageId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string SectionKey { get; set; } = string.Empty; // e.g., "hero", "features", "testimonials"
    
    [Required]
    [MaxLength(255)]
    public string SectionName { get; set; } = string.Empty; // Display name
    
    [MaxLength(500)]
    public string? Description { get; set; }
    
    public int SortOrder { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ContentPage ContentPage { get; set; } = null!;
    public virtual ICollection<ContentBlock> Blocks { get; set; } = new List<ContentBlock>();
}

public class ContentBlock
{
    public Guid Id { get; set; }
    
    public Guid ContentSectionId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string BlockKey { get; set; } = string.Empty; // e.g., "title", "description", "image"
    
    [Required]
    [MaxLength(255)]
    public string BlockName { get; set; } = string.Empty; // Display name
    
    [Required]
    [MaxLength(50)]
    public string BlockType { get; set; } = string.Empty; // "text", "rich_text", "image", "link", "meta"
    
    public string? ContentEn { get; set; } // English content
    
    public string? ContentAr { get; set; } // Arabic content
    
    [MaxLength(500)]
    public string? ImageUrl { get; set; }
    
    [MaxLength(500)]
    public string? LinkUrl { get; set; }
    
    [MaxLength(100)]
    public string? LinkText { get; set; }
    
    public int SortOrder { get; set; } = 0;
    
    public bool IsActive { get; set; } = true;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ContentSection ContentSection { get; set; } = null!;
}

public class ContentVersion
{
    public Guid Id { get; set; }
    
    public Guid ContentPageId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string VersionName { get; set; } = string.Empty; // e.g., "Draft", "Published"
    
    public string? ContentData { get; set; } // JSON serialized content
    
    public bool IsPublished { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public Guid CreatedBy { get; set; } // User ID
    
    // Navigation properties
    public virtual ContentPage ContentPage { get; set; } = null!;
}
