namespace InternshipManagementSystem.Core.Errors;

public static class Errors
{
    public static readonly Error InternshipProviderIdIsRequired = new(nameof(InternshipProviderIdIsRequired));
    public static readonly Error InternshipDesiredStartDateIsRequired = new(nameof(InternshipDesiredStartDateIsRequired));
    public static readonly Error InternshipStudyLevelIsRequired = new(nameof(InternshipStudyLevelIsRequired));
    public static readonly Error InternshipWithSameStudyLevelAlreadyExists = new(nameof(InternshipWithSameStudyLevelAlreadyExists));
}