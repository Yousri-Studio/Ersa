using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// Tamara (BNPL) payment gateway implementation using Tamara Direct API.
/// Docs: https://docs.tamara.co/
/// </summary>
public class TamaraGateway : IPaymentGateway
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<TamaraGateway> _logger;
    private readonly ErsaTrainingDbContext _context;
    private readonly IEmailService _emailService;

    public string ProviderName => "Tamara";

    public TamaraGateway(
        IConfiguration configuration,
        HttpClient httpClient,
        ILogger<TamaraGateway> logger,
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
            var tamaraConfig = _configuration.GetSection("Tamara");
            var apiBaseUrl = tamaraConfig["ApiBaseUrl"]?.TrimEnd('/');
            var apiToken = tamaraConfig["ApiToken"];

            if (string.IsNullOrWhiteSpace(apiBaseUrl) || string.IsNullOrWhiteSpace(apiToken))
            {
                return new PaymentInitiationResult
                {
                    Success = false,
                    Error = "Tamara is not configured"
                };
            }

            // Append orderId to return URL if not already present (consistent with other gateways)
            var finalReturnUrl = returnUrl;
            if (!returnUrl.Contains("orderId=", StringComparison.OrdinalIgnoreCase))
            {
                var separator = returnUrl.Contains("?") ? "&" : "?";
                finalReturnUrl = $"{returnUrl}{separator}orderId={order.Id}";
            }

            // Derive cancel/failure URLs (best-effort). Frontend already has /checkout/failed route.
            var cancelUrl = DeriveFailureUrl(finalReturnUrl, "cancelled");
            var failureUrl = DeriveFailureUrl(finalReturnUrl, "failed");

            var notificationUrl = $"{_configuration["App:BaseUrl"]}/api/payments/tamara/webhook";

            // Tamara Create Checkout Session: POST /checkout
            // Response includes order_id, checkout_id, status, checkout_url.
            // Request shape is per Tamara docs; we use snake_case fields matching response style.
            var currency = string.IsNullOrWhiteSpace(order.Currency) ? "SAR" : order.Currency;

            var requestData = new
            {
                order_reference_id = order.Id.ToString(),
                description = $"Training Course Order {order.Id}",
                country_code = "SA",
                payment_type = "PAY_BY_INSTALMENTS",
                total_amount = new { amount = order.Amount.ToString("F2"), currency },
                shipping_amount = new { amount = "0.00", currency },
                tax_amount = new { amount = "0.00", currency },
                discount_amount = new { amount = "0.00", currency },
                merchant_url = new
                {
                    success = finalReturnUrl,
                    cancel = cancelUrl,
                    failure = failureUrl,
                    notification = notificationUrl
                },
                consumer = new
                {
                    first_name = ExtractFirstName(order.User?.FullName),
                    last_name = ExtractLastName(order.User?.FullName),
                    phone_number = order.User?.PhoneNumber ?? "",
                    email = order.User?.Email ?? ""
                },
                items = await BuildItemsAsync(order.Id, currency)
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");

            var response = await _httpClient.PostAsync($"{apiBaseUrl}/checkout", content);
            var responseContent = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Tamara checkout creation failed. Status: {StatusCode}, Response: {Response}",
                    response.StatusCode, responseContent);
                return new PaymentInitiationResult
                {
                    Success = false,
                    Error = "Failed to create Tamara checkout session"
                };
            }

            var responseData = JsonSerializer.Deserialize<TamaraCheckoutResponse>(responseContent);
            if (responseData == null || string.IsNullOrWhiteSpace(responseData.CheckoutUrl))
            {
                _logger.LogError("Tamara checkout response missing checkout_url. Response: {Response}", responseContent);
                return new PaymentInitiationResult
                {
                    Success = false,
                    Error = "Invalid Tamara checkout response"
                };
            }

            // Prefer order_id as our provider reference (stable identifier returned by Tamara).
            var providerRef = !string.IsNullOrWhiteSpace(responseData.OrderId)
                ? responseData.OrderId
                : responseData.CheckoutId;

            return new PaymentInitiationResult
            {
                Success = true,
                CheckoutUrl = responseData.CheckoutUrl,
                CheckoutId = providerRef
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating Tamara checkout for order {OrderId}", order.Id);
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
            // Tamara sends a JWT token (tamaraToken) via query param and Authorization header.
            // Our controller forwards that token as `signature`.
            if (!ValidateWebhookToken(signature))
            {
                _logger.LogWarning("Invalid Tamara webhook token");
                return false;
            }

            using var doc = JsonDocument.Parse(payload);
            var root = doc.RootElement;

            var orderReference = TryGetString(root, "order_reference_id")
                                 ?? TryGetString(root, "orderReferenceId")
                                 ?? TryGetStringFromNested(root, "order", "order_reference_id")
                                 ?? TryGetStringFromNested(root, "order", "orderReferenceId");

            if (!Guid.TryParse(orderReference, out var orderId))
            {
                // Fallback: if Tamara sends its order_id, try to resolve the local order via Payment.ProviderRef.
                var tamaraOrderId = TryGetString(root, "order_id")
                                    ?? TryGetString(root, "orderId")
                                    ?? TryGetStringFromNested(root, "order", "order_id")
                                    ?? TryGetStringFromNested(root, "order", "orderId");

                if (!string.IsNullOrWhiteSpace(tamaraOrderId))
                {
                    var paymentByRef = await _context.Payments
                        .AsNoTracking()
                        .FirstOrDefaultAsync(p => p.Provider == "Tamara" && p.ProviderRef == tamaraOrderId);

                    if (paymentByRef != null)
                    {
                        orderId = paymentByRef.OrderId;
                    }
                }
            }

            if (orderId == Guid.Empty)
            {
                _logger.LogWarning("Could not resolve local orderId from Tamara webhook payload");
                return false;
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .Include(o => o.Bill)
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                _logger.LogWarning("Order not found for Tamara webhook: {OrderId}", orderId);
                return false;
            }

            var payment = await _context.Payments
                .FirstOrDefaultAsync(p => p.OrderId == orderId && p.Provider == "Tamara");

            if (payment == null)
            {
                _logger.LogWarning("Payment not found for order {OrderId} and provider Tamara", orderId);
                return false;
            }

            var status = (TryGetString(root, "status")
                          ?? TryGetStringFromNested(root, "order", "status")
                          ?? "").Trim();

            payment.Status = status.ToLowerInvariant() switch
            {
                "approved" or "paid" or "success" or "captured" => PaymentStatus.Completed,
                "cancelled" or "canceled" => PaymentStatus.Cancelled,
                "declined" or "failed" or "rejected" => PaymentStatus.Failed,
                _ => PaymentStatus.Processing
            };

            var providerRef = TryGetString(root, "order_id")
                              ?? TryGetStringFromNested(root, "order", "order_id")
                              ?? payment.ProviderRef;

            payment.ProviderRef = providerRef;
            payment.CapturedAt = DateTime.UtcNow;
            payment.RawPayload = payload;
            payment.UpdatedAt = DateTime.UtcNow;

            if (payment.Status == PaymentStatus.Completed)
            {
                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Send order confirmation email with invoice (same behavior as other gateways)
                try
                {
                    var locale = order.User?.Locale ?? "en";
                    var emailSent = await _emailService.SendOrderConfirmationEmailAsync(order, locale);
                    if (!emailSent)
                    {
                        _logger.LogWarning("Failed to send order confirmation email for order {OrderId}", orderId);
                    }
                }
                catch (Exception emailEx)
                {
                    _logger.LogError(emailEx, "Error sending order confirmation email for order {OrderId}", orderId);
                }
            }
            else if (payment.Status == PaymentStatus.Failed || payment.Status == PaymentStatus.Cancelled)
            {
                order.Status = payment.Status == PaymentStatus.Cancelled ? OrderStatus.Cancelled : OrderStatus.Failed;
                order.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
            else
            {
                await _context.SaveChangesAsync();
            }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Tamara webhook");
            return false;
        }
    }

    public Task<bool> RefundAsync(Payment payment, decimal? amount = null)
    {
        // Tamara refund/cancel APIs vary by merchant setup. Implement once endpoint + required fields are confirmed.
        _logger.LogWarning("Tamara RefundAsync is not implemented. PaymentId: {PaymentId}", payment.Id);
        return Task.FromResult(false);
    }

    private bool ValidateWebhookToken(string tokenOrHeaderValue)
    {
        var notificationToken = _configuration["Tamara:NotificationToken"];
        if (string.IsNullOrWhiteSpace(notificationToken) ||
            notificationToken.StartsWith("your-", StringComparison.OrdinalIgnoreCase))
        {
            // Development mode: allow webhook without validation if not configured.
            _logger.LogWarning("⚠️ Tamara webhook validation SKIPPED (no notification token configured) - DEVELOPMENT MODE");
            return true;
        }

        var token = tokenOrHeaderValue?.Trim() ?? "";
        if (token.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            token = token.Substring("Bearer ".Length).Trim();
        }

        if (string.IsNullOrWhiteSpace(token))
        {
            return false;
        }

        try
        {
            var handler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(notificationToken)),
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            handler.ValidateToken(token, validationParameters, out _);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Tamara webhook token validation failed");
            return false;
        }
    }

    private async Task<List<object>> BuildItemsAsync(Guid orderId, string currency)
    {
        // Best effort: include order items (Tamara typically requires item lines).
        // If order items are not available, send a single line item.
        var order = await _context.Orders
            .Include(o => o.OrderItems)
            .FirstOrDefaultAsync(o => o.Id == orderId);

        if (order?.OrderItems == null || order.OrderItems.Count == 0)
        {
            return new List<object>
            {
                new
                {
                    name = "Training Course",
                    reference_id = orderId.ToString(),
                    type = "digital",
                    sku = orderId.ToString(),
                    quantity = 1,
                    unit_price = new { amount = order?.Amount.ToString("F2") ?? "0.00", currency },
                    total_amount = new { amount = order?.Amount.ToString("F2") ?? "0.00", currency }
                }
            };
        }

        // We don't have course titles here without joining Course, so keep names generic and stable.
        return order.OrderItems.Select(oi => (object)new
        {
            name = "Training Course",
            reference_id = oi.CourseId.ToString(),
            type = "digital",
            sku = oi.CourseId.ToString(),
            quantity = oi.Qty,
            unit_price = new { amount = oi.Price.ToString("F2"), currency },
            total_amount = new { amount = (oi.Price * oi.Qty).ToString("F2"), currency }
        }).ToList();
    }

    private static string DeriveFailureUrl(string successUrl, string status)
    {
        // If URL contains /checkout/success, swap to /checkout/failed; otherwise append a status query.
        if (successUrl.Contains("/checkout/success", StringComparison.OrdinalIgnoreCase))
        {
            return successUrl.Replace("/checkout/success", "/checkout/failed", StringComparison.OrdinalIgnoreCase);
        }

        var separator = successUrl.Contains("?") ? "&" : "?";
        return $"{successUrl}{separator}status={status}";
    }

    private static string ExtractFirstName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "Customer";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 0 ? parts[0] : "Customer";
    }

    private static string ExtractLastName(string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return "Customer";
        var parts = fullName.Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
        return parts.Length > 1 ? parts[^1] : "Customer";
    }

    private static string? TryGetString(JsonElement element, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;
        if (!element.TryGetProperty(propertyName, out var prop)) return null;
        return prop.ValueKind switch
        {
            JsonValueKind.String => prop.GetString(),
            JsonValueKind.Number => prop.GetRawText(),
            _ => prop.GetRawText()
        };
    }

    private static string? TryGetStringFromNested(JsonElement element, string nestedObject, string propertyName)
    {
        if (element.ValueKind != JsonValueKind.Object) return null;
        if (!element.TryGetProperty(nestedObject, out var obj)) return null;
        return TryGetString(obj, propertyName);
    }
}

public class TamaraCheckoutResponse
{
    [JsonPropertyName("order_id")]
    public string? OrderId { get; set; }

    [JsonPropertyName("checkout_id")]
    public string? CheckoutId { get; set; }

    [JsonPropertyName("status")]
    public string? Status { get; set; }

    [JsonPropertyName("checkout_url")]
    public string? CheckoutUrl { get; set; }
}

