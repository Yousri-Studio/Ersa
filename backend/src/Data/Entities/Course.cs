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
    
    public bool IsActive { get; set; } = true;
    
    public bool IsFeatured { get; set; } = false;
    
    [Required]
    [MaxLength(500)]
    public string TitleAr { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string TitleEn { get; set; } = string.Empty;
    
    // [MaxLength(2000)]
    // public string? SummaryAr { get; set; }
    
    // [MaxLength(2000)]
    // public string? SummaryEn { get; set; }
    
    [MaxLength(5000)]
    public string? DescriptionAr { get; set; }
    
    [MaxLength(5000)]
    public string? DescriptionEn { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Session> Sessions { get; set; } = new List<Session>();
    public virtual ICollection<Attachment> Attachments { get; set; } = new List<Attachment>();
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<WishlistItem> WishlistItems { get; set; } = new List<WishlistItem>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

public enum CourseType
{
    Live = 1,
    PDF = 2
}