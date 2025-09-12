using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

/// <summary>
/// Represents a single item in an order, capturing a snapshot of course details at the time of purchase.
/// </summary>
public class OrderItem
{
    public Guid Id { get; set; }
    
    public Guid OrderId { get; set; }
    
    public Guid CourseId { get; set; }
    
    public Guid? SessionId { get; set; }
    
    [Required]
    [MaxLength(255)]
    public string CourseTitleEn { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    public string CourseTitleAr { get; set; } = string.Empty;
    
    public decimal Price { get; set; }
    
    [Required]
    [MaxLength(3)]
    public string Currency { get; set; } = "SAR";
    
    public int Qty { get; set; } = 1;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Order Order { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual Session? Session { get; set; }
}
