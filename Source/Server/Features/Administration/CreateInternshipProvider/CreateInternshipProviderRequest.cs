using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.CreateInternshipProvider;

public class CreateInternshipProviderRequest
{
    public required string Name { get; set; }
    public string? PersonalIdentificationNumber { get; set; }
    public string? Address { get; set; }
    public string? ContactEmailAddress { get; set; }
    public string? ContactPhoneNumber { get; set; }
    
    internal sealed class Validator : Validator<CreateInternshipProviderRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Name)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderNameIsRequired);

            RuleFor(r => r.PersonalIdentificationNumber)
                .MaximumLength(11).WithError(ErrorDefinitions.InternshipProviderPersonalIdentificationNumberIsTooLong);
        }
    }
}