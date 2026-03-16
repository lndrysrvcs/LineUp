namespace LineUp.Backend.Models;

[Index(nameof(Guid))]
public class SwapRequest
{
    public int Id { get; set; }
    public Guid Guid { get; init; } = Guid.NewGuid();
    public ShiftAssignment[] FromPartyA { get; set; }

    public ShiftAssignment[] FromPartyB { get; set; }

    public bool partyAConfirm = false;

    public bool partyBConfirm = false;

    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
