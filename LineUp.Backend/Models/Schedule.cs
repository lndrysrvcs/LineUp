using System.ComponentModel.DataAnnotations;
using LineUp.Backend.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend.Models;

[Index(nameof(Auth0UserId), nameof(Guid))]
public class Schedule
{
    public int Id { get; set; }
    public Guid Guid { get; init; } = Guid.NewGuid();

    [MaxLength(256)]
    public required string Auth0UserId { get; set; }

    [MaxLength(256)]
    public required string Name { get; set; }

    public required DateOnly[] DateCoverage { get; set; }

    public required TimeOnly StartTime { get; set; }
    public required TimeOnly EndTime { get; set; }

    public Form? Form { get; set; }
    public int? FormId { get; set; }

    public ICollection<ShiftAssignment> ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();

    public required SchedulePreferences SchedulePreferences { get; set; } = new();
}
