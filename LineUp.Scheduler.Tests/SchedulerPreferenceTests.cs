using Google.OrTools.Sat;
using LineUp.Core.Models;
using Xunit;

namespace LineUp.Scheduler.Tests;

public class SchedulerPreferenceTests
{
    [Fact]
    public void RunScheduler_EnforcesMaximumShiftsPerWorker()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(12, 0), // 3 slots of 1 hour
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
                MaximumShiftsPerWorker = 1 // Only 1 shift per worker
            }
        };

        var availability = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "John Doe",
            UserEmail = "john@example.com",
            Schedule = schedule,
            AvailabilitySlots = [
                new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 11, 0, 0, DateTimeKind.Utc)
            ]
        };

        var availabilities = new List<Availability> { availability };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.NotNull(result.Assignments);
        // Only 1 shift should be assigned to John Doe despite 3 available slots
        Assert.Equal(1, result.Assignments.Count(a => a.Availability.Guid == availability.Guid));
    }

    [Fact]
    public void RunScheduler_EnforcesMaximumShiftDurationAndContinuity()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(13, 0), // 4 slots of 1 hour
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
                MaximumShiftDurationMinutes = 60, // Max 1 hour (1 slot)
                MaximumShiftsPerWorker = 2 // But can work 2 shifts total
            }
        };

        var availability = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "John Doe",
            UserEmail = "john@example.com",
            Schedule = schedule,
            AvailabilitySlots = [
                new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 11, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 12, 0, 0, DateTimeKind.Utc)
            ]
        };

        var availabilities = new List<Availability> { availability };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.NotNull(result.Assignments);
        
        var johnAssignments = result.Assignments
            .Where(a => a.Availability.Guid == availability.Guid)
            .OrderBy(a => a.StartTime)
            .ToList();

        // With continuity enforced (at most one block per day), 
        // and max duration 60 min (1 slot), 
        // John can only have ONE slot despite max shifts per worker being 2.
        Assert.Single(johnAssignments); 
    }

    [Fact]
    public void RunScheduler_EnforcesContinuity_AcrossMultipleDays()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23), new DateOnly(2026, 3, 24)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(12, 0), // 3 slots of 1 hour
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
                MaximumShiftDurationMinutes = 120, // Max 2 hours (2 slots)
                MaximumShiftsPerWorker = 4 // Can work up to 4 shifts total
            }
        };

        var availability = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "John Doe",
            UserEmail = "john@example.com",
            Schedule = schedule,
            AvailabilitySlots = [
                // Day 1
                new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 11, 0, 0, DateTimeKind.Utc),
                // Day 2
                new DateTime(2026, 3, 24, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 24, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 24, 11, 0, 0, DateTimeKind.Utc)
            ]
        };

        var availabilities = new List<Availability> { availability };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.NotNull(result.Assignments);
        
        var johnAssignmentsDay1 = result.Assignments
            .Where(a => a.Availability.Guid == availability.Guid && a.StartTime.Date == new DateTime(2026, 3, 23))
            .OrderBy(a => a.StartTime)
            .ToList();

        var johnAssignmentsDay2 = result.Assignments
            .Where(a => a.Availability.Guid == availability.Guid && a.StartTime.Date == new DateTime(2026, 3, 24))
            .OrderBy(a => a.StartTime)
            .ToList();

        // On each day, John should have a continuous block of at most 2 slots
        Assert.InRange(johnAssignmentsDay1.Count, 0, 2);
        Assert.InRange(johnAssignmentsDay2.Count, 0, 2);

        if (johnAssignmentsDay1.Count == 2)
        {
            // Verify continuity: 9-10 and 10-11 or 10-11 and 11-12
            var diff = johnAssignmentsDay1[1].StartTime - johnAssignmentsDay1[0].StartTime;
            Assert.Equal(TimeSpan.FromHours(1), diff);
        }

        if (johnAssignmentsDay2.Count == 2)
        {
            var diff = johnAssignmentsDay2[1].StartTime - johnAssignmentsDay2[0].StartTime;
            Assert.Equal(TimeSpan.FromHours(1), diff);
        }
    }
}
