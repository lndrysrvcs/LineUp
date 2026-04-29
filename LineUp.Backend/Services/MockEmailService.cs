using LineUp.Core.Models;

namespace LineUp.Backend.Services;

/// <summary>
/// Mock implementation of <see cref="IEmailService"/> for testing.
/// </summary>
public class MockEmailService : IEmailService
{
    public List<Availability> SentShiftAssignmentEmails { get; } = new();
    public List<Availability> SentAvailabilityConfirmationEmails { get; } = new();

    public Task SendShiftAssignmentEmail(bool updated, Availability availability)
    {
        SentShiftAssignmentEmails.Add(availability);
        return Task.CompletedTask;
    }

    public Task SendAvailabilityConfirmationEmail(bool updated, Availability availability)
    {
        SentAvailabilityConfirmationEmails.Add(availability);
        return Task.CompletedTask;
    }
}
