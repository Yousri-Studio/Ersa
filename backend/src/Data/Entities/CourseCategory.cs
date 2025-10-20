using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class CourseCategory
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    public string TitleAr { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string TitleEn { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? SubtitleAr { get; set; }

    [MaxLength(500)]
    public string? SubtitleEn { get; set; }

    public int DisplayOrder { get; set; } = 0;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<Course> Courses { get; set; } = new List<Course>();
}

