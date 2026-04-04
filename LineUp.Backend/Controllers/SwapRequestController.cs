using System.Security.Claims;
using LineUp.Backend.Models;
using LineUp.Core.Attributes;
using LineUp.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend.Controllers;

[Route("api/swap")]
[ApiController]
public class SwapRequestController(LineUpContext context) : ControllerBase
{
    [HttpGet("{guid:guid}/processSwap")]
    public IActionResult ProcessSwap(Guid guid)
    {
        SwapRequest? swap = context.SwapRequests.FirstOrDefault<SwapRequest>(s => s.Guid == guid);
        if (swap == null)
        {
            return NotFound();
        }
        List<ShiftAssignment> fromPartyA = swap.FromPartyA;
        List<ShiftAssignment> fromPartyB = swap.FromPartyB;
        //set the ShiftOwner on all partyBshifts to A and vice versa
        if (fromPartyA == null || fromPartyB == null)
        {
            return NotFound();
        }
        Availability partyA = fromPartyA[0].Availability;
        Availability partyB = fromPartyB[0].Availability;
        foreach (ShiftAssignment shift in fromPartyB)
        {
            shift.Availability = partyA;
        }
        foreach (ShiftAssignment shift in fromPartyA)
        {
            shift.Availability = partyB;
        }
        context.SaveChanges();
        return Ok();
    }
}
