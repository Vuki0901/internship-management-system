using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Mentor.ManageInternshipApplication;

public enum ApplicationDecision
{
    Accept = 1,
    Reject = 2
}

public sealed class ManageInternshipApplicationRequest
{
    public Guid InternshipId { get; set; }
    public ApplicationDecision Decision { get; set; }

    internal sealed class Validator : Validator<ManageInternshipApplicationRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipIdIsRequired);

            RuleFor(r => r.Decision)
                .IsInEnum().WithError(ErrorDefinitions.InternshipApplicationDecisionIsRequired);
        }
    }
} 