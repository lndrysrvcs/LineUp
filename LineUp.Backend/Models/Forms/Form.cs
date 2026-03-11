using LineUp.Backend.Attributes;

namespace LineUp.Backend.Models.Forms;

public class Form
{
    public int Id { get; set; }
    public ICollection<FormQuestion> Questions { get; set; } = new List<FormQuestion>();

    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
