namespace ErsaTraining.API.Data.Entities;

public class CourseInstructor
{
    public Guid CourseId { get; set; }
    public Guid InstructorId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Navigation properties
    public virtual Course Course { get; set; } = null!;
    public virtual Instructor Instructor { get; set; } = null!;
}

