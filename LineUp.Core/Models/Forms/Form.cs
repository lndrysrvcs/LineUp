using LineUp.Core.Attributes;

namespace LineUp.Core.Models.Forms;

/// <summary>
/// Represents a form for scheduling.
/// </summary>
public class Form
{
    /// <summary>
    /// The primary key of the Form.
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// The questions in the form.
    /// </summary>
    public ICollection<FormQuestion> Questions { get; set; } = new List<FormQuestion>();

    /// <summary>
    /// The schedule associated with the form.
    /// </summary>
    [JsonDoNotSerialize]
    public required Schedule Schedule { get; set; }
}
