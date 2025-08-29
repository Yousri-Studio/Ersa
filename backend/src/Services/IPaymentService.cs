using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IPaymentService
{
    Task<string> CreateCheckoutUrlAsync(Order order, string returnUrl);
    Task<bool> ProcessWebhookAsync(string payload, string signature);
    Task<Payment?> GetPaymentByOrderIdAsync(Guid orderId);
    Task<bool> RefundPaymentAsync(Guid paymentId, decimal? amount = null);
}

public class PaymentResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string? TransactionId { get; set; }
    public string? RedirectUrl { get; set; }
}

public class HyperPayWebhookData
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}