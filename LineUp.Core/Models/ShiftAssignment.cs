using LineUp.Core.Attributes;

namespace LineUp.Core.Models;

/// <summary>
/// Represents a shift assignment for a user.
/// </summary>
public class ShiftAssignment
{
    /// <summary>
    /// The primary key of the ShiftAssignment.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The start of the shift assignment.
    /// </summary>
    public DateTime StartTime { get; set; }
    /// <summary>
    /// The end of the shift assignment.
    /// </summary>
    public DateTime EndTime { get; set; }
    
    /// <summary>
    /// The user's name.
    /// </summary>
    public string? UserName => Availability?.UserName;
    /// <summary>
    /// The availability ID.
    /// </summary>
    public int? AvailabilityDbId => Availability?.Id;
    
    /// <summary>
    /// The availability associated with the ShiftAssignment.
    /// </summary>
    [JsonDoNotSerialize]
    public Availability? Availability { get; set; }

    /// <summary>
    /// The schedule ID.
    /// </summary>
    public int? ScheduleId { get; set; }
    
    /// <summary>
    /// The schedule associated with the ShiftAssignment.
    /// </summary>
    [JsonDoNotSerialize]
    public Schedule? Schedule => Availability?.Schedule;
}
