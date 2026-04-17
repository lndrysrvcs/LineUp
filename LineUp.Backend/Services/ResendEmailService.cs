using System.Text;
using LineUp.Core.Models;
using Resend;

namespace LineUp.Backend.Services;

public class ResendEmailService(IResend resend) : IEmailService
{
    private readonly string from =
        Environment.GetEnvironmentVariable("EMAIL_FROM") ?? "LineUp <no-reply@lineup.rem.bi>";

    public async Task SendShiftAssignmentEmail(bool updated, Availability availability)
    {
        if (availability.UserEmail == null)
            return;

        var message = new EmailMessage
        {
            From = from,
            To = { availability.UserEmail },
            Subject =
                $"Your shift {(updated ? "changes" : "assignments")} for {availability.Schedule.Name}",
            Template = new EmailMessageTemplate
            {
                TemplateId = new Guid("c8b5577b-739e-4e13-9b4d-18fd42d9d79d"),
                Variables = new Dictionary<string, object>
                {
                    { "name", availability.UserName },
                    { "schedule_name", availability.Schedule.Name },
                    { "shift_assignments", IEmailService.BuildShiftAssignmentLi(availability) },
                },
            },
        };

        ResendResponse<Guid> response = await resend.EmailSendAsync(message);

        Console.WriteLine("Email sent successfully!");
    }

    public async Task SendAvailabilityConfirmationEmail(bool updated, Availability availability)
    {
        if (availability.UserEmail == null)
            return;

        var message = new EmailMessage
        {
            From = from,
            To = { availability.UserEmail },
            Subject =
                $"{availability.Schedule.Name} - Submission {(updated ? "edited" : "confirmation")}",
            Template = new EmailMessageTemplate
            {
                TemplateId = new Guid("dd88efc4-8d9c-45e1-aa70-b7fe8a0e41c3"),
                Variables = new Dictionary<string, object>
                {
                    { "name", availability.UserName },
                    { "schedule_name", availability.Schedule.Name },
                    { "availability_guid", availability.Guid.ToString() },
                },
            },
        };

        ResendResponse<Guid> response = await resend.EmailSendAsync(message);

        Console.WriteLine("Email sent successfully!");
    }
}
