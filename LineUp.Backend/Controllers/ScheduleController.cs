using LineUp.Backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend.Controllers;

[Route("api/schedule")]
[ApiController]
public class ScheduleController(LineUpContext context) : ControllerBase
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

    // This is a helper action. It allows you to easily view all the claims of the token.
    [HttpGet("claims")]
    public IActionResult Claims()
    {
        return Ok(User.Claims.Select(c => new { c.Type, c.Value }));
    }

    [HttpGet("{guid:guid}")]
    public async Task<IActionResult> GetSchedule(Guid guid)
    {
        var result = await context.FindAsync<Schedule>(guid);
        if (result != null)
            return Ok(result);
        return NotFound();
    }

    [HttpGet("/")]
    [Authorize]
    public async Task<IActionResult> GetSchedules()
    {
        var userId = User.FindFirst("sub")!.Value;
        List<Schedule> result = await context
            .Schedules.Where(s => s.Auth0UserId == userId)
            .ToListAsync();
        return Ok(result);
    }

    [HttpDelete("{guid:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteSchedule(Guid guid)
    {
        var scheduleToDelete = await context.FindAsync<Schedule>(guid);
        if (scheduleToDelete == null)
            return NotFound();
        if (scheduleToDelete.Auth0UserId != User.FindFirst("sub")!.Value)
            return Unauthorized();
        context.Schedules.Remove(scheduleToDelete);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{guid:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateSchedule(Guid guid, [FromBody] ScheduleDto schedule)
    {
        var scheduleToUpdate = await context.FindAsync<Schedule>(guid);
        if (scheduleToUpdate == null)
            return NotFound();
        if (scheduleToUpdate.Auth0UserId != User.FindFirst("sub")!.Value)
            return Unauthorized();
        scheduleToUpdate.DateCoverage = schedule.DateCoverage;
        scheduleToUpdate.StartTime = schedule.StartTime;
        scheduleToUpdate.EndTime = schedule.EndTime;
        scheduleToUpdate.SchedulePreferences = schedule.SchedulePreferences;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] ScheduleDto schedule)
    {
        var scheduleToInsert = new Schedule
        {
            Auth0UserId = User.FindFirst("sub")!.Value,
            Guid = Guid.NewGuid(),
            DateCoverage = schedule.DateCoverage,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            SchedulePreferences = schedule.SchedulePreferences,
        };

        context.Schedules.Add(scheduleToInsert);
        await context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSchedule),
            new { guid = scheduleToInsert.Guid },
            scheduleToInsert
        );
    }
}
