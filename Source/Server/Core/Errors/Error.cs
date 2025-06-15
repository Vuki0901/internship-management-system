using System.Text.RegularExpressions;

namespace InternshipManagementSystem.Core.Errors;

public readonly partial struct Error
{
    public Error(string error) => Value = error;

    public string Value { get; }

    public string GetErrorMessage()
    {
        // Add space before uppercase, unless it's the first character
        var withSpaces = Regex.Replace(Value, "(?<!^)([A-Z])", " $1");
        // Capitalize first, lowercase rest
        var sentence = char.ToUpper(withSpaces[0]) + withSpaces.Substring(1).ToLower();
        return sentence.Trim() + ".";
    }
}