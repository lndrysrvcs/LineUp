using System.Text.Json.Serialization;
using LineUp.Backend.Attributes;

namespace LineUp.Backend.Models;

public class ShiftAssignment
{
    public int Id { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    // Navigation properties, ignored in JSON to not loop forever
    [JsonDoNotSerialize]
    public Availability Availability { get; set; } = null!;

    [JsonDoNotSerialize]
    public Schedule Schedule { get; set; } = null!;
}
