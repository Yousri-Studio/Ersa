using System.ComponentModel.DataAnnotations;

namespace ErsaTraining.API.DTOs;

public class InitCartRequest
{
    public string? AnonymousId { get; set; }
}

public class InitCartResponse
{
    public Guid CartId { get; set; }
    public string? AnonymousId { get; set; }
}

public class AddToCartRequest
{
    [Required]
    public Guid CartId { get; set; }

    [Required]
    public Guid CourseId { get; set; }

    public Guid? SessionId { get; set; }
}

public class CartResponse
{
    public Guid CartId { get; set; }
    public List<CartItemDto> Items { get; set; } = new();
    public decimal Total { get; set; }
    public string Currency { get; set; } = "SAR";
}

public class CartItemDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid? SessionId { get; set; }
    public LocalizedText Title { get; set; } = new();
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public int Qty { get; set; }
    public SessionDto? Session { get; set; }
}

public class MergeCartRequest
{
    [Required]
    public string AnonymousId { get; set; } = string.Empty;
}