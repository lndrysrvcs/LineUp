namespace LineUp.Backend.Models.Forms;

public class FormQuestionAnswer
{
    public int Id { get; set; }
    public int FormQuestionId { get; set; }
    public int AnswerId { get; set; }

    public required FormQuestion Question { get; set; }

    public required string AnswerText { get; set; }
}
