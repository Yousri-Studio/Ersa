using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Payment
{
    public Guid Id { get; set; }
    
    public Guid OrderId { get; set; }
    
    [Required]
    [MaxLength(50)]
    public string Provider { get; set; } = string.Empty; // HyperPay, Tabby, Tamara
    
    [MaxLength(255)]
    public string? ProviderRef { get; set; }
    
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    
    public DateTime? CapturedAt { get; set; }
    
    public string? RawPayload { get; set; } // JSON payload from provider
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Order Order { get; set; } = null!;
}

public enum PaymentStatus
{
    Pending = 1,
    Processing = 2,
    Completed = 3,
    Failed = 4,
    Cancelled = 5,
    Refunded = 6
}