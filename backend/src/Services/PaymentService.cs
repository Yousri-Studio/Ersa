using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;

namespace ErsaTraining.API.Services;

/// <summary>
/// Provides services for processing payments across multiple payment gateways.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly Dictionary<string, IPaymentGateway> _gateways;
    private readonly ErsaTrainingDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<PaymentService> _logger;
    private readonly IEnrollmentService _enrollmentService;
    private readonly IBillService _billService;

    public PaymentService(
        IEnumerable<IPaymentGateway> gateways,
        ErsaTrainingDbContext context,
        IConfiguration configuration,
        ILogger<PaymentService> logger,
        IEnrollmentService enrollmentService,
        IBillService billService)
    {
        _gateways = gateways.ToDictionary(g => g.ProviderName, StringComparer.OrdinalIgnoreCase);
        _context = context;
        _configuration = configuration;
        _logger = logger;
        _enrollmentService = enrollmentService;
        _billService = billService;
    }

    /// <summary>
    /// Creates a checkout URL for the specified order.
    /// </summary>
    /// <param name="order">The order to create a checkout for.</param>
    /// <param name="returnUrl">The URL to redirect the user to after payment.</param>
    /// <param name="provider">The payment provider to use. If null, uses default based on configuration.</param>
    /// <returns>The URL for the payment checkout page.</returns>
    public async Task<string> CreateCheckoutUrlAsync(Order order, string returnUrl, string? provider = null)
    {
        try
        {
            // Determine which gateway to use
            var gatewayToUse = provider ?? GetDefaultGateway();
            
            // Validate gateway is available
            var availableGateways = GetAvailableGateways();
            if (!availableGateways.Contains(gatewayToUse, StringComparer.OrdinalIgnoreCase))
            {
                throw new InvalidOperationException($"Payment gateway '{gatewayToUse}' is not available. Available gateways: {string.Join(", ", availableGateways)}");
            }

            if (!_gateways.TryGetValue(gatewayToUse, out var gateway))
            {
                throw new InvalidOperationException($"Payment gateway '{gatewayToUse}' not found");
            }

            // Initiate payment with the selected gateway
            var result = await gateway.InitiatePaymentAsync(order, returnUrl);
            
            if (!result.Success)
            {
                throw new InvalidOperationException(result.Error ?? "Payment initiation failed");
            }

            // Create payment record
            var payment = new Payment
            {
                Id = Guid.NewGuid(),
                OrderId = order.Id,
                Provider = gatewayToUse,
                ProviderRef = result.CheckoutId,
                Status = PaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Payments.Add(payment);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Payment checkout created for order {OrderId} using {Provider}", order.Id, gatewayToUse);
            return result.CheckoutUrl!;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout for order {OrderId}", order.Id);
            throw;
        }
    }

    /// <summary>
    /// Processes a webhook notification from a payment gateway.
    /// </summary>
    /// <param name="payload">The webhook payload.</param>
    /// <param name="signature">The webhook signature.</param>
    /// <param name="provider">The payment provider that sent the webhook.</param>
    /// <returns>True if the webhook was processed successfully, otherwise false.</returns>
    public async Task<bool> ProcessWebhookAsync(string payload, string signature, string provider)
    {
        try
        {
            if (!_gateways.TryGetValue(provider, out var gateway))
            {
                _logger.LogWarning("Unknown payment provider in webhook: {Provider}", provider);
                return false;
            }

            var result = await gateway.ProcessWebhookAsync(payload, signature);
            
            if (result)
            {
                // Additional processing after successful webhook
                // Gateway has already updated payment status, now we handle order/enrollment logic
                var webhookDataJson = System.Text.Json.JsonDocument.Parse(payload);
                var root = webhookDataJson.RootElement;
                
                // Try to extract order ID (different providers have different structures)
                Guid? orderId = null;
                
                if (provider.Equals("HyperPay", StringComparison.OrdinalIgnoreCase))
                {
                    if (root.TryGetProperty("OrderId", out var orderIdProp) && Guid.TryParse(orderIdProp.GetString(), out var parsedOrderId))
                    {
                        orderId = parsedOrderId;
                    }
                }
                else if (provider.Equals("ClickPay", StringComparison.OrdinalIgnoreCase))
                {
                    if (root.TryGetProperty("cart_id", out var cartIdProp) && Guid.TryParse(cartIdProp.GetString(), out var parsedCartId))
                    {
                        orderId = parsedCartId;
                    }
                }
                else if (provider.Equals("Tamara", StringComparison.OrdinalIgnoreCase))
                {
                    // Preferred: order_reference_id contains our local OrderId
                    if (root.TryGetProperty("order_reference_id", out var orderRefProp) &&
                        Guid.TryParse(orderRefProp.GetString(), out var parsedOrderRef))
                    {
                        orderId = parsedOrderRef;
                    }
                    else if (root.TryGetProperty("orderReferenceId", out var orderRefProp2) &&
                             Guid.TryParse(orderRefProp2.GetString(), out var parsedOrderRef2))
                    {
                        orderId = parsedOrderRef2;
                    }
                    else if (root.TryGetProperty("order_id", out var tamaraOrderIdProp))
                    {
                        // Fallback: resolve local order via ProviderRef (we store Tamara order_id as ProviderRef)
                        var tamaraOrderId = tamaraOrderIdProp.GetString();
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
                }

                if (orderId.HasValue)
                {
                    var order = await _context.Orders
                        .Include(o => o.User)
                        .Include(o => o.Bill)
                        .Include(o => o.OrderItems) // ✅ CRITICAL: Include OrderItems for enrollment creation
                        .FirstOrDefaultAsync(o => o.Id == orderId.Value);

                    var payment = await _context.Payments
                        .FirstOrDefaultAsync(p => p.OrderId == orderId.Value && p.Provider == provider);

                    if (order != null && payment != null)
                    {
                        // Update bill if exists
                        if (order.Bill != null && payment.Status == PaymentStatus.Completed)
                        {
                            await _billService.UpdateBillStatusAsync(order.Bill.Id, BillStatus.Paid, provider, payment.ProviderRef ?? "");
                        }

                        // Create enrollments for successful payment
                        if (payment.Status == PaymentStatus.Completed && order.Status == OrderStatus.Paid)
                        {
                            await _enrollmentService.CreateEnrollmentsFromOrderAsync(order);
                            _logger.LogInformation("Enrollments created for order {OrderId} via {Provider}", orderId.Value, provider);
                        }
                    }
                }
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing {Provider} webhook", provider);
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
                _logger.LogWarning("Cannot refund payment {PaymentId}: Invalid payment or status", paymentId);
                return false;
            }

            if (!_gateways.TryGetValue(payment.Provider, out var gateway))
            {
                _logger.LogWarning("Payment gateway {Provider} not found for refund", payment.Provider);
                return false;
            }

            var result = await gateway.RefundAsync(payment, amount);
            
            if (result)
            {
                _logger.LogInformation("Refund processed successfully for payment {PaymentId} via {Provider}", paymentId, payment.Provider);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {PaymentId}", paymentId);
            return false;
        }
    }

    /// <summary>
    /// Gets the list of available payment gateways based on configuration.
    /// </summary>
    /// <returns>List of available gateway names.</returns>
    public List<string> GetAvailableGateways()
    {
        // Preferred: explicit allow-list of enabled gateways (order preserved)
        var enabledGateways = _configuration
            .GetSection("PaymentGateway:EnabledGateways")
            .Get<string[]>();

        if (enabledGateways != null && enabledGateways.Length > 0)
        {
            return enabledGateways
                .Where(g => !string.IsNullOrWhiteSpace(g))
                .Select(g => g.Trim())
                // Must exist in DI-registered gateways
                .Where(g => _gateways.ContainsKey(g))
                // Must be configured (credential gating)
                .Where(IsGatewayConfigured)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        // Backward-compatible fallback: legacy int switch
        var gatewayMethod = _configuration.GetValue<int>("PaymentGateway:GatewayMethod");
        var legacy = gatewayMethod switch
        {
            0 => _gateways.Keys.ToList(), // All registered gateways
            1 => new List<string> { "HyperPay" },
            2 => new List<string> { "ClickPay" },
            _ => new List<string>()
        };

        return legacy
            .Where(IsGatewayConfigured)
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    /// <summary>
    /// Gets the default payment gateway based on configuration.
    /// </summary>
    /// <returns>Default gateway name.</returns>
    public string GetDefaultGateway()
    {
        var available = GetAvailableGateways();
        if (available.Count == 0)
        {
            throw new InvalidOperationException("No active payment gateways are available (check PaymentGateway:EnabledGateways and provider credentials).");
        }

        var configuredDefault = _configuration["PaymentGateway:DefaultGateway"];
        if (!string.IsNullOrWhiteSpace(configuredDefault))
        {
            var trimmed = configuredDefault.Trim();
            if (available.Contains(trimmed, StringComparer.OrdinalIgnoreCase))
            {
                return trimmed;
            }
        }

        // Fallback: first available gateway (preserves EnabledGateways order)
        return available[0];
    }

    private bool IsGatewayConfigured(string providerName)
    {
        // Hide gateways that are enabled but missing required credentials.
        // This keeps the UI showing only truly "active" methods.

        if (providerName.Equals("ClickPay", StringComparison.OrdinalIgnoreCase))
        {
            var profileId = _configuration["ClickPay:ProfileId"];
            var serverKey = _configuration["ClickPay:ServerKey"];
            return HasRealValue(profileId) && HasRealValue(serverKey);
        }

        if (providerName.Equals("HyperPay", StringComparison.OrdinalIgnoreCase))
        {
            var entityId = _configuration["HyperPay:EntityId"];
            var accessToken = _configuration["HyperPay:AccessToken"];
            return HasRealValue(entityId) && HasRealValue(accessToken);
        }

        if (providerName.Equals("Tamara", StringComparison.OrdinalIgnoreCase))
        {
            var apiBaseUrl = _configuration["Tamara:ApiBaseUrl"];
            var apiToken = _configuration["Tamara:ApiToken"];
            var notificationToken = _configuration["Tamara:NotificationToken"];
            return HasRealValue(apiBaseUrl) && HasRealValue(apiToken) && HasRealValue(notificationToken);
        }

        // Unknown provider: assume configured (so we don't unintentionally hide new providers)
        return true;
    }

    private static bool HasRealValue(string? value)
    {
        if (string.IsNullOrWhiteSpace(value)) return false;
        var v = value.Trim();
        return !(v.StartsWith("your-", StringComparison.OrdinalIgnoreCase) || v.Contains("your-", StringComparison.OrdinalIgnoreCase));
    }
}