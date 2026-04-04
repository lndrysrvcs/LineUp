using Google.OrTools.Sat;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;
using Xunit;

namespace LineUp.Scheduler.Tests;

public class CoveragePrioritizationTests
{
    private Schedule CreateBasicSchedule(int usersPerShift = 1, int minutesPerSlot = 60)
    {
        return new Schedule
        {
            Id = 1,
            Auth0UserId = "test-owner",
            Name = "Coverage Test Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(11, 0), // 2 slots: 9-10, 10-11
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = minutesPerSlot,
                UsersPerShift = usersPerShift,
                MaximumShiftsPerWorker = 0,
                MaximumShiftDurationMinutes = 0,
            },
        };
    }

    private Availability CreateAvailability(
        Schedule schedule,
        string userName,
        params int[] slotIndices
    )
    {
        var slots = new List<DateTime>();
        var date = schedule.DateCoverage[0];
        foreach (var i in slotIndices)
        {
            slots.Add(
                new DateTime(
                    date.Year,
                    date.Month,
                    date.Day,
                    schedule.StartTime.Hour,
                    schedule.StartTime.Minute,
                    0,
                    DateTimeKind.Utc
                ).AddMinutes(i * schedule.SchedulePreferences.MinutesPerSlot)
            );
        }

        return new Availability
        {
            Guid = Guid.NewGuid(),
            UserName = userName,
            UserEmail = $"{userName.Replace(" ", "").ToLower()}@example.com",
            Schedule = schedule,
            AvailabilitySlots = slots.ToArray(),
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>(),
        };
    }

    [Fact]
    public void RunScheduler_PrioritizesCoverageOverFillingWorkersPerShift()
    {
        // Scenario:
        // 2 slots: Slot A (9-10), Slot B (10-11).
        // UsersPerShift = 2.
        // User 1: Available for Slot A and Slot B.
        // User 2: Available for Slot A.
        //
        // Capacity = 4 (2 slots * 2 users).
        // Total possible assignments if we maximize workers: 3 (User 1 in A/B, User 2 in A)
        // If we maximize workers: Slot A has 2 workers (User 1 & 2), Slot B has 1 worker (User 1).
        // If we prioritize coverage: Slot A has 1 worker (User 2), Slot B has 1 worker (User 1).
        // BUT wait, if we have enough workers for both, we SHOULD fill Slot A with 2 and Slot B with 1.
        // The issue says: "prioritize total coverage over filling the workers per shift,
        // think of it as a cap rather than a thing to maximize, but only if there is really not enough coverage"
        //
        // Correct Scenario to test prioritization:
        // User 1: Available for A or B, but can only work 1 shift (MaximumShiftsPerWorker = 1).
        // User 2: Available only for A.
        //
        // If we maximize total workers:
        // Option 1: User 1 in A, User 2 in A. Total workers = 2. Coverage = 1 slot (Slot A).
        // Option 2: User 1 in B, User 2 in A. Total workers = 2. Coverage = 2 slots (Slot A and B).
        //
        // Current implementation treats all assignments as equal (weight 100).
        // So both options have objective value 200. It might pick Option 1 or 2 randomly.
        // We want it to ALWAYS pick Option 2.

        // Arrange
        var schedule = CreateBasicSchedule(usersPerShift: 2);
        schedule.SchedulePreferences.MaximumShiftsPerWorker = 1;

        var user1 = CreateAvailability(schedule, "User 1 (Flexible)", 0, 1);
        var user2 = CreateAvailability(schedule, "User 2 (Fixed A)", 0);

        var availabilities = new List<Availability> { user1, user2 };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);

        var slotAAssignments = result.Assignments.Count(a => a.StartTime.Hour == 9);
        var slotBAssignments = result.Assignments.Count(a => a.StartTime.Hour == 10);

        // We expect coverage for both slots.
        Assert.True(slotAAssignments >= 1, $"Slot A should be covered, but was {slotAAssignments}");
        Assert.True(slotBAssignments >= 1, $"Slot B should be covered, but was {slotBAssignments}");

        // In this specific case, User 2 MUST be in A, and User 1 MUST be in B to get coverage.
        var user1Assignment = result.Assignments.Single(a =>
            a.Availability.UserName == "User 1 (Flexible)"
        );
        Assert.Equal(10, user1Assignment.StartTime.Hour); // Should be in Slot B (10:00)
    }

    [Fact]
    public void RunScheduler_PrioritizesCoverageOverFillingWorkersPerShift_Large()
    {
        // Scenario:
        // 5 slots. UsersPerShift = 10.
        // User 1-10: Available for ALL slots.
        // BUT they have MaximumShiftsPerWorker = 1.
        //
        // If we maximize workers: all 10 users could be in Slot 1. Total workers = 10. Coverage = 1 slot.
        // If we prioritize coverage: each user should take 1 slot. Total workers = 10. Coverage = 5 slots.

        // Arrange
        var schedule = CreateBasicSchedule(usersPerShift: 10);
        schedule.EndTime = schedule.StartTime.AddHours(5); // 5 slots
        schedule.SchedulePreferences.MaximumShiftsPerWorker = 1;

        var availabilities = new List<Availability>();
        for (int i = 0; i < 10; i++)
        {
            availabilities.Add(CreateAvailability(schedule, $"User {i}", 0, 1, 2, 3, 4));
        }

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);

        for (int i = 0; i < 5; i++)
        {
            var hour = schedule.StartTime.Hour + i;
            var assignments = result.Assignments.Count(a => a.StartTime.Hour == hour);
            Assert.True(
                assignments >= 1,
                $"Slot at {hour}:00 should be covered, but was {assignments}"
            );
        }
    }
}
