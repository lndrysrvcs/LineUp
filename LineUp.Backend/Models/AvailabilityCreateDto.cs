using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using CSharpVitamins;
using LineUp.Core.Models;
using LineUp.Core.Models.Forms;

namespace LineUp.Backend.Models;

public class AvailabilityCreateDto
{
    public int Id { get; set; }
    public ShortGuid Guid { get; init; } = ShortGuid.NewGuid();

    public DateTime[] AvailabilitySlots { get; set; } = [];

    [MaxLength(64)]
    public required string UserName { get; set; } //NOT a "username" in the traditional sense. This holds the real name of the user.

    [MaxLength(256)]
    public string? UserEmail { get; set; }

    public AvailabilityPreferences? Preferences { get; set; }

    public ICollection<FormQuestionAnswer> FormAnswers { get; set; } =
        new List<FormQuestionAnswer>();
}
