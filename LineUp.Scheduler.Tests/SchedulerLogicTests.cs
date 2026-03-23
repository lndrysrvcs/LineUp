using Google.OrTools.Sat;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Scheduler.Tests;

public class SchedulerLogicTests
{
    private Schedule CreateBasicSchedule(int usersPerShift = 1, int minutesPerSlot = 60)
    {
        return new Schedule
        {
            Id = 1,
            Auth0UserId = "test-owner",
            Name = "Logic Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(12, 0), // 3 slots: 9-10, 10-11, 11-12
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = minutesPerSlot,
                UsersPerShift = usersPerShift,
                MaximumShiftsPerWorker = 0,
                MaximumShiftDurationMinutes = 0
            }
        };
    }

    private Availability CreateAvailability(Schedule schedule, string userName, params int[] slotIndices)
    {
        var slots = new List<DateTime>();
        var date = schedule.DateCoverage[0];
        foreach (var i in slotIndices)
        {
            slots.Add(new DateTime(date.Year, date.Month, date.Day, schedule.StartTime.Hour, schedule.StartTime.Minute, 0, DateTimeKind.Utc).AddMinutes(i * schedule.SchedulePreferences.MinutesPerSlot));
        }

        return new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = userName,
            UserEmail = $"{userName.Replace(" ", "").ToLower()}@example.com",
            Schedule = schedule,
            AvailabilitySlots = slots.ToArray(),
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>()
        };
    }

    [Fact]
    public void RunScheduler_EnforcesContinuity()
    {
        // Arrange
        // User is available for 9-10 and 11-12, but NOT 10-11.
        // The solver should only pick ONE of them if it tries to maximize but enforces continuity.
        // Wait, the current implementation says "at most one continuous block".
        // If they are available for two separate slots, it should only pick one if it can't pick both in a continuous way.
        var schedule = CreateBasicSchedule();
        var user = CreateAvailability(schedule, "John", 0, 2); // 9-10 and 11-12
        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        // It should pick 9-10 OR 11-12, but NOT both because that would be two blocks.
        Assert.Single(result.Assignments);
    }

    [Fact]
    public void RunScheduler_RespectsUsersPerShift()
    {
        // Arrange
        var schedule = CreateBasicSchedule(usersPerShift: 1);
        var user1 = CreateAvailability(schedule, "User 1", 0);
        var user2 = CreateAvailability(schedule, "User 2", 0);
        var availabilities = new List<Availability> { user1, user2 };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Single(result.Assignments); // Only one should be assigned to the 9-10 slot
    }

    [Fact]
    public void RunScheduler_RespectsMaxShiftsPerWorker()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        schedule.SchedulePreferences.MaximumShiftsPerWorker = 1;
        var user = CreateAvailability(schedule, "John", 0, 1, 2); // Available for all 3
        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Single(result.Assignments); // Even though available for 3, limited to 1
    }

    [Fact]
    public void RunScheduler_RespectsMaxShiftDuration()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        schedule.SchedulePreferences.MaximumShiftDurationMinutes = 60; // 1 slot
        var user = CreateAvailability(schedule, "John", 0, 1, 2);
        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Single(result.Assignments); // Limited by duration
    }

    [Fact]
    public void RunScheduler_FillsEmptySlotsWithSystemUser_ButDoesNotIncludeInAssignments()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        var availabilities = new List<Availability>(); // No users available

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Empty(result.Assignments); 
        // We know system user was used internally because it didn't throw "no solution found" 
        // and it didn't assign anyone.
    }
    
    [Fact]
    public void RunScheduler_MultipleDays_ContinuityPerDay()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        schedule.DateCoverage = [new DateOnly(2026, 3, 23), new DateOnly(2026, 3, 24)];

        // User available for one slot each day
        var slots = new List<DateTime> {
            new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc),
            new DateTime(2026, 3, 24, 9, 0, 0, DateTimeKind.Utc)
        };
        var user = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "John",
            AvailabilitySlots = slots.ToArray(),
            Schedule = schedule,
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>()
        };

        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Equal(2, result.Assignments.Count); // One per day is fine
    }

    [Fact]
    public void RunScheduler_ZeroSlotsPerDay_ThrowsException()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        schedule.EndTime = schedule.StartTime; // Zero duration -> 0 slots

        // Act & Assert
        Assert.ThrowsAny<Exception>(() => Scheduler.RunScheduler(schedule, new List<Availability>(), schedule.SchedulePreferences));
    }

    [Fact]
    public void RunScheduler_MaxDurationLessThanSlot_AssignsNothing()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        schedule.SchedulePreferences.MaximumShiftDurationMinutes = 30;
        schedule.SchedulePreferences.MinutesPerSlot = 60;
        var user = CreateAvailability(schedule, "John", 0);
        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        Assert.Empty(result.Assignments); // Cannot even fill one slot
    }

    [Fact]
    public void RunScheduler_AvailabilityOutsideCoverage_ThrowsException()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        var user = new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = "John",
            AvailabilitySlots = [new DateTime(2025, 1, 1, 9, 0, 0, DateTimeKind.Utc)], // Wrong year
            Schedule = schedule,
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>()
        };
        var availabilities = new List<Availability> { user };

        // Act & Assert
        var ex = Assert.Throws<Exception>(() => Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences));
        Assert.Contains("Availability slot is not in schedule date coverage!", ex.Message);
    }

    [Fact]
    public void RunScheduler_MixedAvailability_FillsOnlyPossibleSlots()
    {
        // Arrange
        var schedule = CreateBasicSchedule();
        // User only available for 9-10
        var user = CreateAvailability(schedule, "John", 0); 
        var availabilities = new List<Availability> { user };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);
        // Only one assignment for John
        Assert.Single(result.Assignments);
        Assert.Equal("John", result.Assignments[0].Availability.UserName);
        // Other slots (10-11, 11-12) were filled by system user but not returned in Assignments
    }
}
