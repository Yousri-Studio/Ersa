using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Instructor
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string InstructorNameEn { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string InstructorNameAr { get; set; } = string.Empty;
    
    [MaxLength(2500)]
    public string? InstructorBioEn { get; set; }
    
    [MaxLength(2500)]
    public string? InstructorBioAr { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual ICollection<CourseInstructor> CourseInstructors { get; set; } = new List<CourseInstructor>();
}

