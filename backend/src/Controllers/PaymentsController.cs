using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
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

    public PaymentsController(
        ErsaTrainingDbContext context,
        IPaymentService paymentService,
        ILogger<PaymentsController> logger)
    {
        _context = context;
        _paymentService = paymentService;
        _logger = logger;
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
            var payload = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["X-Signature"].FirstOrDefault() ?? "";

            var success = await _paymentService.ProcessWebhookAsync(payload, signature, "ClickPay");
            
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
            _logger.LogError(ex, "Error processing ClickPay webhook");
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
            // Handle payment return from HyperPay
            // This is typically a GET request that redirects the user back to the frontend
            // You can extract order information and redirect to appropriate success/failure page
            
            var frontendUrl = "https://your-frontend-domain.com"; // Get from configuration
            
            if (!string.IsNullOrEmpty(orderId) && Guid.TryParse(orderId, out var orderGuid))
            {
                var order = await _context.Orders.FindAsync(orderGuid);
                if (order != null)
                {
                    if (status?.ToLower() == "success" || order.Status == OrderStatus.Paid)
                    {
                        return Redirect($"{frontendUrl}/checkout/success?orderId={orderId}");
                    }
                    else
                    {
                        return Redirect($"{frontendUrl}/checkout/failed?orderId={orderId}");
                    }
                }
            }

            return Redirect($"{frontendUrl}/checkout/failed");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error handling payment return");
            return Redirect($"https://your-frontend-domain.com/checkout/failed");
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