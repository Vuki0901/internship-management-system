namespace InternshipManagementSystem.Core.Interaction;

public sealed class ErrorDetail
{
    public required string Code { get; init; }
    public required string Message { get; init; }
}