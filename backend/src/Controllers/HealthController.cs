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
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");

            return Ok(new { 
                status = "OK", 
                timestamp = DateTime.UtcNow,
                message = "API is running successfully"
            });
        }

        [HttpOptions]
        public IActionResult Options()
        {
            Response.Headers.Add("Access-Control-Allow-Origin", "*");
            Response.Headers.Add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
            Response.Headers.Add("Access-Control-Allow-Headers", "Content-Type, Authorization");

            return Ok();
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