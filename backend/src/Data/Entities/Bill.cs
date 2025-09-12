using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

/// <summary>
/// Represents a bill associated with an order, managing payment information and status.
/// </summary>
public class Bill
{
    public Guid Id { get; set; }
    
    public Guid OrderId { get; set; }
    
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "SAR";
    
        /// <summary>
    /// The current status of the bill (e.g., Pending, Paid, Failed).
    /// </summary>
    public BillStatus Status { get; set; } = BillStatus.Pending;
    
    [MaxLength(255)]
        /// <summary>
    /// The payment provider used for this bill (e.g., HyperPay).
    /// </summary>
    public string? PaymentProvider { get; set; }
    
    [MaxLength(255)]
        /// <summary>
    /// The transaction ID from the payment provider.
    /// </summary>
    public string? ProviderTransactionId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Order Order { get; set; } = null!;
}

public enum BillStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Expired = 4
}
