using Google.OrTools.Sat;
using LineUp.Core.Models;

namespace LineUp.Scheduler.Tests;

public class SchedulerTests
{
    [Fact]
    public void RunScheduler_SimpleCase_ReturnsOptimal()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "user123",
            Name = "Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(11, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1
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
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc)
            ]
        };

        var availabilities = new List<Availability> { availability };
        var preferences = schedule.SchedulePreferences;

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, preferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.NotNull(result.Assignments);
        Assert.Equal(2, result.Assignments.Count);
        Assert.All(result.Assignments, a => {
            Assert.NotNull(a.Availability);
            Assert.Equal(availability.Guid, a.Availability.Guid);
        });
    }

    [Fact]
    public void GenerateAvailabilitiesWithSystemUser_AddsSystemUser()
    {
        // Arrange
        var schedule = new Schedule
        {
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(10, 0),
            Auth0UserId = "test",
            Name = "test",
            SchedulePreferences = new SchedulePreferences { MinutesPerSlot = 60 }
        };
        var availabilities = new List<Availability>();

        // Act
        var result = Scheduler.GenerateAvailabilitiesWithSystemUser(schedule, availabilities);

        // Assert
        Assert.Single(result);
        Assert.Equal(Guid.AllBitsSet, result[0].Guid);
        Assert.Equal("System", result[0].UserName);
    }
}
