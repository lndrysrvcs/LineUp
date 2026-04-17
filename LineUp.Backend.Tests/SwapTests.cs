using System.Net;
using System.Security.Claims;
using Azure;
using LineUp.Backend.Controllers;
using LineUp.Backend.Models;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LineUp.Backend.Tests;

public class SwapTests
{
    Schedule sampleSchedule = new Schedule
    {
        Guid = Guid.Empty,
        Auth0UserId = "always-test-on-schedule",
        DateCoverage =
        [
            DateOnly.FromDateTime(DateTime.UtcNow),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
        ],
        StartTime = new TimeOnly(9, 0),
        EndTime = new TimeOnly(12, 0),
        SchedulePreferences = new SchedulePreferences
        {
            MinutesPerSlot = 30,
            ShiftIntervals = 30,
            UsersPerShift = 1,
            MaximumShiftDurationMinutes = 120,
            MaximumShiftsPerWorker = 1,
        },
        Name = "Test Schedule",
    };

    Availability sample1 = new Availability
    {
        UserName = "Test Availability",
        UserEmail = "test@email.com",
        AvailabilitySlots =
        [
            // Day 0: 9:00 - 12:00
            DateTime.UtcNow.Date.AddHours(9),
            DateTime.UtcNow.Date.AddHours(9).AddMinutes(30),
            DateTime.UtcNow.Date.AddHours(10),
            DateTime.UtcNow.Date.AddHours(10).AddMinutes(30),
            DateTime.UtcNow.Date.AddHours(11),
            DateTime.UtcNow.Date.AddHours(11).AddMinutes(30),
        ],
        Schedule = new Schedule
        {
            Guid = Guid.Empty,
            Auth0UserId = "replace this schedule",
            DateCoverage = [],
            StartTime = new TimeOnly(0, 0),
            EndTime = new TimeOnly(0, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 30,
                ShiftIntervals = 30,
                UsersPerShift = 1,
                MaximumShiftDurationMinutes = 120,
                MaximumShiftsPerWorker = 1,
            },
            Name = "ReplaceThisScheduleWithSampleSchedule",
        },
        Preferences = new AvailabilityPreferences(),
    };
    Availability sample2 = new Availability
    {
        UserName = "Test Availability",
        UserEmail = "test@email.com",
        AvailabilitySlots =
        [
            // Day 1: 9:00 - 12:00
            DateTime.UtcNow.Date.AddDays(1).AddHours(9),
            DateTime.UtcNow.Date.AddDays(1).AddHours(9).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(1).AddHours(10),
            DateTime.UtcNow.Date.AddDays(1).AddHours(10).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(1).AddHours(11),
            DateTime.UtcNow.Date.AddDays(1).AddHours(11).AddMinutes(30),
        ],
        Schedule = new Schedule
        {
            Guid = Guid.Empty,
            Auth0UserId = "replace this schedule",
            DateCoverage = [],
            StartTime = new TimeOnly(0, 0),
            EndTime = new TimeOnly(0, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 30,
                ShiftIntervals = 30,
                UsersPerShift = 1,
                MaximumShiftDurationMinutes = 120,
                MaximumShiftsPerWorker = 1,
            },
            Name = "ReplaceThisScheduleWithSampleSchedule",
        },
        Preferences = new AvailabilityPreferences(),
    };
    Availability sample3 = new Availability
    {
        UserName = "Test Availability",
        UserEmail = "test@email.com",
        AvailabilitySlots =
        [
            // Day 2: 9:00 - 12:00
            DateTime.UtcNow.Date.AddDays(2).AddHours(9),
            DateTime.UtcNow.Date.AddDays(2).AddHours(9).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(2).AddHours(10),
            DateTime.UtcNow.Date.AddDays(2).AddHours(10).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(2).AddHours(11),
            DateTime.UtcNow.Date.AddDays(2).AddHours(11).AddMinutes(30),
        ],
        Schedule = new Schedule
        {
            Guid = Guid.Empty,
            Auth0UserId = "replace this schedule",
            DateCoverage = [],
            StartTime = new TimeOnly(0, 0),
            EndTime = new TimeOnly(0, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 30,
                ShiftIntervals = 30,
                UsersPerShift = 1,
                MaximumShiftDurationMinutes = 120,
                MaximumShiftsPerWorker = 1,
            },
            Name = "ReplaceThisScheduleWithSampleSchedule",
        },
        Preferences = new AvailabilityPreferences(),
    };

    //[Fact]
    public async Task SwapAccepted_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var controller = new ScheduleController(context);

            // Create a mock ClaimsPrincipal with the required NameIdentifier claim
            var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, "test-user-123") };
            var identity = new ClaimsIdentity(claims);
            var principal = new ClaimsPrincipal(identity);
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = principal },
            };

            var scheduleDto = new ScheduleDto
            {
                DateCoverage = sampleSchedule.DateCoverage,
                StartTime = sampleSchedule.StartTime,
                EndTime = sampleSchedule.EndTime,
                SchedulePreferences = sampleSchedule.SchedulePreferences,
                Name = sampleSchedule.Name,
            };
            var result = await controller.CreateSchedule(scheduleDto);
            CreatedAtActionResult scheduleCreatedResult = Assert.IsType<CreatedAtActionResult>(
                result
            );
            Schedule returnedSchedule = Assert.IsType<Schedule>(scheduleCreatedResult.Value);
            Guid guid = returnedSchedule.Guid;

            var availability1Dto = new AvailabilityCreateDto
            {
                AvailabilitySlots = sample1.AvailabilitySlots,
                UserName = sample1.UserName,
                UserEmail = sample1.UserEmail,
                Preferences = sample1.Preferences,
                FormAnswers = sample1.FormAnswers,
            };
            var availabilityCreateResult = await controller.CreateAvailability(
                guid,
                availability1Dto
            );

            // Act

            // Assert
            Assert.IsType<CreatedAtActionResult>(availabilityCreateResult);
        }
    }
}
