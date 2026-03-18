namespace LineUp.Core.Models;

public class SchedulePreferences
{
    public Guid Id { get; set; }
    public int MinutesPerSlot { get; set; }
    public int ShiftIntervals { get; set; }
    public int UsersPerShift { get; set; }
    public int MaximumShiftDurationMinutes { get; set; }
    public int MaximumShiftsPerWorker { get; set; }
}
