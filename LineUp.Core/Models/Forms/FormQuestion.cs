using System.ComponentModel.DataAnnotations;

namespace LineUp.Core.Models.Forms;

/// <summary>
/// Represents a question in a form.
/// </summary>
public class FormQuestion
{
    /// <summary>
    /// The primary key of the FormQuestion.
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// The text of the question.
    /// </summary>
    [MaxLength(512)]
    public string QuestionText { get; set; }
    
    /// <summary>
    /// The type of the question.
    /// </summary>
    public QuestionType Type { get; set; }
    
    /// <summary>
    /// The options for the question.
    /// </summary>
    public ICollection<QuestionOptions> Options { get; set; } = new List<QuestionOptions>();
}
