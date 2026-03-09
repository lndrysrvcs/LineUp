// Source - https://stackoverflow.com/a/79715903
// Posted by dbc, modified by community. See post 'Timeline' for change history
// Retrieved 2026-03-01, License - CC BY-SA 4.0

using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;

namespace LineUp.Backend.Attributes;

[AttributeUsage(AttributeTargets.Property | AttributeTargets.Field)]
public sealed class JsonDoNotSerializeAttribute : JsonAttribute;

public static class JsonExtensions
{
    public static Action<JsonTypeInfo> ApplyJsonDoNotSerializeAttribute { get; } =
        static typeInfo =>
        {
            if (typeInfo.Kind != JsonTypeInfoKind.Object)
                return;
            foreach (var property in typeInfo.Properties)
                if (
                    property
                        .AttributeProvider?.GetCustomAttributes(
                            typeof(JsonDoNotSerializeAttribute),
                            true
                        )
                        .Any() == true
                )
                    property.ShouldSerialize = returnFalse;
        };
    static readonly Func<object?, object?, bool> returnFalse = static (_, _) => false;
}
