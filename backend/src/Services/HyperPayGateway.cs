using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// HyperPay payment gateway implementation.
/// </summary>
public class HyperPayGateway : IPaymentGateway
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<HyperPayGateway> _logger;
    private readonly ErsaTrainingDbContext _context;
    private readonly IEmailService _emailService;

    public string ProviderName => "HyperPay";

    public HyperPayGateway(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<HyperPayGateway> logger,
        ErsaTrainingDbContext context,
        IEmailService emailService)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
        _context = context;
        _emailService = emailService;
    }

    public async Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string returnUrl)
    {
        try
        {
            var hyperPayConfig = _configuration.GetSection("HyperPay");
            var apiUrl = hyperPayConfig["ApiUrl"];
            var entityId = hyperPayConfig["EntityId"];
            var accessToken = hyperPayConfig["AccessToken"];

            // Append orderId to return URL if not already present
            var finalReturnUrl = returnUrl;
            if (!returnUrl.Contains("orderId=", StringComparison.OrdinalIgnoreCase))
            {
                var separator = returnUrl.Contains("?") ? "&" : "?";
                finalReturnUrl = $"{returnUrl}{separator}orderId={order.Id}";
            }
            _logger.LogInformation("📍 HyperPay return URL: {ReturnUrl}", finalReturnUrl);

            var requestData = new
            {
                entityId = entityId,
                amount = order.Amount.ToString("F2"),
                currency = order.Currency,
                paymentType = "DB", // Debit transaction
                merchantTransactionId = order.Id.ToString(),
                customer = new
                {
                    email = order.User.Email,
                    givenName = order.User.FullName
                },
                billing = new
                {
                    country = "SA"
                },
                shopperResultUrl = finalReturnUrl,
                notificationUrl = $"{_configuration["App:BaseUrl"]}/api/payments/hyperpay/webhook"
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

            var response = await _httpClient.PostAsync($"{apiUrl}/v1/checkouts", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var responseData = JsonSerializer.Deserialize<HyperPayCheckoutResponse>(responseContent);
                if (responseData != null && !string.IsNullOrEmpty(responseData.Id))
                {
                    var checkoutUrl = $"{hyperPayConfig["CheckoutUrl"]}/{responseData.Id}";
                    _logger.LogInformation("HyperPay payment initiated successfully for order {OrderId}", order.Id);
                    
                    return new PaymentInitiationResult
                    {
                        Success = true,
                        CheckoutUrl = checkoutUrl,
                        CheckoutId = responseData.Id
                    };
                }
            }

            _logger.LogError("HyperPay checkout creation failed: {Response}", responseContent);
            return new PaymentInitiationResult
            {
                Success = false,
                Error = "Failed to create payment checkout"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating HyperPay checkout for order {OrderId}", order.Id);
            return new PaymentInitiationResult
            {
                Success = false,
                Error = ex.Message
            };
        }
    }

    public async Task<bool> ProcessWebhookAsync(string payload, string signature)
    {
        try
        {
            // Validate webhook signature
            if (!ValidateWebhookSignature(payload, signature))
            {
                _logger.LogWarning("Invalid HyperPay webhook signature");
                return false;
            }

            var webhookData = JsonSerializer.Deserialize<HyperPayWebhookData>(payload);
            if (webhookData == null)
            {
                _logger.LogWarning("Webhook data is null");
                return false;
            }

            if (!Guid.TryParse(webhookData.OrderId, out var orderId))
            {
                _logger.LogWarning("Invalid order ID in webhook: {OrderId}", webhookData.OrderId);
                return false;
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Bill)
                .Include(o => o.OrderItems) // ✅ Include OrderItems for email and enrollment
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                _logger.LogWarning("Order not found for webhook: {OrderId}", orderId);
                return false;
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Provider == "HyperPay");

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for order: {OrderId}", orderId);
                return false;
            }

            // Update payment status
            payment.Status = webhookData.Status.ToLower() switch
            {
                "paid" or "success" => PaymentStatus.Completed,
                "failed" => PaymentStatus.Failed,
                "cancelled" => PaymentStatus.Cancelled,
                _ => PaymentStatus.Processing
            };

            payment.ProviderRef = webhookData.TransactionId;
            payment.CapturedAt = webhookData.ProcessedAt;
            payment.RawPayload = payload;
            payment.UpdatedAt = DateTime.UtcNow;

            if (payment.Status == PaymentStatus.Completed)
            {
                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("HyperPay payment completed for order {OrderId}", orderId);
                
                // Save changes first to ensure order status is updated
                await _context.SaveChangesAsync();
                
                // Send order confirmation email with invoice
                try
                {
                    _logger.LogInformation("Sending order confirmation email for order {OrderId}, locale: {Locale}", orderId, order.User.Locale);
                    var emailSent = await _emailService.SendOrderConfirmationEmailAsync(order, order.User.Locale);
                    if (emailSent)
                    {
                        _logger.LogInformation("Order confirmation email sent successfully for order {OrderId}", orderId);
                    }
                    else
                    {
                        _logger.LogWarning("Failed to send order confirmation email for order {OrderId}", orderId);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Error sending order confirmation email for order {OrderId}", orderId);
                    // Don't fail the webhook if email fails
                }
            }
            else if (payment.Status == PaymentStatus.Failed || payment.Status == PaymentStatus.Cancelled)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _logger.LogWarning("HyperPay payment failed for order {OrderId}", orderId);
                await _context.SaveChangesAsync();
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing HyperPay webhook");
            return false;
        }
    }

    public async Task<bool> RefundAsync(Payment payment, decimal? amount = null)
    {
        try
        {
            if (payment.Order == null)
            {
                payment = await _context.Payments
                    .Include(p => p.Order)
                    .FirstOrDefaultAsync(p => p.Id == payment.Id);
            }

            if (payment?.Order == null || payment.Status != PaymentStatus.Completed)
            {
                _logger.LogWarning("Cannot refund payment {PaymentId}: Invalid state", payment?.Id);
                return false;
            }

            var hyperPayConfig = _configuration.GetSection("HyperPay");
            var apiUrl = hyperPayConfig["ApiUrl"];
            var entityId = hyperPayConfig["EntityId"];
            var accessToken = hyperPayConfig["AccessToken"];

            var refundAmount = amount ?? payment.Order.Amount;
            var requestData = new
            {
                entityId = entityId,
                amount = refundAmount.ToString("F2"),
                currency = payment.Order.Currency,
                paymentType = "RF", // Refund transaction
                referencedPaymentId = payment.ProviderRef
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {accessToken}");

            var response = await _httpClient.PostAsync($"{apiUrl}/v1/payments", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                payment.Status = PaymentStatus.Refunded;
                payment.UpdatedAt = DateTime.UtcNow;
                payment.Order.Status = OrderStatus.Refunded;
                payment.Order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                _logger.LogInformation("HyperPay refund processed successfully for payment {PaymentId}", payment.Id);
                return true;
            }

            _logger.LogError("HyperPay refund failed: {Response}", responseContent);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {PaymentId}", payment.Id);
            return false;
        }
    }

    private bool ValidateWebhookSignature(string payload, string signature)
    {
        var webhookSecret = _configuration["HyperPay:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret)) return true; // Skip validation if not configured

        try
        {
            var expectedSignature = ComputeHmacSha256(payload, webhookSecret);
            return signature.Equals(expectedSignature, StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }

    private static string ComputeHmacSha256(string data, string key)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
        return Convert.ToHexString(hash).ToLower();
    }
}

/// <summary>
/// DTO for HyperPay checkout response.
/// </summary>
public class HyperPayCheckoutResponse
{
    public string Id { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
}

/// <summary>
/// DTO for HyperPay webhook data.
/// </summary>
public class HyperPayWebhookData
{
    public string OrderId { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string TransactionId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Currency { get; set; } = string.Empty;
    public DateTime ProcessedAt { get; set; }
}

