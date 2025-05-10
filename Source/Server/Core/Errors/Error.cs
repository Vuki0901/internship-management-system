using System.Text.RegularExpressions;

namespace InternshipManagementSystem.Core.Errors;

public partial struct Error
{
    public Error(string error) => Value = error;

    public string Value { get; }

    public string GetErrorMessage() => SplitterRegex()
        .Replace(Value, m => $"{m.Value.ToLower()}").Trim() + ".";

    [GeneratedRegex("(?<=.)[A-Z](?<!K(?=O))(?<!O(?<=K.))")]
    private static partial Regex SplitterRegex();
}