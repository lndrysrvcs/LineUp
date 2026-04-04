using System.Diagnostics;
using Google.OrTools.Sat;
using LineUp.Core.Models;
using Xunit.Abstractions;

namespace LineUp.Scheduler.Tests;

public class SchedulerStressTests
{
    private readonly ITestOutputHelper _output;

    public SchedulerStressTests(ITestOutputHelper output)
    {
        _output = output;
    }

    [Fact]
    public void RunScheduler_StressTest_100Availabilities()
    {
        // Arrange
        var schedule = new Schedule
        {
            Id = 1,
            Auth0UserId = "stress-test-user",
            Name = "Stress Test Schedule",
            DateCoverage = Enumerable
                .Range(0, 7)
                .Select(i => new DateOnly(2026, 3, 23).AddDays(i))
                .ToArray(),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
            SchedulePreferences = new SchedulePreferences
            {
                MinutesPerSlot = 30,
                UsersPerShift = 2,
            },
        };

        var random = new Random(42); // Seed for reproducibility
        var availabilities = new List<Availability>();

        for (int i = 0; i < 100; i++)
        {
            var userSlots = new List<DateTime>();

            foreach (var date in schedule.DateCoverage)
            {
                var currentTime = schedule.StartTime;
                while (currentTime < schedule.EndTime)
                {
                    // Instead of 30% random, we try to create blocks.
                    // 20% chance to start a block of 2-4 hours.
                    if (random.NextDouble() < 0.2)
                    {
                        int blockMinutes = random.Next(4, 9) * 30; // 2 to 4 hours in 30-min increments
                        var blockEnd = currentTime.AddMinutes(blockMinutes);
                        if (blockEnd > schedule.EndTime)
                            blockEnd = schedule.EndTime;

                        while (currentTime < blockEnd)
                        {
                            userSlots.Add(new DateTime(date, currentTime, DateTimeKind.Utc));
                            currentTime = currentTime.AddMinutes(
                                schedule.SchedulePreferences.MinutesPerSlot
                            );
                        }
                    }
                    else
                    {
                        currentTime = currentTime.AddMinutes(
                            schedule.SchedulePreferences.MinutesPerSlot
                        );
                    }
                }
            }

            var availability = new Availability
            {
                Guid = Guid.NewGuid(),
                UserName = $"User {i}",
                UserEmail = $"user{i}@example.com",
                Schedule = schedule,
                AvailabilitySlots = userSlots.ToArray(),
            };
            availabilities.Add(availability);
        }

        var preferences = schedule.SchedulePreferences;

        // Act
        var sw = Stopwatch.StartNew();
        var result = Scheduler.RunScheduler(schedule, availabilities, preferences);
        sw.Stop();

        _output.WriteLine($"Scheduler took {sw.ElapsedMilliseconds}ms for 100 availabilities.");
        _output.WriteLine($"Status: {result.Status}");
        Assert.NotNull(result.Assignments);
        _output.WriteLine($"Assignments: {result.Assignments.Count}");

        // Assert
        Assert.True(
            result.Status == CpSolverStatus.Optimal || result.Status == CpSolverStatus.Feasible,
            $"Solver status was {result.Status}"
        );
        Assert.NotEmpty(result.Assignments);
    }
}
