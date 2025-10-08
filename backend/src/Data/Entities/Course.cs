using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Course
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Slug { get; set; } = string.Empty;
    
    public decimal Price { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "SAR";
    
    public CourseType Type { get; set; }

    public CourseLevel Level { get; set; }

    // Foreign key to CourseCategory table
    public Guid? CategoryId { get; set; }
    
    [MaxLength(1000)]
    public string? VideoUrl { get; set; }
   
    [MaxLength(50)]
    public string? DurationEn { get; set; }
    
    [MaxLength(50)]
    public string? DurationAr { get; set; }
    
    // Course Schedule
    public DateTime? From { get; set; }
    public DateTime? To { get; set; }
    
    [MaxLength(150)]
    public string? SessionsNotesEn { get; set; }
    
    [MaxLength(150)]
    public string? SessionsNotesAr { get; set; }
    
    [MaxLength(255)]
    public string? InstructorNameAr { get; set; }

    [MaxLength(255)]
    public string? InstructorNameEn { get; set; }
    
    public bool IsActive { get; set; } = true;
    
    public bool IsFeatured { get; set; } = false;
    
    [Required]
    [MaxLength(500)]
    public string TitleAr { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string TitleEn { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string? SummaryAr { get; set; }
    
    [MaxLength(2000)]
    public string? SummaryEn { get; set; }
    
    [MaxLength(5000)]
    public string? DescriptionAr { get; set; }
    
    [MaxLength(5000)]
    public string? DescriptionEn { get; set; }
    
    // New fields for photo, tags, and instructor bio
    public byte[]? Photo { get; set; }
    
    [MaxLength(2000)]
    public string? Tags { get; set; }
    
    [MaxLength(2500)]
    public string? InstructorsBioAr { get; set; }
    
    [MaxLength(2500)]
    public string? InstructorsBioEn { get; set; }
    
    public string? CourseTopicsAr { get; set; }
    
    public string? CourseTopicsEn { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual CourseCategory? Category { get; set; }
    public virtual ICollection<CourseSubCategoryMapping> CourseSubCategoryMappings { get; set; } = new List<CourseSubCategoryMapping>();
    public virtual ICollection<CourseInstructor> CourseInstructors { get; set; } = new List<CourseInstructor>();
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

public enum CourseType:int
{
    Live = 1,
    PDF = 2
}

public enum CourseLevel:int
{
    Biginner = 1,
    Intermediate = 2,
    Advanced=3
}

// Removed CourseCategory and CourseSubCategory enums - now using database tables instead