using System.Text.Json.Serialization;
using LineUp.Core.Attributes;

namespace LineUp.Core.Models;

public class ShiftAssignment
{
    public int Id { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public Availability? Availability { get; set; }
    // Navigation properties, ignored in JSON to not loop forever
    [JsonDoNotSerialize]
    public Schedule Schedule { get; set; } = null!;
}
