using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class EmailTemplate
{
    public Guid Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Key { get; set; } = string.Empty; // Welcome, LiveDetails, LiveReminder24h, etc.
    
    [Required]
    [MaxLength(255)]
    public string SubjectAr { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(255)]
    public string SubjectEn { get; set; } = string.Empty;
    
    [Required]
    public string BodyHtmlAr { get; set; } = string.Empty;
    
    [Required]
    public string BodyHtmlEn { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual ICollection<EmailLog> EmailLogs { get; set; } = new List<EmailLog>();
}

public class EmailLog
{
    public Guid Id { get; set; }
    
    public Guid? UserId { get; set; }
    
    public Guid? EnrollmentId { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string TemplateKey { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(5)]
    public string Locale { get; set; } = string.Empty;
    
    public EmailStatus Status { get; set; } = EmailStatus.Pending;
    
    [MaxLength(255)]
    public string? ProviderMsgId { get; set; }
    
    public DateTime? SentAt { get; set; }
    
    public DateTime? OpenedAt { get; set; }
    
    public DateTime? ClickedAt { get; set; }
    
    public string? ErrorMessage { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual Enrollment? Enrollment { get; set; }
    public virtual EmailTemplate? Template { get; set; }
}

public enum EmailStatus
{
    Pending = 1,
    Sent = 2,
    Delivered = 3,
    Opened = 4,
    Clicked = 5,
    Bounced = 6,
    Failed = 7
}