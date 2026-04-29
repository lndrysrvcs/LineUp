using LineUp.Core.Models;

namespace LineUp.Scheduler;

/// <summary>
/// Helper methods for generating the availability matrix.
/// </summary>
static class AvailabilityMatrixTools
{
    /// <summary>
    /// Generates a matrix of the correct size to store the availability of each slot.
    /// </summary>
    /// <seealso cref="GenerateMatrixTimePointerHashSet"> See GenerateMatrixTimePointerHashSet for a helper method to help you get the indices to set for each time.</seealso>
    /// <param name="schedule">A Schedule object. Make sure to Include the SchedulePreferences in your database query.</param>
    /// <returns>A matrix of the correct size to store the availability of each slot.</returns>
    public static int[,] GenerateEmptyMatrixFromSchedule(Schedule schedule)
    {
        return new int[
            schedule.DateCoverage.Length,
            (int)
                Math.Floor(
                    (schedule.EndTime - schedule.StartTime).TotalMinutes
                        / schedule.SchedulePreferences.MinutesPerSlot
                )
        ];
    }

    /// <summary>
    /// Generates a dictionary of the time pointers for the schedule.
    /// </summary>
    /// <param name="schedule">The schedule to generate the matrix for.</param>
    /// <returns>A dictionary mapping TimeOnly to the index in the matrix.</returns>
    public static Dictionary<TimeOnly, int> GenerateMatrixTimePointerHashSet(Schedule schedule)
    {
        Dictionary<TimeOnly, int> result = new();
        var index = 0;
        for (
            var i = schedule.StartTime;
            i < schedule.EndTime;
            i = i.AddMinutes(schedule.SchedulePreferences.MinutesPerSlot)
        )
        {
            result.Add(i, index);
            index++;
        }
        return result;
    }

    /// <summary>
    /// Generates a dictionary of the availability guid pointers for the schedule.
    /// </summary>
    /// <param name="availabilities">The availabilities to generate the matrix for.</param>
    /// <returns>A dictionary mapping Guid to the index in the matrix.</returns>
    public static Dictionary<Guid, int> GenerateAvailabilityGuidPointerHashSet(
        IEnumerable<Availability> availabilities
    )
    {
        Dictionary<Guid, int> result = new();
        var index = 0;
        foreach (var availability in availabilities)
        {
            result.Add(availability.Guid, index);
            index++;
        }
        return result;
    }

    /// <summary>
    /// Gets the slots per day for a given schedule.
    /// </summary>
    /// <param name="schedule">A Schedule object. Make sure to Include the SchedulePreferences in your database query.</param>
    /// <returns>The slots per day</returns>
    public static int SlotsPerDay(Schedule schedule) =>
        (int)
            Math.Floor(
                (schedule.EndTime - schedule.StartTime).TotalMinutes
                    / schedule.SchedulePreferences.MinutesPerSlot
            );
}
