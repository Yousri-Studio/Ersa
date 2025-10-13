using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// ClickPay payment gateway implementation.
/// </summary>
public class ClickPayGateway : IPaymentGateway
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<ClickPayGateway> _logger;
    private readonly ErsaTrainingDbContext _context;

    public string ProviderName => "ClickPay";

    public ClickPayGateway(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<ClickPayGateway> logger,
        ErsaTrainingDbContext context)
    {
        _configuration = configuration;
        _httpClient = httpClient;
        _logger = logger;
        _context = context;
    }

    public async Task<PaymentInitiationResult> InitiatePaymentAsync(Order order, string returnUrl)
    {
        try
        {
            var config = _configuration.GetSection("ClickPay");
            var apiUrl = config["ApiUrl"];
            var profileId = config["ProfileId"];
            var serverKey = config["ServerKey"];

            var requestData = new
            {
                profile_id = profileId,
                tran_type = "sale",
                tran_class = "ecom",
                cart_id = order.Id.ToString(),
                cart_description = $"Order {order.Id}",
                cart_currency = config["Currency"] ?? "SAR",
                cart_amount = order.Amount.ToString("F2"),
                callback = $"{_configuration["App:BaseUrl"]}/api/payments/clickpay/webhook",
                @return = returnUrl,
                customer_details = new
                {
                    name = order.User.FullName,
                    email = order.User.Email,
                    phone = order.User.PhoneNumber ?? "",
                    street1 = "N/A",
                    city = "Riyadh",
                    state = "SA",
                    country = config["MerchantCountryCode"] ?? "SA",
                    zip = "00000"
                }
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", serverKey);

            var response = await _httpClient.PostAsync($"{apiUrl}/payment/request", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var responseData = JsonSerializer.Deserialize<ClickPayInitResponse>(responseContent);
                if (responseData != null && !string.IsNullOrEmpty(responseData.RedirectUrl))
                {
                    _logger.LogInformation("ClickPay payment initiated successfully for order {OrderId}", order.Id);
                    return new PaymentInitiationResult
                    {
                        Success = true,
                        CheckoutUrl = responseData.RedirectUrl,
                        CheckoutId = responseData.TranRef
                    };
                }
            }

            _logger.LogError("ClickPay payment initiation failed: {Response}", responseContent);
            return new PaymentInitiationResult
            {
                Success = false,
                Error = "Failed to initiate ClickPay payment"
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error initiating ClickPay payment for order {OrderId}", order.Id);
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
                _logger.LogWarning("Invalid ClickPay webhook signature");
                return false;
            }

            var webhookData = JsonSerializer.Deserialize<ClickPayWebhookData>(payload);
            if (webhookData == null)
            {
                _logger.LogWarning("ClickPay webhook data is null");
                return false;
            }

            if (!Guid.TryParse(webhookData.CartId, out var orderId))
            {
                _logger.LogWarning("Invalid order ID in ClickPay webhook: {CartId}", webhookData.CartId);
                return false;
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Bill)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                _logger.LogWarning("Order not found for ClickPay webhook: {OrderId}", orderId);
                return false;
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Provider == "ClickPay");

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for order: {OrderId}", orderId);
                return false;
            }

            // Update payment status based on ClickPay response code
            // Response codes: 00, 000 = Approved, others = Failed/Declined
            payment.Status = webhookData.RespCode switch
            {
                "00" or "000" => PaymentStatus.Completed,
                _ => PaymentStatus.Failed
            };

            payment.ProviderRef = webhookData.TranRef;
            payment.CapturedAt = DateTime.UtcNow;
            payment.RawPayload = payload;
            payment.UpdatedAt = DateTime.UtcNow;

            // Update order status
            if (payment.Status == PaymentStatus.Completed)
            {
                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("ClickPay payment completed for order {OrderId}", orderId);
            }
            else
            {
                order.Status = OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                _logger.LogWarning("ClickPay payment failed for order {OrderId}: {Message}", orderId, webhookData.RespMessage);
            }

            await _context.SaveChangesAsync();
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing ClickPay webhook");
            return false;
        }
    }

    public async Task<bool> RefundAsync(Payment payment, decimal? amount = null)
    {
        try
        {
            var config = _configuration.GetSection("ClickPay");
            var apiUrl = config["ApiUrl"];
            var profileId = config["ProfileId"];
            var serverKey = config["ServerKey"];

            if (payment.Order == null)
            {
                payment = await _context.Payments
                    .Include(p => p.Order)
                    .FirstOrDefaultAsync(p => p.Id == payment.Id);
            }

            if (payment?.Order == null)
            {
                _logger.LogWarning("Order not found for payment {PaymentId}", payment?.Id);
                return false;
            }

            var refundAmount = amount ?? payment.Order.Amount;
            var requestData = new
            {
                profile_id = profileId,
                tran_type = "refund",
                tran_class = "ecom",
                cart_id = payment.Order.Id.ToString(),
                cart_description = $"Refund for Order {payment.Order.Id}",
                cart_currency = config["Currency"] ?? "SAR",
                cart_amount = refundAmount.ToString("F2"),
                tran_ref = payment.ProviderRef
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", serverKey);

            var response = await _httpClient.PostAsync($"{apiUrl}/payment/request", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (response.IsSuccessStatusCode)
            {
                var responseData = JsonSerializer.Deserialize<ClickPayRefundResponse>(responseContent);
                if (responseData?.RespCode == "00" || responseData?.RespCode == "000")
                {
                    payment.Status = PaymentStatus.Refunded;
                    payment.UpdatedAt = DateTime.UtcNow;
                    payment.Order.Status = OrderStatus.Refunded;
                    payment.Order.UpdatedAt = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                    
                    _logger.LogInformation("ClickPay refund processed successfully for payment {PaymentId}", payment.Id);
                    return true;
                }
            }

            _logger.LogError("ClickPay refund failed: {Response}", responseContent);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing ClickPay refund for payment {PaymentId}", payment.Id);
            return false;
        }
    }

    private bool ValidateWebhookSignature(string payload, string signature)
    {
        var webhookSecret = _configuration["ClickPay:WebhookSecret"];
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
/// DTO for ClickPay payment initiation response.
/// </summary>
public class ClickPayInitResponse
{
    [JsonPropertyName("tran_ref")]
    public string TranRef { get; set; } = string.Empty;

    [JsonPropertyName("redirect_url")]
    public string RedirectUrl { get; set; } = string.Empty;

    [JsonPropertyName("respCode")]
    public string? RespCode { get; set; }

    [JsonPropertyName("respMessage")]
    public string? RespMessage { get; set; }
}

/// <summary>
/// DTO for ClickPay webhook data.
/// </summary>
public class ClickPayWebhookData
{
    [JsonPropertyName("cart_id")]
    public string CartId { get; set; } = string.Empty;

    [JsonPropertyName("tran_ref")]
    public string TranRef { get; set; } = string.Empty;

    [JsonPropertyName("respCode")]
    public string RespCode { get; set; } = string.Empty;

    [JsonPropertyName("respMessage")]
    public string RespMessage { get; set; } = string.Empty;

    [JsonPropertyName("cart_amount")]
    public string? CartAmount { get; set; }

    [JsonPropertyName("cart_currency")]
    public string? CartCurrency { get; set; }
}

/// <summary>
/// DTO for ClickPay refund response.
/// </summary>
public class ClickPayRefundResponse
{
    [JsonPropertyName("respCode")]
    public string RespCode { get; set; } = string.Empty;

    [JsonPropertyName("respMessage")]
    public string? RespMessage { get; set; }
}

