using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using LineUp.Core.Attributes;
using LineUp.Core.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Core.Models;

/// <summary>
/// Represents a user's availability for a specific schedule.
/// </summary>
[Index(nameof(Guid))]
public class Availability
{
    /// <summary>
    /// The primary key of the Availability.
    /// </summary>
    public int Id { get; set; }
    /// <summary>
    /// A unique identifier for the Availability.
    /// </summary>
    public Guid Guid { get; init; } = Guid.NewGuid();

    /// <summary>
    /// The user's availability slots.
    /// </summary>
    public DateTime[] AvailabilitySlots { get; set; } = [];

    /// <summary>
    /// The user's name.
    /// </summary>
    [MaxLength(64)]
    public required string UserName { get; set; } //NOT a "username" in the traditional sense. This holds the real name of the user.

    /// <summary>
    /// The user's email address.
    /// </summary>
    [MaxLength(256)]
    public required string UserEmail { get; set; }

    /// <summary>
    /// The user's availability preferences.
    /// </summary>
    public AvailabilityPreferences? Preferences { get; set; }

    /// <summary>
    /// The user's form answers.
    /// </summary>
    public ICollection<FormQuestionAnswer> FormAnswers { get; set; } =
        new List<FormQuestionAnswer>();
    
    /// <summary>
    /// The GUID of the associated schedule.
    /// </summary>
    public Guid ScheduleGuid => Schedule.Guid;

    // Navigation properties, ignored in JSON to not loop forever
    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}