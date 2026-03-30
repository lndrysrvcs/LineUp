using LineUp.Backend.Models;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

    [HttpGet("{guid:guid}")]
    public async Task<IActionResult> GetAvailability(Guid guid)
    {
        var result = await context
            .Availabilities.Include(a => a.Schedule)
            .FirstOrDefaultAsync(a => a.Guid == guid);
        if (result != null)
            return Ok(result);
        return NotFound();
    }

    [HttpPatch("{guid:guid}/edit")]
    public async Task<IActionResult> EditAvailability(
        Guid guid,
        [FromBody] EditAvailabilityDto availability
    )
    {
        var availabilityToUpdate = await context.Availabilities.FirstOrDefaultAsync(a =>
            a.Guid == guid
        );
        if (availabilityToUpdate == null)
            return NotFound();

        availabilityToUpdate.UserName = availability.UserName ?? availabilityToUpdate.UserName;
        availabilityToUpdate.UserEmail = availability.UserEmail ?? availabilityToUpdate.UserEmail;
        availabilityToUpdate.AvailabilitySlots =
            availability.AvailabilitySlots ?? availabilityToUpdate.AvailabilitySlots;

        await context.SaveChangesAsync();

        return NoContent();
    }
}
