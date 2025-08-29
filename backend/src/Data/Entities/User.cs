using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace ErsaTraining.API.Data.Entities;

public class User : IdentityUser<Guid>
{
    [Required]
    [MaxLength(255)]
    public string FullName { get; set; } = string.Empty;
    
    [MaxLength(20)]
    public string? Phone { get; set; }
    
    [Required]
    [MaxLength(5)]
    public string Locale { get; set; } = "en"; // ar or en
    
    [MaxLength(100)]
    public string? Country { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    public UserStatus Status { get; set; } = UserStatus.PendingEmailVerification;

    // Admin properties
    public bool IsAdmin { get; set; } = false;
    public bool IsSuperAdmin { get; set; } = false;
    public DateTime? LastLoginAt { get; set; }
    public string? AdminNotes { get; set; }

    // Navigation properties
    public virtual ICollection<Order> Orders { get; set; } = new List<Order>();
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
    public virtual ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
    public virtual ICollection<EmailLog> EmailLogs { get; set; } = new List<EmailLog>();
}

public enum UserStatus
{
    PendingEmailVerification = 0,
    Active = 1,
    Inactive = 2,
    Suspended = 3
}