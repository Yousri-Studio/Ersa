using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Session
{
    public Guid Id { get; set; }
    
    public Guid CourseId { get; set; }
    
    [Required]
    [MaxLength(200)]
    public string TitleAr { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(200)]
    public string TitleEn { get; set; } = string.Empty;
    
    [MaxLength(2000)]
    public string? DescriptionAr { get; set; }
    
    [MaxLength(2000)]
    public string? DescriptionEn { get; set; }
    
    public DateTime StartAt { get; set; }
    
    public DateTime EndAt { get; set; }
    
    [MaxLength(500)]
    public string? TeamsLink { get; set; }
    
    public int? Capacity { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}