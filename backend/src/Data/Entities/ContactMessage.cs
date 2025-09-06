using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class ContactMessage
{
    public Guid Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string FirstName { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string LastName { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(255)]
    public string Email { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    [Required]
    [MaxLength(200)]
    public string Subject { get; set; } = string.Empty;

    [Required]
    [MaxLength(5000)]
    public string Message { get; set; } = string.Empty;

    public ContactStatus Status { get; set; } = ContactStatus.New;

    [MaxLength(1000)]
    public string? Response { get; set; }

    public Guid? ResponseByUserId { get; set; }
    public DateTime? ResponseAt { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? ResponseByUser { get; set; }
}

public enum ContactStatus : int
{
    New = 1,
    InProgress = 2,
    Resolved = 3,
    Closed = 4
}
