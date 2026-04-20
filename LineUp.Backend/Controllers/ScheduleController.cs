using System.Diagnostics;
using System.Security.Claims;
using LineUp.Backend.Models;
using LineUp.Backend.Services;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Protocol;
using SQLitePCL;

namespace LineUp.Backend.Controllers;

[Route("api/schedule")]
[ApiController]
public class ScheduleController(LineUpContext context, IEmailService emailService) : ControllerBase
{
    [HttpGet("{guid:guid}/details")]
    [Authorize]
    public async Task<IActionResult> GetScheduleAuthenticated(Guid guid)
    {
        var schedule = await context
            .Schedules.Include(s => s.SchedulePreferences)
            .Include(schedule => schedule.Form)
            .Include(schedule => schedule.ShiftAssignments)
            .FirstOrDefaultAsync(s => s.Guid == guid);
        if (schedule == null)
            return NotFound();

        if (User.FindFirstValue(ClaimTypes.NameIdentifier) != schedule.Auth0UserId)
            return Unauthorized();
        List<Availability> availabilities = await context
            .Availabilities.Where(availability => availability.Schedule.Guid == guid)
            .ToListAsync();
        var dto = new GetScheduleAuthenticatedDto
        {
            Name = schedule.Name,
            DateCoverage = schedule.DateCoverage,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Form = schedule.Form,
            ShiftAssignments = schedule.ShiftAssignments,
            SchedulePreferences = schedule.SchedulePreferences,
            Availabilities = availabilities,
        };
        return Ok(dto);
    }

    [HttpGet("{guid:guid}")]
    public async Task<IActionResult> GetSchedule(Guid guid)
    {
        var schedule = await context
            .Schedules.Include(s => s.SchedulePreferences)
            .Include(schedule => schedule.Form)
            .Include(schedule => schedule.ShiftAssignments)
            .FirstOrDefaultAsync(s => s.Guid == guid);
        if (schedule == null)
            return NotFound();
        if (schedule.ShiftAssignments != null && schedule.ShiftAssignments.Count != 0)
        {
            foreach (var shiftAssignment in schedule.ShiftAssignments)
            {
                await context.Entry(shiftAssignment).Reference(sa => sa.Availability).LoadAsync();
            }
        }

        var availabilityCount = context.Availabilities.Count(availability =>
            availability.Schedule.Guid == guid
        );

        var dto = new GetScheduleUnauthenticatedDto
        {
            Name = schedule.Name,
            DateCoverage = schedule.DateCoverage,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            Form = schedule.Form,
            ShiftAssignments = schedule.ShiftAssignments,
            SchedulePreferences = schedule.SchedulePreferences,
            AvailabilityCount = availabilityCount,
        };

        return Ok(dto);
    }

    [HttpGet]
    [Authorize]
    public async Task<IActionResult> GetSchedules()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

        List<ScheduleListDto> result = await context
            .Schedules.Where(s => s.Auth0UserId == userId)
            .OrderByDescending(s => s.Id)
            .Include(s => s.ShiftAssignments)
            .Select(s => new ScheduleListDto
            {
                Name = s.Name,
                Guid = s.Guid,
                Respondents = context.Availabilities.Count(a => a.Schedule.Id == s.Id),
                IsGenerated = s.ShiftAssignments != null && s.ShiftAssignments.Count != 0,
            })
            .ToListAsync();

        return Ok(result);
    }

    [HttpDelete("{guid:guid}")]
    [Authorize]
    public async Task<IActionResult> DeleteSchedule(Guid guid)
    {
        var scheduleToDelete = await context
            .Schedules.Include(schedule => schedule.ShiftAssignments)
            .FirstOrDefaultAsync(s => s.Guid == guid);
        if (scheduleToDelete == null)
            return NotFound();
        if (scheduleToDelete.Auth0UserId != User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
            return Unauthorized();

        IQueryable<ShiftAssignment> shiftAssignments = context.ShiftAssignments.Where(sa =>
            sa.ScheduleId == scheduleToDelete.Id
        );
        context.ShiftAssignments.RemoveRange(shiftAssignments);

        context.Schedules.Remove(scheduleToDelete);
        await context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPatch("{guid:guid}")]
    [Authorize]
    public async Task<IActionResult> UpdateSchedule(
        Guid guid,
        [FromBody] ScheduleUpdateDto schedule
    )
    {
        var scheduleToUpdate = await context.Schedules.FirstOrDefaultAsync(s => s.Guid == guid);
        if (scheduleToUpdate == null)
            return NotFound();
        if (scheduleToUpdate.Auth0UserId != User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
            return Unauthorized();
        if (schedule.Name != null)
            scheduleToUpdate.Name = schedule.Name;
        if (schedule.SchedulePreferences != null)
            scheduleToUpdate.SchedulePreferences = schedule.SchedulePreferences;
        if (schedule.ShiftAssignments != null)
            scheduleToUpdate.ShiftAssignments = schedule.ShiftAssignments;
        await context.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateSchedule([FromBody] ScheduleDto schedule)
    {
        var scheduleToInsert = new Schedule
        {
            Auth0UserId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value,
            Guid = Guid.NewGuid(),
            DateCoverage = schedule.DateCoverage,
            StartTime = schedule.StartTime,
            EndTime = schedule.EndTime,
            SchedulePreferences = schedule.SchedulePreferences,
            Name = schedule.Name,
        };

        context.Schedules.Add(scheduleToInsert);
        await context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetSchedule),
            new { guid = scheduleToInsert.Guid },
            scheduleToInsert
        );
    }

    [HttpGet("{guid:guid}/generateSchedule")]
    [Authorize]
    public async Task<IActionResult> GenerateSchedule(Guid guid, [FromQuery] bool random = true)
    {
        var schedule = await context
            .Schedules.Include(schedule => schedule.SchedulePreferences)
            .Include(schedule => schedule.ShiftAssignments)
            .FirstOrDefaultAsync(s => s.Guid == guid);
        if (schedule == null)
            return NotFound();
        List<Availability> availabilities = await context
            .Availabilities.Include(a => a.Schedule)
                .ThenInclude(s => s.ShiftAssignments)
            .Where(a => a.Schedule == schedule)
            .ToListAsync();
        if (schedule.Auth0UserId != User.FindFirst(ClaimTypes.NameIdentifier)!.Value)
            return Unauthorized();

        var updated = await context.ShiftAssignments.AnyAsync(shiftAssignment =>
            shiftAssignment.ScheduleId == schedule.Id
        );

        var result = Scheduler.Scheduler.RunScheduler(
            schedule,
            availabilities,
            schedule.SchedulePreferences,
            random
        );

        var strategy = context.Database.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            await using var transaction = await context.Database.BeginTransactionAsync();

            await context
                .ShiftAssignments.Where(shiftAssignment =>
                    shiftAssignment.ScheduleId == schedule.Id
                )
                .ExecuteDeleteAsync();

            if (result.Assignments != null)
                await context.ShiftAssignments.AddRangeAsync(result.Assignments);

            await context.SaveChangesAsync();

            await transaction.CommitAsync();
        });

        schedule.ShiftAssignments = result.Assignments;

        availabilities = await context
            .Availabilities.Where(a => a.Schedule == schedule)
            .ToListAsync();

        foreach (var availability in availabilities)
        {
            availability.Schedule = schedule;
            if (availability.UserEmail != null)
            {
                await emailService.SendShiftAssignmentEmail(updated, availability);
            }
        }

        return Ok(result);
    }

    [HttpPost("{scheduleGuid:Guid}/createAvailability")]
    public async Task<IActionResult> CreateAvailability(
        Guid scheduleGuid,
        [FromBody] AvailabilityCreateDto availability
    )
    {
        var schedule = await context.Schedules.FirstOrDefaultAsync(s => s.Guid == scheduleGuid);
        if (schedule == null)
        {
            return NotFound();
        }

        if (availability.UserName.Trim().Length == 0)
        {
            return BadRequest("User name cannot be empty");
        }

        if (
            context.Availabilities.Any(a =>
                a.UserName == availability.UserName && a.Schedule.Guid == scheduleGuid
            )
        )
        {
            return Conflict("Conflicting user name!");
        }

        if (
            await context.Availabilities.AnyAsync(a =>
                a.UserEmail == availability.UserEmail && a.Schedule.Guid == scheduleGuid
            )
        )
        {
            return UnprocessableEntity("Email already exists in this schedule!");
        }

        var availabilityToInsert = new Availability
        {
            Guid = Guid.NewGuid(),
            Schedule = schedule,
            AvailabilitySlots = availability.AvailabilitySlots,
            UserName = availability.UserName,
            UserEmail = availability.UserEmail,
            Preferences = availability.Preferences,
            FormAnswers = availability.FormAnswers,
        };

        context.Availabilities.Add(availabilityToInsert);
        await context.SaveChangesAsync();

        await emailService.SendAvailabilityConfirmationEmail(false, availabilityToInsert);

        return CreatedAtAction(
            nameof(AvailabilityController.GetAvailability),
            "Availability",
            new { guid = availabilityToInsert.Guid },
            availabilityToInsert
        );
    }

    [HttpGet("{guid:guid}/getByEmail")]
    public async Task<IActionResult> GetAvailability(Guid guid, [FromQuery] string email)
    {
        var result = await context
            .Availabilities.Include(a => a.Schedule)
            .FirstOrDefaultAsync(a => a.UserEmail == email && a.Schedule.Guid == guid);
        if (result != null)
            return Ok(result);
        return StatusCode(StatusCodes.Status406NotAcceptable);
    }

    [HttpPost("{guid:guid}/requestSwap")]
    public async Task<IActionResult> RequestSwap(Guid guid, [FromBody] SwapRequestDto request)
    {
        DateTime[] shiftStartTimes = request.shiftStartTimes;
        int requesterId = request.RequesterId;
        int recipientId = request.RecipientId;

        Schedule? schedule = context.Schedules.FirstOrDefault<Schedule>(s => s.Guid == guid);
        if (schedule == null || shiftStartTimes == null || !shiftStartTimes.Any())
        {
            return BadRequest("Request does not specify all necessary fields.");
        }
        List<ShiftAssignment> requesterShiftCollection = new List<ShiftAssignment>();
        List<ShiftAssignment> recipientShiftCollection = new List<ShiftAssignment>();
        var scheduleResult = await context.Schedules.FirstOrDefaultAsync(s => s.Guid == guid);

        if (scheduleResult == null)
            return NotFound("The provided schedule could not be found.");
        int scheduleID = scheduleResult.Id;

        try
        { //Attempt to find the shift assignments from the backend.
            foreach (DateTime start in shiftStartTimes)
            {
                var result = await context.ShiftAssignments.FirstOrDefaultAsync(s =>
                    s.ScheduleId == scheduleID
                    && s.StartTime == start
                    && s.Availability.Id == requesterId
                ); //Attempt to find if the given shift belongs to requester
                if (result != null)
                    requesterShiftCollection.Add(result);
                else
                {
                    result = await context.ShiftAssignments.FirstOrDefaultAsync(s =>
                        s.ScheduleId == scheduleID
                        && s.StartTime == start
                        && s.Availability.Id == recipientId
                    );  //Attempt to find if the given shift belongs to recipient
                    if (result != null)
                        requesterShiftCollection.Add(result);
                    else
                    { //If it doesn't belong to either, throw an exception
                        throw new FileNotFoundException();
                    }
                }
            }
        }
        catch (FileNotFoundException e)
        {
            return UnprocessableEntity(
                "One or more of the dates provided did not have a shift assigned to either party."
            );
        }
        if (requesterShiftCollection.Count < 1 && recipientShiftCollection.Count < 1)
            return UnprocessableEntity("No shift assignments were found for the time specified.");

        //Sort through the shifts (assume an unsorted list)
        SwapRequest swapRequest = new SwapRequest
        {
            FromPartyA = requesterShiftCollection,
            FromPartyB = recipientShiftCollection,
            Schedule = schedule,
        };
        Console.WriteLine("\n Creating Swap Request: " + swapRequest.ToJson());
        context.SwapRequests.Add(swapRequest);
        context.SaveChanges();
        return Ok(swapRequest.Guid);
    }
}
