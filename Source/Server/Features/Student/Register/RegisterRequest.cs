using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;
using System.Text.RegularExpressions;

namespace InternshipManagementSystem.Features.Student.Register;

public sealed class RegisterRequest
{
    public string EmailAddress { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;

    internal sealed class Validator : Validator<RegisterRequest>
    {
        public Validator()
        {
            RuleFor(r => r.EmailAddress)
                .NotEmpty().WithError(ErrorDefinitions.EmailIsRequired)
                .EmailAddress().WithError(ErrorDefinitions.InvalidEmailFormat)
                .Must(email => email.EndsWith("@uniri.hr", StringComparison.OrdinalIgnoreCase))
                .WithError(ErrorDefinitions.EmailMustBeUniriDomain);

            RuleFor(r => r.Password)
                .NotEmpty().WithError(ErrorDefinitions.PasswordIsRequired)
                .MinimumLength(8).WithError(ErrorDefinitions.PasswordTooShort);

            RuleFor(r => r.FirstName)
                .NotEmpty().WithError(ErrorDefinitions.FirstNameIsRequired);

            RuleFor(r => r.LastName)
                .NotEmpty().WithError(ErrorDefinitions.LastNameIsRequired);
        }
    }
}
