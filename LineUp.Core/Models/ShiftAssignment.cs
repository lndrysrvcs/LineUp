using LineUp.Core.Attributes;

namespace LineUp.Core.Models;

public class ShiftAssignment
{
    public int Id { get; set; }

    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    
    public string? UserName => Availability?.UserName;
    public int? AvailabilityDbId => Availability?.Id;
    
    [JsonDoNotSerialize]
    public Availability? Availability { get; set; }
    // Navigation properties, ignored in JSON to not loop forever
    
    public int? ScheduleId { get; set; }
    [JsonDoNotSerialize]
    public Schedule? Schedule => Availability?.Schedule;
}
