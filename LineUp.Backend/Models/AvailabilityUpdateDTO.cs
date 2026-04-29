using System.ComponentModel.DataAnnotations;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Backend.Models;

/// <summary>
/// DTO for updating an availability.
/// </summary>
public class AvailabilityUpdateDto
{
    public int Id { get; set; }

    public DateTime[] AvailabilitySlots { get; set; } = [];

    [MaxLength(64)]
    public required string UserName { get; set; }

    [MaxLength(256)]
    public string? UserEmail { get; set; }

    public AvailabilityPreferences? Preferences { get; set; }

    public ICollection<FormQuestionAnswer> FormAnswers { get; set; } =
        new List<FormQuestionAnswer>();
}