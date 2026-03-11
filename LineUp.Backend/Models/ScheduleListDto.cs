namespace LineUp.Backend.Models;

public class ScheduleListDto
{
    public required string Name { get; set; }
    public required Guid Guid { get; set; }
    public required int Respondents { get; set; }
}
