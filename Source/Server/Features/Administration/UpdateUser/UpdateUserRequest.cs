using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.UpdateUser;

public class UpdateUserRequest
{
    public Guid Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string EmailAddress { get; set; } = string.Empty;
    public string? Password { get; set; }
    public string? PersonalIdentificationNumber { get; set; }

    internal sealed class Validator : Validator<UpdateUserRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.UserIdIsRequired);

            RuleFor(r => r.FirstName)
                .NotEmpty().WithError(ErrorDefinitions.UserFirstNameIsRequired);

            RuleFor(r => r.LastName)
                .NotEmpty().WithError(ErrorDefinitions.UserLastNameIsRequired);

            RuleFor(r => r.EmailAddress)
                .NotEmpty().WithError(ErrorDefinitions.UserEmailAddressIsRequired)
                .EmailAddress().WithError(ErrorDefinitions.UserEmailAddressInvalidFormat);

            RuleFor(r => r.Password)
                .MinimumLength(8).WithError(ErrorDefinitions.UserPasswordTooShort)
                .When(r => !string.IsNullOrEmpty(r.Password));
        }
    }
} 