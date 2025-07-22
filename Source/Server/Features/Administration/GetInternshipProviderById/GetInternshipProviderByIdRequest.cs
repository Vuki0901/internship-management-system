using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.GetInternshipProviderById;

public class GetInternshipProviderByIdRequest
{
    public required Guid Id { get; set; }

    internal sealed class Validator : Validator<GetInternshipProviderByIdRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderIdIsRequired);
        }
    }
} 