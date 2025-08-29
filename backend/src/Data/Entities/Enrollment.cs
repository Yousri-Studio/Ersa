using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Enrollment
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    public Guid CourseId { get; set; }
    
    public Guid? SessionId { get; set; }
    
    public Guid? OrderId { get; set; }
    
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Pending;
    
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual Session? Session { get; set; }
    public virtual Order? Order { get; set; }
    public virtual ICollection<SecureLink> SecureLinks { get; set; } = new List<SecureLink>();
    public virtual ICollection<EmailLog> EmailLogs { get; set; } = new List<EmailLog>();
}

public enum EnrollmentStatus
{
    Pending = 1,
    Paid = 2,
    Notified = 3,
    Completed = 4,
    Cancelled = 5
}