using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using System.Text.Json;
using System.Text;
using System.Security.Cryptography;

namespace ErsaTraining.API.Services;

/// <summary>
/// Provides services for processing payments with HyperPay.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly ErsaTrainingDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<PaymentService> _logger;
    private readonly IEnrollmentService _enrollmentService;
    private readonly IBillService _billService;

    public PaymentService(
        ErsaTrainingDbContext context,
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<PaymentService> logger,
        IEnrollmentService enrollmentService,
        IBillService billService)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
        _enrollmentService = enrollmentService;
        _billService = billService;
    }

    /// <summary>
    /// Creates a checkout URL for the specified order.
    /// </summary>
    /// <param name="order">The order to create a checkout for.</param>
    /// <param name="returnUrl">The URL to redirect the user to after payment.</param>
    /// <returns>The URL for the payment checkout page.</returns>
    public async Task<string> CreateCheckoutUrlAsync(Order order, string returnUrl)
    {
        try
        {
            var hyperPayConfig = _configuration.GetSection("HyperPay");
            var apiUrl = hyperPayConfig["ApiUrl"];
            var entityId = hyperPayConfig["EntityId"];
            var accessToken = hyperPayConfig["AccessToken"];

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
                shopperResultUrl = returnUrl,
                notificationUrl = $"{_configuration["App:BaseUrl"]}/api/payments/webhook"
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
                    // Create payment record
                    var payment = new Payment
                    {
                        Id = Guid.NewGuid(),
                        OrderId = order.Id,
                        Provider = "HyperPay",
                        ProviderRef = responseData.Id,
                        Status = PaymentStatus.Pending,
                        RawPayload = responseContent,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    };

                    _context.Payments.Add(payment);
                    await _context.SaveChangesAsync();

                    var checkoutUrl = $"{hyperPayConfig["CheckoutUrl"]}/{responseData.Id}";
                    return checkoutUrl;
                }
            }

            _logger.LogError("HyperPay checkout creation failed: {Response}", responseContent);
            throw new InvalidOperationException("Failed to create payment checkout");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating HyperPay checkout for order {OrderId}", order.Id);
            throw;
        }
    }

    /// <summary>
    /// Processes a webhook notification from HyperPay.
    /// </summary>
    /// <param name="payload">The webhook payload.</param>
    /// <param name="signature">The webhook signature.</param>
    /// <returns>True if the webhook was processed successfully, otherwise false.</returns>
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
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                _logger.LogWarning("Order not found for webhook: {OrderId}", orderId);
                return false;
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId);

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

            // Use the BillService to update the bill and order statuses
            if (order.Bill != null)
            {
                var newBillStatus = webhookData.Status.ToLower() switch
                {
                    "paid" or "success" => BillStatus.Paid,
                    "failed" => BillStatus.Failed,
                    "cancelled" => BillStatus.Failed,
                    _ => (BillStatus?)null
                };

                if (newBillStatus.HasValue)
                {
                    await _billService.UpdateBillStatusAsync(order.Bill.Id, newBillStatus.Value, "HyperPay", webhookData.TransactionId);
                }
            }
            else
            {
                _logger.LogWarning("Bill not found for order: {OrderId}", orderId);
            }

            if (payment.Status == PaymentStatus.Completed)
            {
                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;

                // Create enrollments for successful payment
                await _enrollmentService.CreateEnrollmentsFromOrderAsync(order);
            }
            else if (payment.Status == PaymentStatus.Failed || payment.Status == PaymentStatus.Cancelled)
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing HyperPay webhook");
            return false;
        }
    }

    public async Task<Payment?> GetPaymentByOrderIdAsync(Guid orderId)
    {
        return await _context.Payments
            .Include(p => p.Order)
            .FirstOrDefaultAsync(p => p.OrderId == orderId);
    }

    public async Task<bool> RefundPaymentAsync(Guid paymentId, decimal? amount = null)
    {
        try
        {
            var payment = await _context.Payments
                .Include(p => p.Order)
                .FirstOrDefaultAsync(p => p.Id == paymentId);

            if (payment == null || payment.Status != PaymentStatus.Completed)
            {
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
                return true;
            }

            _logger.LogError("HyperPay refund failed: {Response}", responseContent);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {PaymentId}", paymentId);
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

public class HyperPayCheckoutResponse
{
    public string Id { get; set; } = string.Empty;
    public string Result { get; set; } = string.Empty;
}