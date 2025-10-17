using System.ComponentModel.DataAnnotations;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.DTOs;

public class CreateOrderRequest
{
    [Required]
    public Guid CartId { get; set; }
}

public class CreateOrderResponse
{
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public OrderStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CheckoutRequest
{
    [Required]
    public Guid OrderId { get; set; }

    [Required]
    [Url]
    public string ReturnUrl { get; set; } = string.Empty;

    /// <summary>
    /// Optional payment provider. If null, uses default based on configuration.
    /// </summary>
    public string? PaymentProvider { get; set; }
}

public class CheckoutResponse
{
    public string RedirectUrl { get; set; } = string.Empty;
}

public class PaymentConfigResponse
{
    public int GatewayMethod { get; set; }
    public List<string> AvailableGateways { get; set; } = new();
    public string DefaultGateway { get; set; } = string.Empty;
    public bool ShowSelector { get; set; }
}

public class PaymentWebhookRequest
{
    public Guid OrderId { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? TransactionId { get; set; }
    public string? RawPayload { get; set; }
}

public class OrderDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderItemDto
{
    public Guid CourseId { get; set; }
    public string CourseTitleEn { get; set; } = string.Empty;
    public string CourseTitleAr { get; set; } = string.Empty;
    public LocalizedText? CourseTitle { get; set; }
    public Guid? SessionId { get; set; }
    public SessionDto? Session { get; set; }
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public int Qty { get; set; }
}