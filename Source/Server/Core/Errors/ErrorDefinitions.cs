namespace InternshipManagementSystem.Core.Errors;

public static class ErrorDefinitions
{
    public static readonly Error InternshipProviderIdIsRequired = new(nameof(InternshipProviderIdIsRequired));
    public static readonly Error InternshipDesiredStartDateIsRequired = new(nameof(InternshipDesiredStartDateIsRequired));
    public static readonly Error InternshipStudyLevelIsRequired = new(nameof(InternshipStudyLevelIsRequired));
    public static readonly Error InternshipWithSameStudyLevelAlreadyExists = new(nameof(InternshipWithSameStudyLevelAlreadyExists));
    
    public static readonly Error UserWithEmailAddressAlreadyExists = new(nameof(UserWithEmailAddressAlreadyExists));
    public static readonly Error EmailIsRequired = new(nameof(EmailIsRequired));
    public static readonly Error InvalidEmailFormat = new(nameof(InvalidEmailFormat));
    public static readonly Error EmailMustBeUniriDomain = new(nameof(EmailMustBeUniriDomain));
    public static readonly Error PasswordIsRequired = new(nameof(PasswordIsRequired));
    public static readonly Error PasswordTooShort = new(nameof(PasswordTooShort));
    public static readonly Error FirstNameIsRequired = new(nameof(FirstNameIsRequired));
    public static readonly Error LastNameIsRequired = new(nameof(LastNameIsRequired));
    public static readonly Error UserDoesNotExist = new(nameof(UserDoesNotExist));
    public static readonly Error UserPasswordIsNotValid = new(nameof(UserPasswordIsNotValid));
    public static readonly Error UserIsNotAdministrator = new(nameof(UserIsNotAdministrator));
    public static readonly Error UserIsNotStudent = new(nameof(UserIsNotStudent));
    public static readonly Error UserIsNotMentor = new(nameof(UserIsNotMentor));
    public static readonly Error UserIsAlreadyAdministrator = new(nameof(UserIsAlreadyAdministrator));
    public static readonly Error UserIsAlreadyInternshipSupervisor = new(nameof(UserIsAlreadyInternshipSupervisor));
    public static readonly Error UserIsAlreadyMentor = new(nameof(UserIsAlreadyMentor));
    public static readonly Error UserIdIsRequired = new(nameof(UserIdIsRequired));
    public static readonly Error InternshipProviderIdIdIsRequired = new(nameof(InternshipProviderIdIdIsRequired));
    public static readonly Error InternshipProviderDoesNotExist = new(nameof(InternshipProviderDoesNotExist));
    
    public static readonly Error InternshipProviderNameIsRequired = new(nameof(InternshipProviderNameIsRequired));
    public static readonly Error InternshipProviderPersonalIdentificationNumberIsTooLong = new(nameof(InternshipProviderPersonalIdentificationNumberIsTooLong));
    public static readonly Error InternshipProviderAlreadyExists = new(nameof(InternshipProviderAlreadyExists));
    public static readonly Error InternshipProviderNotFound = new(nameof(InternshipProviderNotFound));
    public static readonly Error InternshipNotFound = new(nameof(InternshipNotFound));
}