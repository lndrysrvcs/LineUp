using Google.OrTools.Sat;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Scheduler.Tests;

public class SchedulerRegressionTests
{
    private Schedule CreateStandardSchedule()
    {
        return new Schedule
        {
            Id = 100,
            Auth0UserId = "reg-owner",
            Name = "Regression Schedule",
            DateCoverage = [new DateOnly(2026, 3, 23), new DateOnly(2026, 3, 24)],
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(12, 0), // 3 slots per day
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 60,
                UsersPerShift = 1,
                MaximumShiftsPerWorker = 3,
                MaximumShiftDurationMinutes = 120, // 2 slots
            },
        };
    }

    [Fact]
    public void RunScheduler_MatchesKnownGoodState()
    {
        // Arrange
        var schedule = CreateStandardSchedule();

        var user1 = new Availability
        {
            Guid = new Guid("11111111-1111-1111-1111-111111111111"),
            UserName = "Alice",
            Schedule = schedule,
            AvailabilitySlots =
            [
                new DateTime(2026, 3, 23, 9, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 24, 9, 0, 0, DateTimeKind.Utc),
            ],
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>(),
        };

        var user2 = new Availability
        {
            Guid = new Guid("22222222-2222-2222-2222-222222222222"),
            UserName = "Bob",
            Schedule = schedule,
            AvailabilitySlots =
            [
                new DateTime(2026, 3, 23, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 23, 11, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 24, 10, 0, 0, DateTimeKind.Utc),
                new DateTime(2026, 3, 24, 11, 0, 0, DateTimeKind.Utc),
            ],
            Preferences = new AvailabilityPreferences(),
            FormAnswers = new List<FormQuestionAnswer>(),
        };

        var availabilities = new List<Availability> { user1, user2 };

        // Act
        var result = Scheduler.RunScheduler(schedule, availabilities, schedule.SchedulePreferences);

        // Assert
        Assert.Equal(CpSolverStatus.Optimal, result.Status);

        // We expect the solver to maximize assignments.
        // Day 1: 9-10 (Alice), 10-11 (Alice or Bob), 11-12 (Bob)
        // Day 2: 9-10 (Alice), 10-11 (Bob), 11-12 (Bob)
        // Total slots = 6.
        // Alice max duration 120 min = 2 slots.
        // Bob max duration 120 min = 2 slots.
        // Alice max shifts 3.
        // Bob max shifts 3.

        // Day 1 possibilities for Alice: {9-10, 10-11} (2 slots)
        // Day 1 possibilities for Bob: {10-11, 11-12} (2 slots)
        // If Alice takes 9-10, 10-11, Bob can take 11-12. (3 slots total for day 1)

        // Day 2: Alice 9-10, Bob 10-11, 11-12. (3 slots total for day 2)

        // Total should be 6 assignments.
        Assert.Equal(6, result.Assignments.Count);

        var aliceAssignments = result.Assignments.Where(a => a.UserName == "Alice").ToList();
        var bobAssignments = result.Assignments.Where(a => a.UserName == "Bob").ToList();

        Assert.Equal(3, aliceAssignments.Count);
        Assert.Equal(3, bobAssignments.Count);

        // Verify specific slots to ensure no overlaps and correct assignments
        // Day 1, 9:00 -> Alice
        Assert.Contains(
            result.Assignments,
            a => a.StartTime.Hour == 9 && a.StartTime.Day == 23 && a.UserName == "Alice"
        );
        // Day 1, 11:00 -> Bob
        Assert.Contains(
            result.Assignments,
            a => a.StartTime.Hour == 11 && a.StartTime.Day == 23 && a.UserName == "Bob"
        );
        // Day 2, 9:00 -> Alice
        Assert.Contains(
            result.Assignments,
            a => a.StartTime.Hour == 9 && a.StartTime.Day == 24 && a.UserName == "Alice"
        );
        // Day 2, 10:00 -> Bob
        Assert.Contains(
            result.Assignments,
            a => a.StartTime.Hour == 10 && a.StartTime.Day == 24 && a.UserName == "Bob"
        );
        // Day 2, 11:00 -> Bob
        Assert.Contains(
            result.Assignments,
            a => a.StartTime.Hour == 11 && a.StartTime.Day == 24 && a.UserName == "Bob"
        );
    }
}
