using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;
using LineUp.Core.Attributes;
using LineUp.Core.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Core.Models;

[Index(nameof(Guid))]
public class Availability
{
    public int Id { get; set; }
    public Guid Guid { get; init; } = Guid.NewGuid();

    public DateTime[] AvailabilitySlots { get; set; } = [];

    [MaxLength(64)]
    public required string UserName { get; set; } //NOT a "username" in the traditional sense. This holds the real name of the user.

    [MaxLength(256)]
    public string? UserEmail { get; set; }

    public AvailabilityPreferences? Preferences { get; set; }

    public ICollection<FormQuestionAnswer> FormAnswers { get; set; } =
        new List<FormQuestionAnswer>();

    // Navigation properties, ignored in JSON to not loop forever
    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}

public class AvailabilityUpdateDTO //A copy of the Availability class used to transfer data.
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
