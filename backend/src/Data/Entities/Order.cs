using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Order
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    public decimal Amount { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "SAR";
    
    public OrderStatus Status { get; set; } = OrderStatus.New;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    

    // Navigation properties
    public virtual User User { get; set; } = null!;
    /// <summary>
    /// The items included in this order.
    /// </summary>
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    /// <summary>
    /// The bill associated with this order.
    /// </summary>
    public virtual Bill? Bill { get; set; }
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

/// <summary>
/// Represents the lifecycle status of an order.
/// </summary>
public enum OrderStatus
{
    New = 0,
    PendingPayment = 1,
    Paid = 2,
    UnderProcess = 3,
    Processed = 4,
    Expired = 5,
    Failed = 6,
    Refunded = 7,
    Cancelled = 8
}