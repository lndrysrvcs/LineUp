using System.Text;
using LineUp.Core.Models;

namespace LineUp.Backend.Services;

public interface IEmailService
{
    Task SendShiftAssignmentEmail(bool updated, Availability availability);

    Task SendAvailabilityConfirmationEmail(bool updated, Availability availability);

    public static string BuildShiftAssignmentLi(Availability availability)
    {
        if (availability.Schedule.ShiftAssignments == null)
            return string.Empty;

        List<ShiftAssignment> myAssignments = availability
            .Schedule.ShiftAssignments.Where(sa => sa.AvailabilityDbId == availability.Id)
            .OrderBy(sa => sa.StartTime)
            .ToList();

        if (myAssignments.Count == 0)
            return string.Empty;

        var builder = new StringBuilder();
        builder.Append("<ul>");

        List<ShiftAssignment> mergedAssignments = [];
        if (myAssignments.Count != 0)
        {
            var current = new ShiftAssignment
            {
                StartTime = myAssignments[0].StartTime,
                EndTime = myAssignments[0].EndTime,
                Availability = availability,
            };

            foreach (var next in myAssignments.Skip(1))
            {
                if (next.StartTime <= current.EndTime)
                {
                    if (next.EndTime > current.EndTime)
                    {
                        current.EndTime = next.EndTime;
                    }
                }
                else
                {
                    mergedAssignments.Add(current);
                    current = new ShiftAssignment
                    {
                        StartTime = next.StartTime,
                        EndTime = next.EndTime,
                        Availability = availability,
                    };
                }
            }
            mergedAssignments.Add(current);
        }

        foreach (
            IGrouping<DateTime, ShiftAssignment> group in mergedAssignments.GroupBy(sa =>
                sa.StartTime.Date
            )
        )
        {
            //todo: format in availability's TZ
            builder.Append($"<li><strong>{group.Key:dddd, MMMM dd, yyyy}</strong>");
            builder.Append("<ul>");
            foreach (var assignment in group)
            {
                builder.Append($"<li>{assignment.StartTime:t} - {assignment.EndTime:t}</li>");
            }
            builder.Append("</ul></li>");
        }

        builder.Append("</ul>");

        return builder.ToString();
    }
}
