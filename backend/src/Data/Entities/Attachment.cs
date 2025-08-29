using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Attachment
{
    public Guid Id { get; set; }
    
    public Guid CourseId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;
    
    [Required]
    [MaxLength(500)]
    public string BlobPath { get; set; } = string.Empty;
    
    public AttachmentType Type { get; set; } = AttachmentType.PDF;
    
    public bool IsRevoked { get; set; } = false;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Course Course { get; set; } = null!;
    public virtual ICollection<SecureLink> SecureLinks { get; set; } = new List<SecureLink>();
}

public enum AttachmentType
{
    PDF = 1,
    Video = 2,
    Document = 3
}