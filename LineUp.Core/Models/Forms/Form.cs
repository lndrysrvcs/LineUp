using LineUp.Core.Attributes;

namespace LineUp.Core.Models.Forms;

public class Form
{
    public int Id { get; set; }
    public ICollection<FormQuestion> Questions { get; set; } = new List<FormQuestion>();

    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
