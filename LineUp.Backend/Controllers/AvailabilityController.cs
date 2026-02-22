using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LineUp.Backend.Controllers;

[Route("api/availability")]
[ApiController]
public class AvailabilityController(LineUpContext context) : ControllerBase
{
    [HttpGet("public")]
    public IActionResult Public()
    {
        return Ok(
            new
            {
                Message = "Hello from a public endpoint! You don't need to be authenticated to see this.",
            }
        );
    }

    [HttpGet("{guid:guid}/exists")]
    public IActionResult Exists(Guid guid)
    {
        if (context.Availabilities.Any(a => a.Guid == guid))
        {
            return Ok();
        }

        return NotFound();
    }
}
