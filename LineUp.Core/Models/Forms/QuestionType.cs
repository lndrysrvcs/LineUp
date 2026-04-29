namespace LineUp.Core.Models.Forms;

/// <summary>
/// Represents the different types of questions that can be included in a form.
/// </summary>
public enum QuestionType
{
    /// <summary>
    /// The question is a free-response question.
    /// </summary>
    FreeResponse = 0,
    /// <summary>
    /// The question is a radio button question.
    /// </summary>
    Radio = 1,
    /// <summary>
    /// The question is a multiple-choice question.
    /// </summary>
    Checkbox = 2,
    /// <summary>
    /// The question is a dropdown menu.
    /// </summary>
    Select = 3,
}
