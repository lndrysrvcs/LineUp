using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Backend.Models;

/// <summary>
/// DTO for creating an availability.
/// </summary>
public class AvailabilityCreateDto
{
    /// <summary>
    /// The date and time slots that the user is available.
    /// The slots are in UTC and indicated by the START time of the slot.
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
    public string? UserEmail { get; set; }

    /// <summary>
    /// The user's availability preferences.
    /// </summary>
    public AvailabilityPreferences? Preferences { get; set; }

    /// <summary>
    /// The user's form answers.
    /// </summary>
    public ICollection<FormQuestionAnswer> FormAnswers { get; set; } =
        new List<FormQuestionAnswer>();
}
