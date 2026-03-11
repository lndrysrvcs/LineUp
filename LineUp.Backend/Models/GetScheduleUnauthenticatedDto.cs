using System.ComponentModel.DataAnnotations;
using LineUp.Backend.Models.Forms;

namespace LineUp.Backend.Models;

public class GetScheduleUnauthenticatedDto
{
    [MaxLength(256)]
    public required string Name { get; set; }

    public required DateOnly[] DateCoverage { get; set; }

    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }

    public Form? Form { get; set; }
    public int? FormId { get; set; }

    public ICollection<ShiftAssignment>? ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();

    public required SchedulePreferences SchedulePreferences { get; set; } = new();

    public required int AvailabilityCount { get; set; }
}
