namespace ErsaTraining.API.DTOs;

public class EnrollmentDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public string CourseSlug { get; set; } = string.Empty;
    public string CourseTitleEn { get; set; } = string.Empty;
    public string CourseTitleAr { get; set; } = string.Empty;
    public string? CourseImage { get; set; } // Base64 encoded image
    public Guid OrderId { get; set; }
    public DateTime EnrolledAt { get; set; }
    public string Status { get; set; } = "active"; // active, completed, cancelled
    public int? Progress { get; set; } // 0-100 percentage, null if not tracked
    public string? Category { get; set; }
}
