using LineUp.Backend.Models;
using LineUp.Backend.Services;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend.Controllers;

[Route("api/availability")]
[ApiController]
public class AvailabilityController(LineUpContext context, IEmailService emailService)
    : ControllerBase
{
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
        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPatch("{guid:guid}/edit")]
    public async Task<IActionResult> EditAvailability(
        Guid guid,
        [FromBody] AvailabilityUpdateDTO availability
    )
    {
        var availabilityToUpdate = await context
            .Availabilities.Include(a => a.Schedule)
            .FirstOrDefaultAsync(a => a.Guid == guid);
        if (availabilityToUpdate == null)
            return NotFound();

        if (
            await context.ShiftAssignments.AnyAsync(sa =>
                sa.Availability != null && sa.Availability.Id == availabilityToUpdate.Id
            )
        )
        {
            return Forbid();
        }

        availabilityToUpdate.UserName = availability.UserName ?? availabilityToUpdate.UserName;
        availabilityToUpdate.UserEmail = availability.UserEmail ?? availabilityToUpdate.UserEmail;
        availabilityToUpdate.AvailabilitySlots =
            availability.AvailabilitySlots ?? availabilityToUpdate.AvailabilitySlots;

        await emailService.SendAvailabilityConfirmationEmail(true, availabilityToUpdate);

        await context.SaveChangesAsync();

        return NoContent();
    }
}
