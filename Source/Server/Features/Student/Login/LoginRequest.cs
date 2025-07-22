using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.Login;

public class LoginRequest
{
    public required string EmailAddress { get; set; }
    public required string Password { get; set; }
    
    internal sealed class Validator : Validator<LoginRequest>
    {
        public Validator()
        {
            RuleFor(r => r.EmailAddress)
                .NotEmpty().WithError(ErrorDefinitions.EmailIsRequired)
                .EmailAddress().WithError(ErrorDefinitions.InvalidEmailFormat)
                .Must(email => email.EndsWith("@uniri.hr", StringComparison.OrdinalIgnoreCase))
                .WithError(ErrorDefinitions.EmailMustBeUniriDomain);

            RuleFor(r => r.Password)
                .NotEmpty().WithError(ErrorDefinitions.PasswordIsRequired);
        }
    }
}