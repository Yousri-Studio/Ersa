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
    
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<Payment> Payments { get; set; } = new List<Payment>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}

public enum OrderStatus
{
    Pending = 1,
    Paid = 2,
    Failed = 3,
    Refunded = 4
}