using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Student.ApplyForInternship;

public sealed class ApplyForInternshipRequest
{
    public Guid InternshipProviderId { get; set; }
    public DateOnly DesiredStartDate { get; set; }
    public StudyLevel StudyLevel { get; set; }

    internal sealed class Validator : Validator<ApplyForInternshipRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipProviderId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipProviderIdIsRequired);

            RuleFor(r => r.DesiredStartDate)
                .NotEmpty().WithError(ErrorDefinitions.InternshipDesiredStartDateIsRequired);

            RuleFor(r => r.StudyLevel)
                .NotEmpty().WithError(ErrorDefinitions.InternshipStudyLevelIsRequired);
        }
    }
}