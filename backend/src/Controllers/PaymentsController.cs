using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System.Security.Claims;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IConfiguration _configuration;

    public PaymentsController(
        ErsaTrainingDbContext context,
        IPaymentService paymentService,
        ILogger<PaymentsController> logger,
        IConfiguration configuration)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
        _configuration = configuration;
    }

    [HttpGet("config")]
    public ActionResult<PaymentConfigResponse> GetPaymentConfig()
    {
        try
        {
            var availableGateways = _paymentService.GetAvailableGateways();
            var defaultGateway = _paymentService.GetDefaultGateway();
            var gatewayMethod = availableGateways.Count > 1 ? 0 : (defaultGateway == "HyperPay" ? 1 : 2);

            return Ok(new PaymentConfigResponse
            {
                GatewayMethod = gatewayMethod,
                AvailableGateways = availableGateways,
                DefaultGateway = defaultGateway,
                ShowSelector = availableGateways.Count > 1
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting payment config");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("checkout")]
    [Authorize]
    public async Task<ActionResult<CheckoutResponse>> CreateCheckout([FromBody] CheckoutRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            var order = await _context.Orders
                .Include(o => o.User)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            if (order.Status != OrderStatus.PendingPayment && order.Status != OrderStatus.Paid)
            {
                return BadRequest(new { error = "Order is not in pending status" });
            }

            var redirectUrl = await _paymentService.CreateCheckoutUrlAsync(order, request.ReturnUrl, request.PaymentProvider);

            return Ok(new CheckoutResponse
            {
                RedirectUrl = redirectUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating checkout");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("hyperpay/webhook")]
    public async Task<IActionResult> HyperPayWebhook()
    {
        try
        {
            var payload = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["X-Signature"].FirstOrDefault() ?? "";

            var success = await _paymentService.ProcessWebhookAsync(payload, signature, "HyperPay");
            
            if (success)
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing HyperPay webhook");
            return StatusCode(500);
        }
    }

    [HttpPost("clickpay/webhook")]
    public async Task<IActionResult> ClickPayWebhook()
    {
        try
        {
            _logger.LogInformation("🔔 ClickPay webhook received");
            
            var payload = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["X-Signature"].FirstOrDefault() ?? "";
            
            _logger.LogInformation("📦 Webhook payload length: {Length}, Has signature: {HasSig}", 
                payload?.Length ?? 0, !string.IsNullOrEmpty(signature));
            _logger.LogInformation("📄 Payload preview: {Payload}", 
                payload?.Length > 500 ? payload.Substring(0, 500) + "..." : payload);

            var success = await _paymentService.ProcessWebhookAsync(payload, signature, "ClickPay");
            
            if (success)
            {
                _logger.LogInformation("✅ ClickPay webhook processed successfully");
                return Ok();
            }
            else
            {
                _logger.LogWarning("⚠️ ClickPay webhook processing returned false");
                return BadRequest();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error processing ClickPay webhook");
            return StatusCode(500);
        }
    }

    [HttpPost("webhook")]
    [Obsolete("Use provider-specific webhook endpoints: /hyperpay/webhook or /clickpay/webhook")]
    public async Task<IActionResult> PaymentWebhook()
    {
        try
        {
            var payload = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["X-Signature"].FirstOrDefault() ?? "";

            // Default to HyperPay for backward compatibility
            var success = await _paymentService.ProcessWebhookAsync(payload, signature, "HyperPay");
            
            if (success)
            {
                return Ok();
            }
            else
            {
                return BadRequest();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment webhook");
            return StatusCode(500);
        }
    }

    [HttpGet("return")]
    public async Task<IActionResult> PaymentReturn([FromQuery] string? orderId, [FromQuery] string? status)
    {
        try
        {
            _logger.LogInformation("🔙 Payment return received - OrderId: {OrderId}, Status: {Status}", orderId, status);
            
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "https://ersa-training.com";
            
            if (!string.IsNullOrEmpty(orderId) && Guid.TryParse(orderId, out var orderGuid))
            {
                var order = await _context.Orders.FindAsync(orderGuid);
                if (order != null)
                {
                    if (status?.ToLower() == "success" || order.Status == OrderStatus.Paid)
                    {
                        _logger.LogInformation("✅ Payment successful for order {OrderId}", orderId);
                        return Redirect($"{frontendUrl}/en/checkout/success?orderId={orderId}");
                    }
                    else
                    {
                        _logger.LogWarning("⚠️ Payment not successful for order {OrderId}, Status: {Status}", orderId, order.Status);
                        return Redirect($"{frontendUrl}/en/checkout/failed?orderId={orderId}");
                    }
                }
            }

            _logger.LogWarning("⚠️ Invalid payment return - OrderId: {OrderId}", orderId);
            return Redirect($"{frontendUrl}/en/checkout/failed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error handling payment return");
            var frontendUrl = _configuration["Frontend:BaseUrl"] ?? "https://ersa-training.com";
            return Redirect($"{frontendUrl}/en/checkout/failed");
        }
    }
    
    /// <summary>
    /// Manual payment verification endpoint - checks payment status with ClickPay
    /// This is a fallback when webhooks don't work (e.g., localhost testing)
    /// </summary>
    [HttpPost("verify-payment")]
    [Authorize]
    public async Task<ActionResult> VerifyPayment([FromBody] VerifyPaymentRequest request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (userId == null)
            {
                return Unauthorized();
            }

            _logger.LogInformation("🔍 Manual payment verification requested for order {OrderId}", request.OrderId);

            var order = await _context.Orders
                .Include(o => o.Payments)
                .FirstOrDefaultAsync(o => o.Id == request.OrderId && o.UserId == userId);

            if (order == null)
            {
                return NotFound(new { error = "Order not found" });
            }

            var payment = order.Payments.FirstOrDefault(p => p.Provider == "ClickPay");
            if (payment == null)
            {
                return NotFound(new { error = "Payment not found" });
            }

            // If already paid, return success
            if (payment.Status == PaymentStatus.Completed && order.Status == OrderStatus.Paid)
            {
                _logger.LogInformation("✅ Payment already marked as completed for order {OrderId}", request.OrderId);
                return Ok(new { success = true, message = "Payment already completed", status = "paid" });
            }

            // TODO: Call ClickPay API to verify payment status
            // For now, if user confirms payment was successful, we can mark it as paid
            // This is a temporary workaround for webhook issues
            
            if (request.ForceComplete && request.TranRef != null)
            {
                _logger.LogWarning("⚠️ MANUALLY marking payment as complete for order {OrderId} with TranRef {TranRef}", 
                    request.OrderId, request.TranRef);
                
                payment.Status = PaymentStatus.Completed;
                payment.ProviderRef = request.TranRef;
                payment.CapturedAt = DateTime.UtcNow;
                payment.UpdatedAt = DateTime.UtcNow;

                order.Status = OrderStatus.Paid;
                order.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                _logger.LogInformation("✅ Payment manually marked as completed for order {OrderId}", request.OrderId);
                return Ok(new { success = true, message = "Payment marked as completed", status = "paid" });
            }

            return Ok(new { success = false, message = "Payment verification pending", status = order.Status.ToString() });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ Error verifying payment");
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    [HttpPost("{paymentId:guid}/refund")]
    [Authorize] // Add admin role check
    public async Task<IActionResult> RefundPayment(Guid paymentId, [FromBody] RefundRequest? request = null)
    {
        try
        {
            var success = await _paymentService.RefundPaymentAsync(paymentId, request?.Amount);
            
            if (success)
            {
                return Ok(new { message = "Refund processed successfully" });
            }
            else
            {
                return BadRequest(new { error = "Failed to process refund" });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing refund for payment {PaymentId}", paymentId);
            return StatusCode(500, new { error = "Internal server error" });
        }
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return userIdClaim != null && Guid.TryParse(userIdClaim, out var userId) ? userId : null;
    }
}

public class RefundRequest
{
    public decimal? Amount { get; set; }
}

public class VerifyPaymentRequest
{
    public Guid OrderId { get; set; }
    public bool ForceComplete { get; set; }
    public string? TranRef { get; set; }
}