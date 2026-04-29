namespace LineUp.Core.Models.Forms;

public class FormQuestionAnswer
{
    /// <summary>
    /// The primary key of the FormQuestionAnswer.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// The ID of the associated FormQuestion.
    /// </summary>
    public int FormQuestionId { get; set; }
    
    /// <summary>
    /// The ID of the associated QuestionOptions.
    /// </summary>
    public int AnswerId { get; set; }

    /// <summary>
    /// The associated FormQuestion.
    /// </summary>
    public required FormQuestion Question { get; set; }

    /// <summary>
    /// The text answer provided by the user.
    /// </summary>
    public required string AnswerText { get; set; }
}
