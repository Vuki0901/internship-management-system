using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.CreateUser;

public class CreateUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string? PersonalIdentificationNumber { get; set; }

    internal sealed class Validator : Validator<CreateUserRequest>
    {
        public Validator()
        {
            RuleFor(r => r.FirstName)
                .NotEmpty().WithError(ErrorDefinitions.UserFirstNameIsRequired);

            RuleFor(r => r.LastName)
                .NotEmpty().WithError(ErrorDefinitions.UserLastNameIsRequired);

            RuleFor(r => r.EmailAddress)
                .NotEmpty().WithError(ErrorDefinitions.UserEmailAddressIsRequired)
                .EmailAddress().WithError(ErrorDefinitions.UserEmailAddressInvalidFormat);

            RuleFor(r => r.Password)
                .NotEmpty().WithError(ErrorDefinitions.UserPasswordIsRequired)
                .MinimumLength(8).WithError(ErrorDefinitions.UserPasswordTooShort);
        }
    }
} 