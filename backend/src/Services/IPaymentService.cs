using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

public interface IPaymentService
{
    Task<string> CreateCheckoutUrlAsync(Order order, string returnUrl, string? provider = null);
    Task<bool> ProcessWebhookAsync(string payload, string signature, string provider);
    Task<Payment?> GetPaymentByOrderIdAsync(Guid orderId);
    Task<bool> RefundPaymentAsync(Guid paymentId, decimal? amount = null);
    List<string> GetAvailableGateways();
    string GetDefaultGateway();
}

public class PaymentResult
{
    public bool Success { get; set; }
    public string? Error { get; set; }
    public string? TransactionId { get; set; }
    public string? RedirectUrl { get; set; }
}
