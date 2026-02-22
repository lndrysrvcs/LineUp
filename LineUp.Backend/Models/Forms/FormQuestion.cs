using System.ComponentModel.DataAnnotations;

namespace LineUp.Backend.Models.Forms;

public class FormQuestion
{
    public int Id { get; set; }

    [MaxLength(512)]
    public string QuestionText { get; set; }
    public QuestionType Type { get; set; }
    public ICollection<QuestionOptions> Options { get; set; } = new List<QuestionOptions>();
}
