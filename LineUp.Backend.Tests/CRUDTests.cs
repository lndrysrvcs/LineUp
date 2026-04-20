using System.Net;
using System.Security.Claims;
using Azure;
using LineUp.Backend.Controllers;
using LineUp.Backend.Models;
using LineUp.Backend.Services;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;

namespace LineUp.Backend.Tests;

public class CRUDTests
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
        EndTime = new TimeOnly(17, 0),
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

    Availability sampleAvailability = new Availability
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
            // Day 1: 13:00 - 17:00
            DateTime.UtcNow.Date.AddDays(1).AddHours(13),
            DateTime.UtcNow.Date.AddDays(1).AddHours(13).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(1).AddHours(14),
            DateTime.UtcNow.Date.AddDays(1).AddHours(14).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(1).AddHours(15),
            DateTime.UtcNow.Date.AddDays(1).AddHours(15).AddMinutes(30),
            DateTime.UtcNow.Date.AddDays(1).AddHours(16),
            DateTime.UtcNow.Date.AddDays(1).AddHours(16).AddMinutes(30),
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

    [Fact]
    public async Task CreateSchedule_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var emailService = new MockEmailService();
            var controller = new ScheduleController(context, emailService);

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

            // Act
            var result = await controller.CreateSchedule(scheduleDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ScheduleController.GetSchedule), createdResult.ActionName);
            Assert.NotNull(createdResult.Value);

            var returnedSchedule = Assert.IsType<Schedule>(createdResult.Value);
            Assert.Equal("test-user-123", returnedSchedule.Auth0UserId);
            Assert.Equal(sampleSchedule.Name, returnedSchedule.Name);
            Assert.Equal(sampleSchedule.StartTime, returnedSchedule.StartTime);
            Assert.Equal(sampleSchedule.EndTime, returnedSchedule.EndTime);

            // Verify that the schedule was actually saved to the database
            var savedSchedules = await context.Schedules.CountAsync();
            Assert.Equal(1, savedSchedules);
        }
    }

    [Fact]
    public async Task UpdateSchedule_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var emailService = new MockEmailService();
            var controller = new ScheduleController(context, emailService);

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
            CreatedAtActionResult createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Schedule returnedSchedule = Assert.IsType<Schedule>(createdResult.Value);
            Guid guid = returnedSchedule.Guid;

            var updatedScheduleDto = new ScheduleUpdateDto
            {
                Name = "Updated Test Schedule",
                Id = 100,
            };

            // Act
            var updateResult = await controller.UpdateSchedule(guid, updatedScheduleDto);

            // Assert
            Assert.IsType<NoContentResult>(updateResult);

            // Verify that only one schedule was actually saved to the database
            var savedSchedules = await context.Schedules.CountAsync();
            Assert.Equal(1, savedSchedules);
        }
    }

    [Fact]
    public async Task DeleteSchedule_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var emailService = new MockEmailService();
            var controller = new ScheduleController(context, emailService);

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
            CreatedAtActionResult createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Schedule returnedSchedule = Assert.IsType<Schedule>(createdResult.Value);
            Guid guid = returnedSchedule.Guid;

            // Act
            var deleteResult = await controller.DeleteSchedule(guid);

            // Assert
            Assert.IsType<NoContentResult>(deleteResult);

            // Verify that only one schedule was actually saved to the database
            var savedSchedules = await context.Schedules.CountAsync();
            Assert.Equal(0, savedSchedules);
        }
    }

    [Fact]
    public async Task CreateAvailability_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var emailService = new MockEmailService();
            var controller = new ScheduleController(context, emailService);

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

            var availabilityDto = new AvailabilityCreateDto
            {
                AvailabilitySlots = sampleAvailability.AvailabilitySlots,
                UserName = sampleAvailability.UserName,
                UserEmail = sampleAvailability.UserEmail,
                Preferences = sampleAvailability.Preferences,
                FormAnswers = sampleAvailability.FormAnswers,
            };
            // Act
            var availabilityCreateResult = await controller.CreateAvailability(
                guid,
                availabilityDto
            );
            var failedAvailabilityCreateResult = await controller.CreateAvailability(
                Guid.Empty,
                availabilityDto
            );

            // Assert
            Assert.IsType<CreatedAtActionResult>(availabilityCreateResult);
            Assert.IsType<NotFoundResult>(failedAvailabilityCreateResult);

            Assert.Single(emailService.SentAvailabilityConfirmationEmails);
            Assert.Equal(
                sampleAvailability.UserEmail,
                emailService.SentAvailabilityConfirmationEmails[0].UserEmail
            );
        }
    }

    [Fact]
    public async Task UpdateAvailability_Test()
    {
        // Arrange
        sampleAvailability.Schedule = sampleSchedule;
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        using (var context = new LineUpContext(options))
        {
            context.Database.EnsureCreated();

            var emailService = new MockEmailService();
            var controller = new ScheduleController(context, emailService);
            var availController = new AvailabilityController(context, emailService);

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

            var availabilityDto = new AvailabilityCreateDto
            {
                AvailabilitySlots = sampleAvailability.AvailabilitySlots,
                UserName = sampleAvailability.UserName,
                UserEmail = sampleAvailability.UserEmail,
                Preferences = sampleAvailability.Preferences,
                FormAnswers = sampleAvailability.FormAnswers,
            };
            result = await controller.CreateAvailability(guid, availabilityDto);
            CreatedAtActionResult availabilityCreatedResult = Assert.IsType<CreatedAtActionResult>(
                result
            );
            Availability returnedAvailability = Assert.IsType<Availability>(
                availabilityCreatedResult.Value
            );
            Guid availabilityGuid = returnedAvailability.Guid;
            // Act

            AvailabilityUpdateDTO sampleAvailabilityDto = new AvailabilityUpdateDTO
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
                    // Day 1: 13:00 - 17:00
                    DateTime.UtcNow.Date.AddDays(1).AddHours(13),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(13).AddMinutes(30),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(14),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(14).AddMinutes(30),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(15),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(15).AddMinutes(30),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(16),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(16).AddMinutes(30),
                ],
                Preferences = new AvailabilityPreferences(),
            };
            var availabilityUpdateResult = await availController.EditAvailability(
                availabilityGuid,
                sampleAvailabilityDto
            );

            var failedAvailabilityUpdateResult = await availController.EditAvailability(
                Guid.Empty,
                sampleAvailabilityDto
            );
            // Assert
            Assert.IsType<NoContentResult>(availabilityUpdateResult);
            Assert.IsType<NotFoundResult>(failedAvailabilityUpdateResult);

            Assert.Equal(2, emailService.SentAvailabilityConfirmationEmails.Count);
            Assert.Equal(
                sampleAvailability.UserEmail,
                emailService.SentAvailabilityConfirmationEmails[0].UserEmail
            );
        }
    }

    [Fact]
    public async Task CreateRandomSchedule_Test()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<LineUpContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        Random random = new Random();

        List<DateOnly> randomCoverage = new List<DateOnly>();

        for (int i = 0; i < random.Next(10); i++)
        {
            randomCoverage.Add(DateOnly.FromDateTime(DateTime.UtcNow.AddDays(i)));
        }

        Schedule randomSchedule = new Schedule
        {
            Guid = Guid.Empty,
            Auth0UserId = "always-test-on-schedule",
            DateCoverage = randomCoverage.ToArray(),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
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
                DateCoverage = randomSchedule.DateCoverage,
                StartTime = randomSchedule.StartTime,
                EndTime = randomSchedule.EndTime,
                SchedulePreferences = randomSchedule.SchedulePreferences,
                Name = randomSchedule.Name,
            };

            // Act
            var result = await controller.CreateSchedule(scheduleDto);

            // Assert
            var createdResult = Assert.IsType<CreatedAtActionResult>(result);
            Assert.Equal(nameof(ScheduleController.GetSchedule), createdResult.ActionName);
            Assert.NotNull(createdResult.Value);

            var returnedSchedule = Assert.IsType<Schedule>(createdResult.Value);
            Assert.Equal("test-user-123", returnedSchedule.Auth0UserId);
            Assert.Equal(randomSchedule.Name, returnedSchedule.Name);
            Assert.Equal(randomSchedule.StartTime, returnedSchedule.StartTime);
            Assert.Equal(randomSchedule.EndTime, returnedSchedule.EndTime);

            // Verify that the schedule was actually saved to the database
            var savedSchedules = await context.Schedules.CountAsync();
            Assert.Equal(1, savedSchedules);
        }
    }
}
