namespace LineUp.Core.Models;

/// <summary>
/// Represents the preferences for a schedule.
/// </summary>
public class SchedulePreferences
{
    /// <summary>
    /// The unique identifier for the schedule preferences.
    /// </summary>
    public Guid Id { get; set; }
    /// <summary>
    /// The number of minutes per slot.
    /// </summary>
    public int MinutesPerSlot { get; set; }
    /// <summary>
    /// The number of shift intervals.
    /// </summary>
    public int ShiftIntervals { get; set; }
    /// <summary>
    /// The number of users per shift.
    /// </summary>
    public int UsersPerShift { get; set; }
    /// <summary>
    /// The maximum duration of a shift in minutes.
    /// </summary>
    public int MaximumShiftDurationMinutes { get; set; }
    /// <summary>
    /// The maximum number of shifts per worker.
    /// </summary>
    public int MaximumShiftsPerWorker { get; set; }
}
