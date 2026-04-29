using System.ComponentModel.DataAnnotations;

namespace LineUp.Core.Models.Forms;

/// <summary>
/// Represents the available options for a form question.
/// </summary>
public class QuestionOptions
{
    /// <summary>
    /// The primary key of the QuestionOptions.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// The text of the option.
    /// </summary>
    [MaxLength(64)]
    public required string OptionText { get; set; }
    
    /// <summary>
    /// The order in which the options should be displayed.
    /// </summary>
    public int SortOrder { get; set; }
}
