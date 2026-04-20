using LineUp.Core.Models;

namespace LineUp.Backend.Models;

public class SwapRequestDto
{
    public required DateTime[] shiftStartTimes { get; set; }

    public required int RequesterId { get; set; }

    public required int RecipientId { get; set; }
}
