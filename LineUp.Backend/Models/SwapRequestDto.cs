using LineUp.Core.Models;

namespace LineUp.Backend.Models;

public class SwapRequestDto
{
    public DateTime[] shiftStartTimes { get; set; }

    public int RequesterId { get; set; }

    public int RecipientId { get; set; }
}
