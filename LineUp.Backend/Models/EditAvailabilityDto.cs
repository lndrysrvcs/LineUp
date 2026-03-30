namespace LineUp.Backend.Models;

public class EditAvailabilityDto
{
    public Guid Guid { get; set; }
    public string? UserName { get; set; }
    public string? UserEmail { get; set; }
    public DateTime[]? AvailabilitySlots { get; set; }
}
