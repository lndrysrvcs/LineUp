using System.Text.Json.Serialization;

namespace LineUp.Backend.Models;

public class ShiftAssignment
{
    public int Id { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }

    // Navigation properties, ignored in JSON to not loop forever
    [JsonIgnore]
    public Availability Availability { get; set; } = null!;

    [JsonIgnore]
    public Schedule Schedule { get; set; } = null!;
}
