using System.Text.Json.Serialization;
using LineUp.Backend.Attributes;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend.Models;

[Index(nameof(Guid))]
public class SwapRequest
{
    public int Id { get; set; }
    public Guid Guid { get; init; } = Guid.NewGuid();
    public required ShiftAssignment[] FromPartyA { get; set; }

    public required ShiftAssignment[] FromPartyB { get; set; }

    public bool partyAConfirm = false;

    public bool partyBConfirm = false;

    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
