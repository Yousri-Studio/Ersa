using System.Net;
using System.Text.Json;

namespace ErsaTraining.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = new
        {
            error = "Internal server error",
            message = exception.Message,
            statusCode = (int)HttpStatusCode.InternalServerError
        };

        switch (exception)
        {
            case ArgumentNullException:
                response = new
                {
                    error = "Bad request",
                    message = exception.Message,
                    statusCode = (int)HttpStatusCode.BadRequest
                };
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                break;
            
            case UnauthorizedAccessException:
                response = new
                {
                    error = "Unauthorized",
                    message = exception.Message,
                    statusCode = (int)HttpStatusCode.Unauthorized
                };
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                break;
                
            case KeyNotFoundException:
                response = new
                {
                    error = "Not found",
                    message = exception.Message,
                    statusCode = (int)HttpStatusCode.NotFound
                };
                context.Response.StatusCode = (int)HttpStatusCode.NotFound;
                break;
                
            default:
                context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                break;
        }

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }
}