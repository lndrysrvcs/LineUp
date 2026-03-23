using CSharpVitamins;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace LineUp.Backend.Models;

public class ShortGuidConverter : ValueConverter<ShortGuid, string>
{
    public ShortGuidConverter()
        : base(v => v.ToString(), v => new ShortGuid(v)) { }
}
