using Google.OrTools.Sat;
using LineUp.Core.Models;
using Xunit;

namespace LineUp.Scheduler.Tests;

public class RandomizationTests
{
    [Fact]
    public void RunScheduler_WithRandomFlag_ProducesDifferentSchedulesForTies()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Tie Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(10, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
            },
        };

        // Two users available for the same single slot.
        // Both are equally optimal.
        var availability1 = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "User 1",
            UserEmail = "user1@example.com",
            Schedule = schedule,
            AvailabilitySlots = [new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc)],
        };

        var availability2 = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "User 2",
            UserEmail = "user2@example.com",
            Schedule = schedule,
            AvailabilitySlots = [new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc)],
        };

        var availabilities = new List<Availability> { availability1, availability2 };
        var preferences = schedule.SchedulePreferences;

        // Act
        // Run it multiple times with random=true and see if we get different results
        var results = new HashSet<Guid>();
        for (int i = 0; i < 20; i++)
        {
            var result = Scheduler.RunScheduler(
                schedule,
                availabilities,
                preferences,
                random: true
            );
            Assert.Equal(CpSolverStatus.Optimal, result.Status);
            Assert.Single(result.Assignments!);
            results.Add(result.Assignments![0].Availability.Guid);
        }

        // Assert
        // With 20 runs, it's extremely likely (1 - (1/2)^19) that we see both users if it's random.
        Assert.True(
            results.Count > 1,
            "Should have seen different assignments for the tie-break with random: true"
        );
    }

    [Fact]
    public void RunScheduler_WithoutRandomFlag_IsDeterministic()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Tie Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(10, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
            },
        };

        var availability1 = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "User 1",
            UserEmail = "user1@example.com",
            Schedule = schedule,
            AvailabilitySlots = [new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc)],
        };

        var availability2 = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "User 2",
            UserEmail = "user2@example.com",
            Schedule = schedule,
            AvailabilitySlots = [new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc)],
        };

        var availabilities = new List<Availability> { availability1, availability2 };
        var preferences = schedule.SchedulePreferences;

        // Act
        var result1 = Scheduler.RunScheduler(schedule, availabilities, preferences, random: false);
        var firstGuid = result1.Assignments![0].Availability.Guid;

        for (int i = 0; i < 10; i++)
        {
            var result = Scheduler.RunScheduler(
                schedule,
                availabilities,
                preferences,
                random: false
            );
            Assert.Equal(firstGuid, result.Assignments![0].Availability.Guid);
        }
    }
}
