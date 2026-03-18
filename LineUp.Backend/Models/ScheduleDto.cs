namespace LineUp.Backend.Models;

public class ScheduleDto
{
    public int? Id { get; set; }
    public Guid? Guid { get; init; }

    public required DateOnly[] DateCoverage { get; set; }

    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }

    public ICollection<ShiftAssignment> ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();
    public required SchedulePreferences SchedulePreferences { get; set; } = new();
    public required string Name { get; set; }
}
