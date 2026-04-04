using LineUp.Backend.Services;
using LineUp.Core.Models;

namespace LineUp.Backend.Tests;

public class MockEmailService : IEmailService
{
    public List<Availability> SentShiftAssignmentEmails { get; } = new();
    public List<Availability> SentAvailabilityConfirmationEmails { get; } = new();

    public Task SendShiftAssignmentEmail(bool updated, Availability availability)
    {
        SentShiftAssignmentEmails.Add(availability);
        return Task.CompletedTask;
    }

    public Task SendAvailabilityConfirmationEmail(Availability availability)
    {
        SentAvailabilityConfirmationEmails.Add(availability);
        return Task.CompletedTask;
    }
}
