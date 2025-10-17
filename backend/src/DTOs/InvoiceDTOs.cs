using System.ComponentModel.DataAnnotations;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.DTOs;

public class InvoiceDto
{
    public Guid Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public Guid OrderId { get; set; }
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Customer Information
    public InvoiceCustomerDto Customer { get; set; } = new();
    
    // Order Items
    public List<InvoiceItemDto> Items { get; set; } = new();
    
    // Payments
    public List<InvoicePaymentDto> Payments { get; set; } = new();
}

public class InvoiceCustomerDto
{
    public Guid Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string? Country { get; set; }
    public string Locale { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class InvoiceItemDto
{
    public Guid Id { get; set; }
    public Guid CourseId { get; set; }
    public Guid? SessionId { get; set; }
    public string CourseTitleEn { get; set; } = string.Empty;
    public string CourseTitleAr { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public string Currency { get; set; } = string.Empty;
    public int Qty { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class InvoicePaymentDto
{
    public Guid Id { get; set; }
    public string Provider { get; set; } = string.Empty;
    public string? ProviderRef { get; set; }
    public PaymentStatus Status { get; set; }
    public DateTime? CapturedAt { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class GenerateInvoiceRequest
{
    [Required]
    public Guid OrderId { get; set; }
}

public class GenerateInvoiceResponse
{
    public Guid InvoiceId { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public string DownloadUrl { get; set; } = string.Empty;
    public DateTime GeneratedAt { get; set; }
}
