using Microsoft.AspNetCore.Mvc;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _emailService;
    private readonly ILogger<EmailController> _logger;

    public EmailController(
        IEmailService emailService,
        ILogger<EmailController> logger)
    {
        _emailService = emailService;
        _logger = logger;
    }

    /// <summary>
    /// Webhook endpoint for SendGrid event notifications
    /// This receives notifications about email delivery, opens, clicks, bounces, etc.
    /// </summary>
    [HttpPost("webhook")]
    public async Task<IActionResult> SendGridWebhook()
    {
        try
        {
            var payload = await new StreamReader(Request.Body).ReadToEndAsync();
            var signature = Request.Headers["X-Twilio-Email-Event-Webhook-Signature"].FirstOrDefault() ?? "";

            _logger.LogInformation("Received SendGrid webhook");
            
            await _emailService.ProcessWebhookAsync(payload, signature);
            
            return Ok();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing SendGrid webhook");
            return StatusCode(500);
        }
    }
}

