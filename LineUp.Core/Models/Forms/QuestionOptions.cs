using System.ComponentModel.DataAnnotations;

namespace LineUp.Core.Models.Forms;

public class QuestionOptions
{
    public int Id { get; set; }

    [MaxLength(64)]
    public required string OptionText { get; set; }
    public int SortOrder { get; set; }
}
