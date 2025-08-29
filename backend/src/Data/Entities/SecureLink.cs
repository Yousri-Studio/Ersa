using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class SecureLink
{
    public Guid Id { get; set; }
    
    public Guid EnrollmentId { get; set; }
    
    public Guid AttachmentId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string Token { get; set; } = string.Empty;
    
    public bool IsRevoked { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime? LastDownloadedAt { get; set; }
    
    public int DownloadCount { get; set; } = 0;

    // Navigation properties
    public virtual Enrollment Enrollment { get; set; } = null!;
    public virtual Attachment Attachment { get; set; } = null!;
}