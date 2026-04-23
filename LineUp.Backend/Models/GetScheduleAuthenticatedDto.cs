using System.ComponentModel.DataAnnotations;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Backend.Models;

public class GetScheduleAuthenticatedDto
{
    [MaxLength(256)]
    public required string Name { get; set; }

    public required DateOnly[] DateCoverage { get; set; }

    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }

    public Form? Form { get; set; }

    public ICollection<ShiftAssignment>? ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();

    public required SchedulePreferences SchedulePreferences { get; set; } = new();

    public required bool LatestEmailsSent { get; set; }

    public required List<Availability> Availabilities { get; set; } = [];
    public int AvailabilityCount => Availabilities.Count;
}
