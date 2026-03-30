using System.Text.Json.Serialization;
using LineUp.Core.Attributes;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Core.Models;

[Index(nameof(Guid))]
public class SwapRequest
{
    public int Id { get; set; }
    public Guid Guid { get; init; } = Guid.NewGuid();
    public required List<ShiftAssignment> FromPartyA { get; set; }

    public required List<ShiftAssignment> FromPartyB { get; set; }

    public bool partyAConfirm = false;

    public bool partyBConfirm = false;

    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
