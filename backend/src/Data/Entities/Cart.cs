using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Cart
{
    public Guid Id { get; set; }
    
    public Guid? UserId { get; set; }
    
    [MaxLength(255)]
    public string? AnonymousId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem
{
    public Guid Id { get; set; }
    
    public Guid CartId { get; set; }
    
    public Guid CourseId { get; set; }
    
    public Guid? SessionId { get; set; }
    
    public int Qty { get; set; } = 1;
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Cart Cart { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
    public virtual Session? Session { get; set; }
}