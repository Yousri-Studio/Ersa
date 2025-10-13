using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// Interface for payment gateway implementations.
/// </summary>
public interface IPaymentGateway
{
    /// <summary>
    /// The name of the payment provider (e.g., "HyperPay", "ClickPay").
    /// </summary>
    string ProviderName { get; }

    /// <summary>
    /// Initiates a payment transaction with the gateway.
    /// </summary>
    /// <param name="order">The order to process payment for.</param>
    /// <param name="returnUrl">The URL to redirect the user after payment.</param>
    /// <returns>Payment initiation result containing checkout URL and transaction ID.</returns>
    Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string returnUrl);

    /// <summary>
    /// Processes a webhook notification from the payment gateway.
    /// </summary>
    /// <param name="payload">The webhook payload.</param>
    /// <param name="signature">The webhook signature for validation.</param>
    /// <returns>True if webhook was processed successfully, otherwise false.</returns>
    Task<bool> ProcessWebhookAsync(string payload, string signature);

    /// <summary>
    /// Processes a refund for a completed payment.
    /// </summary>
    /// <param name="payment">The payment to refund.</param>
    /// <param name="amount">Optional partial refund amount. If null, full amount is refunded.</param>
    /// <returns>True if refund was successful, otherwise false.</returns>
    Task<bool> RefundAsync(Payment payment, decimal? amount = null);
}

/// <summary>
/// Result of payment initiation.
/// </summary>
public class PaymentInitiationResult
{
    public bool Success { get; set; }
    public string? CheckoutUrl { get; set; }
    public string? CheckoutId { get; set; }
    public string? Error { get; set; }
}

