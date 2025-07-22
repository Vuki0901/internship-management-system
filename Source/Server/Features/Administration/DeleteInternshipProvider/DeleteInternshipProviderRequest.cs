using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.DeleteInternshipProvider;

public class DeleteInternshipProviderRequest
{
    public required Guid Id { get; set; }

    internal sealed class Validator : Validator<DeleteInternshipProviderRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderIdIsRequired);
        }
    }
} 