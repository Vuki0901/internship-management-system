using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.UpdateInternshipProvider;

public class UpdateInternshipProviderRequest
{
    public required Guid Id { get; set; }
    public required string Name { get; set; }
    public string? PersonalIdentificationNumber { get; set; }
    public string? Address { get; set; }
    public string? ContactEmailAddress { get; set; }
    public string? ContactPhoneNumber { get; set; }
    
    internal sealed class Validator : Validator<UpdateInternshipProviderRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderIdIsRequired);

            RuleFor(r => r.Name)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderNameIsRequired);

            RuleFor(r => r.PersonalIdentificationNumber)
                .MaximumLength(11).WithError(ErrorDefinitions.InternshipProviderPersonalIdentificationNumberIsTooLong);
        }
    }
} 