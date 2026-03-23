using CSharpVitamins;
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

    [HttpGet($"{{guid:{nameof(ShortGuid)}}}/exists")]
    public IActionResult Exists(ShortGuid guid)
    {
        if (context.Availabilities.Any(a => a.Guid == guid))
        {
            return Ok();
        }

        return NotFound();
    }

    [HttpGet($"{{guid:{nameof(ShortGuid)}}}")]
    public async Task<IActionResult> GetAvailability(ShortGuid guid)
    {
        var result = await context.Availabilities.FirstOrDefaultAsync(a => a.Guid == guid);
        if (result != null)
            return Ok(result);
        return NotFound();
    }

    [HttpPatch($"{{guid:{nameof(ShortGuid)}}}/edit")]
    public async Task<IActionResult> EditAvailability(
        ShortGuid guid,
        [FromBody] Availability availability
    )
    {
        if (guid != availability.Guid)
        {
            return BadRequest();
        }
        context.Entry(availability).State = EntityState.Modified;
        try
        {
            await context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!context.Availabilities.Any(a => a.Guid == guid))
            {
                return NotFound();
            }
            throw;
        }

        return NoContent();
    }
}
