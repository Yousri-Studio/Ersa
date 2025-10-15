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

                if (orderId.HasValue)
                {
                    var order = await _context.Orders
                        .Include(o => o.User)
                        .Include(o => o.Bill)
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
        var gatewayMethod = _configuration.GetValue<int>("PaymentGateway:GatewayMethod");
        
        return gatewayMethod switch
        {
            0 => _gateways.Keys.ToList(), // Both gateways
            1 => new List<string> { "HyperPay" }, // Only HyperPay
            2 => new List<string> { "ClickPay" }, // Only ClickPay
            _ => new List<string> { GetDefaultGateway() } // Fallback to default
        };
    }

    /// <summary>
    /// Gets the default payment gateway based on configuration.
    /// </summary>
    /// <returns>Default gateway name.</returns>
    public string GetDefaultGateway()
    {
        var gatewayMethod = _configuration.GetValue<int>("PaymentGateway:GatewayMethod");
        var defaultGateway = _configuration["PaymentGateway:DefaultGateway"] ?? "ClickPay";
        
        return gatewayMethod switch
        {
            1 => "HyperPay",
            2 => "ClickPay",
            _ => defaultGateway
        };
    }
}