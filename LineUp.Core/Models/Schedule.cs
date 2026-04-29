using System.ComponentModel.DataAnnotations;
using LineUp.Core.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Core.Models;

/// <summary>
/// Represents a user's schedule.
/// </summary>
[Index(nameof(Auth0UserId), nameof(Guid))]
public class Schedule
{
    /// <summary>
    /// The primary key of the Schedule.
    /// </summary>
    public int Id { get; set; }
    /// <summary>
    /// A unique identifier for the Schedule.
    /// </summary>
    public Guid Guid { get; init; } = Guid.NewGuid();

    /// <summary>
    /// The Auth0 user ID associated with the Schedule.
    /// </summary>
    [MaxLength(256)]
    public required string Auth0UserId { get; set; }

    /// <summary>
    /// The name of the Schedule.
    /// </summary>
    [MaxLength(256)]
    public required string Name { get; set; }

    /// <summary>
    /// The dates covered by the Schedule.
    /// </summary>
    public required DateOnly[] DateCoverage { get; set; }

    /// <summary>
    /// The start time of the schedule.
    /// </summary>
    public required TimeOnly StartTime { get; set; }
    /// <summary>
    /// The end time of the schedule.
    /// </summary>
    public required TimeOnly EndTime { get; set; }

    /// <summary>
    /// The form associated with the Schedule.
    /// </summary>
    public Form? Form { get; set; }
    public int? FormId { get; set; }
    
    /// <summary>
    /// Whether the latest emails have been sent to the user.
    /// </summary>
    public bool LatestEmailsSent { get; set; } = false;
    
    /// <summary>
    /// The shift assignments associated with the Schedule.
    /// </summary>
    public ICollection<ShiftAssignment>? ShiftAssignments { get; set; } =
        new List<ShiftAssignment>();

    /// <summary>
    /// The preferences for the Schedule.
    /// </summary>
    public required SchedulePreferences SchedulePreferences { get; set; } = new();
}
