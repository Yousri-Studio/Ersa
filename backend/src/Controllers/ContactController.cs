using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ErsaTraining.API.Data;
using ErsaTraining.API.Data.Entities;
using ErsaTraining.API.DTOs;
using ErsaTraining.API.Services;
using Microsoft.AspNetCore.Authorization;

namespace ErsaTraining.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly ErsaTrainingDbContext _context;
    private readonly ILogger<ContactController> _logger;
    private readonly IEmailService _emailService;

    public ContactController(ErsaTrainingDbContext context, ILogger<ContactController> logger, IEmailService emailService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
    }

    /// <summary>
    /// Submit a contact form message
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<ContactFormResponse>> SubmitContactForm([FromBody] ContactFormRequest request)
    {
        try
        {
            // Validate the request
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            // Create contact message entity
            var contactMessage = new ContactMessage
            {
                Id = Guid.NewGuid(),
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = request.Email.Trim().ToLowerInvariant(),
                Phone = request.Phone?.Trim(),
                Subject = request.Subject.Trim(),
                Message = request.Message.Trim(),
                Status = ContactStatus.New,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Save to database
            _context.ContactMessages.Add(contactMessage);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Contact form submitted successfully by {Email} with subject: {Subject}", 
                contactMessage.Email, contactMessage.Subject);

            // Send email notification to admin
            var adminEmailSent = await _emailService.SendContactFormNotificationAsync(
                contactMessage.FirstName, 
                contactMessage.LastName, 
                contactMessage.Email, 
                contactMessage.Phone, 
                contactMessage.Subject, 
                contactMessage.Message, 
                request.Locale
            );

            // Send confirmation email to user
            var confirmationEmailSent = await _emailService.SendContactConfirmationAsync(
                contactMessage.FirstName, 
                contactMessage.LastName, 
                contactMessage.Email, 
                request.Locale
            );

            if (!adminEmailSent)
            {
                _logger.LogWarning("Failed to send admin notification email for contact form from {Email}", contactMessage.Email);
            }

            if (!confirmationEmailSent)
            {
                _logger.LogWarning("Failed to send confirmation email to {Email}", contactMessage.Email);
            }

            return Ok(new ContactFormResponse
            {
                Success = true,
                Message = "Your message has been sent successfully. We will contact you soon.",
                SubmittedAt = contactMessage.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error submitting contact form for email: {Email}", request.Email);
            return StatusCode(500, new ContactFormResponse
            {
                Success = false,
                Message = "An error occurred while sending your message. Please try again later.",
                SubmittedAt = DateTime.UtcNow
            });
        }
    }

    /// <summary>
    /// Get all contact messages (Admin only)
    /// </summary>
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetContactMessages(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] ContactStatus? status = null)
    {
        try
        {
            var query = _context.ContactMessages
                .Include(c => c.ResponseByUser)
                .AsQueryable();

            if (status.HasValue)
            {
                query = query.Where(c => c.Status == status.Value);
            }

            var totalCount = await query.CountAsync();
            
            var messages = await query
                .OrderByDescending(c => c.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(c => new ContactMessageDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    Phone = c.Phone,
                    Subject = c.Subject,
                    Message = c.Message,
                    Status = c.Status,
                    Response = c.Response,
                    ResponseByUserName = c.ResponseByUser != null ? c.ResponseByUser.FullName : null,
                    ResponseAt = c.ResponseAt,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .ToListAsync();

            Response.Headers.Add("X-Total-Count", totalCount.ToString());
            Response.Headers.Add("X-Page", page.ToString());
            Response.Headers.Add("X-Page-Size", pageSize.ToString());

            return Ok(messages);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact messages");
            return StatusCode(500, "An error occurred while retrieving contact messages.");
        }
    }

    /// <summary>
    /// Get a specific contact message by ID (Admin only)
    /// </summary>
    [HttpGet("{id}")]
    [Authorize]
    public async Task<ActionResult<ContactMessageDto>> GetContactMessage(Guid id)
    {
        try
        {
            var message = await _context.ContactMessages
                .Include(c => c.ResponseByUser)
                .Where(c => c.Id == id)
                .Select(c => new ContactMessageDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    Phone = c.Phone,
                    Subject = c.Subject,
                    Message = c.Message,
                    Status = c.Status,
                    Response = c.Response,
                    ResponseByUserName = c.ResponseByUser != null ? c.ResponseByUser.FullName : null,
                    ResponseAt = c.ResponseAt,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .FirstOrDefaultAsync();

            if (message == null)
            {
                return NotFound("Contact message not found.");
            }

            return Ok(message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving contact message {Id}", id);
            return StatusCode(500, "An error occurred while retrieving the contact message.");
        }
    }

    /// <summary>
    /// Update contact message status and add response (Admin only)
    /// </summary>
    [HttpPut("{id}")]
    [Authorize]
    public async Task<ActionResult<ContactMessageDto>> UpdateContactMessage(Guid id, [FromBody] UpdateContactMessageRequest request)
    {
        try
        {
            var message = await _context.ContactMessages.FindAsync(id);
            if (message == null)
            {
                return NotFound("Contact message not found.");
            }

            // Update fields
            message.Status = request.Status;
            message.Response = request.Response;
            message.UpdatedAt = DateTime.UtcNow;

            if (!string.IsNullOrEmpty(request.Response))
            {
                // TODO: Get current user ID from JWT token
                // message.ResponseByUserId = currentUserId;
                message.ResponseAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            _logger.LogInformation("Contact message {Id} updated by admin", id);

            // Return updated message
            var updatedMessage = await _context.ContactMessages
                .Include(c => c.ResponseByUser)
                .Where(c => c.Id == id)
                .Select(c => new ContactMessageDto
                {
                    Id = c.Id,
                    FirstName = c.FirstName,
                    LastName = c.LastName,
                    Email = c.Email,
                    Phone = c.Phone,
                    Subject = c.Subject,
                    Message = c.Message,
                    Status = c.Status,
                    Response = c.Response,
                    ResponseByUserName = c.ResponseByUser != null ? c.ResponseByUser.FullName : null,
                    ResponseAt = c.ResponseAt,
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                })
                .FirstAsync();

            return Ok(updatedMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating contact message {Id}", id);
            return StatusCode(500, "An error occurred while updating the contact message.");
        }
    }
}
