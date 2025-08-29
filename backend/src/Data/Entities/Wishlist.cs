using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.Data.Entities;

public class Wishlist
{
    public Guid Id { get; set; }
    
    public Guid UserId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual User User { get; set; } = null!;
    public virtual ICollection<WishlistItem> Items { get; set; } = new List<WishlistItem>();
}

public class WishlistItem
{
    public Guid Id { get; set; }
    
    public Guid WishlistId { get; set; }
    
    public Guid CourseId { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public virtual Wishlist Wishlist { get; set; } = null!;
    public virtual Course Course { get; set; } = null!;
}