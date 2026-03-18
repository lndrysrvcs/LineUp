namespace LineUp.Backend.Models;

public class ScheduleUpdateDto
{
    public int? Id { get; set; }
    public Guid? Guid { get; init; }

    public ICollection<ShiftAssignment>? ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();
    public SchedulePreferences? SchedulePreferences { get; set; } = new();
    public string? Name { get; set; }
}
