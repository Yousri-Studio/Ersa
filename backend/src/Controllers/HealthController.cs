
using Microsoft.AspNetCore.Mvc;

namespace ErsaTraining.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { 
                status = "healthy", 
                message = "API is running successfully",
                timestamp = DateTime.UtcNow,
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown"
            });
        }

        [HttpGet("demo")]
        public IActionResult GetDemo()
        {
            return Ok(new { 
                message = "Demo data endpoint working",
                data = new[] {
                    new { id = 1, name = "Sample Course 1", price = 99.99 },
                    new { id = 2, name = "Sample Course 2", price = 149.99 },
                    new { id = 3, name = "Sample Course 3", price = 199.99 }
                }
            });
        }
    }
}
