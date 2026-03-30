using JetBrains.Annotations;
using LineUp.Core.Models;

namespace LineUp.Scheduler.Tests;

[TestSubject(typeof(AvailabilityMatrixTools))]
public class AvailabilityMatrixToolsTest
{
    private readonly Schedule schedule = new()
    {
        Id = 0,
        Guid = default,
        Auth0UserId = "test-test-123-lineup-test",
        Name = null,
        DateCoverage =
        [
            DateOnly.FromDateTime(DateTime.UtcNow),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1)),
            DateOnly.FromDateTime(DateTime.UtcNow.AddDays(2)),
        ],
        StartTime = new TimeOnly(9, 0),
        EndTime = new TimeOnly(10, 0),
        Form = null,
        FormId = null,
        ShiftAssignments = [],
        SchedulePreferences = new SchedulePreferences
        {
            Id = default,
            MinutesPerSlot = 15,
            ShiftIntervals = 0,
            UsersPerShift = 0,
            MaximumShiftDurationMinutes = 0,
            MaximumShiftsPerWorker = 0
        },
    };

    [Fact]
    public void GenerateMatrixFromSchedule_IsCorrectSize()
    {
        // Act
        var result = AvailabilityMatrixTools.GenerateEmptyMatrixFromSchedule(schedule);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(3, result.GetLength(0));
        Assert.Equal(4, result.GetLength(1));
    }

    [Fact]
    public void GenerateMatrixPointerHashSet_IsCorrectLength()
    {
        // Act
        Dictionary<TimeOnly, int> result = AvailabilityMatrixTools.GenerateMatrixTimePointerHashSet(schedule);
        
        // Assert
        Assert.NotNull(result);
        Assert.Equal(4, result.Count);
    }

}