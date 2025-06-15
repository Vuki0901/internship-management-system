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
    public static readonly Error InternshipCannotBeCompleted = new(nameof(InternshipCannotBeCompleted));
    
    public static readonly Error StudentHasNoActiveInternshipAtTheMoment = new(nameof(StudentHasNoActiveInternshipAtTheMoment));
    
    // Internship Log Errors
    public static readonly Error InternshipLogIdIsRequired = new(nameof(InternshipLogIdIsRequired));
    public static readonly Error InternshipLogDateIsRequired = new(nameof(InternshipLogDateIsRequired));
    public static readonly Error InternshipLogWorkingHoursInvalid = new(nameof(InternshipLogWorkingHoursInvalid));
    public static readonly Error InternshipLogLocationIsRequired = new(nameof(InternshipLogLocationIsRequired));
    public static readonly Error InternshipLogDescriptionIsRequired = new(nameof(InternshipLogDescriptionIsRequired));
    public static readonly Error InternshipLogDescriptionTooLong = new(nameof(InternshipLogDescriptionTooLong));
    public static readonly Error InternshipLogFeedbackTooLong = new(nameof(InternshipLogFeedbackTooLong));
    
    // Internship Application Management Errors
    public static readonly Error InternshipIdIsRequired = new(nameof(InternshipIdIsRequired));
    public static readonly Error InternshipApplicationDecisionIsRequired = new(nameof(InternshipApplicationDecisionIsRequired));
    public static readonly Error InternshipDoesNotBelongToMentorCompany = new(nameof(InternshipDoesNotBelongToMentorCompany));
    public static readonly Error InternshipApplicationNotPending = new(nameof(InternshipApplicationNotPending));
    public static readonly Error InternshipLogNotFound = new(nameof(InternshipLogNotFound));
    public static readonly Error InternshipLogAccessDenied = new(nameof(InternshipLogAccessDenied));
    public static readonly Error InternshipLogAlreadyCompleted = new(nameof(InternshipLogAlreadyCompleted));
    
    // User Errors
    public static readonly Error UserNotFound = new(nameof(UserNotFound));
    public static readonly Error UserEmailAddressIsRequired = new(nameof(UserEmailAddressIsRequired));
    public static readonly Error UserFirstNameIsRequired = new(nameof(UserFirstNameIsRequired));
    public static readonly Error UserLastNameIsRequired = new(nameof(UserLastNameIsRequired));
    public static readonly Error UserPasswordIsRequired = new(nameof(UserPasswordIsRequired));
    public static readonly Error UserPasswordTooShort = new(nameof(UserPasswordTooShort));
    public static readonly Error UserEmailAddressInvalidFormat = new(nameof(UserEmailAddressInvalidFormat));
    public static readonly Error UserEmailAddressMustBeUniriDomain = new(nameof(UserEmailAddressMustBeUniriDomain));
    
    // Document Errors
    public static readonly Error DocumentIdIsRequired = new(nameof(DocumentIdIsRequired));
    public static readonly Error DocumentFileNameIsRequired = new(nameof(DocumentFileNameIsRequired));
    public static readonly Error DocumentContentIsRequired = new(nameof(DocumentContentIsRequired));
    public static readonly Error DocumentFileSizeExceeded = new(nameof(DocumentFileSizeExceeded));
    public static readonly Error DocumentInvalidFileType = new(nameof(DocumentInvalidFileType));
    public static readonly Error DocumentNotFound = new(nameof(DocumentNotFound));
    public static readonly Error DocumentInvalidBase64Content = new(nameof(DocumentInvalidBase64Content));
    
    // Internship Report Errors
    public static readonly Error InternshipMustBeCompletedToGenerateReport = new(nameof(InternshipMustBeCompletedToGenerateReport));
    public static readonly Error InternshipReportAlreadyExists = new(nameof(InternshipReportAlreadyExists));
    public static readonly Error InternshipReportNotFound = new(nameof(InternshipReportNotFound));
    public static readonly Error InternshipReportAccessDenied = new(nameof(InternshipReportAccessDenied));
    public static readonly Error InternshipReportMentorContentTooLong = new(nameof(InternshipReportMentorContentTooLong));
    public static readonly Error InternshipReportGradeInvalid = new(nameof(InternshipReportGradeInvalid));

    public static readonly Error UserIsNotInternshipSupervisor = new(nameof(UserIsNotInternshipSupervisor));
    public static readonly Error InternshipReportNotConfirmedByMentor = new(nameof(InternshipReportNotConfirmedByMentor));
}