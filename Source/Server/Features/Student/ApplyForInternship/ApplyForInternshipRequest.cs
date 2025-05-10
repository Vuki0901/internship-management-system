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
                .NotEmpty().WithError(Errors.InternshipProviderIdIsRequired);

            RuleFor(r => r.DesiredStartDate)
                .NotEmpty().WithError(Errors.InternshipDesiredStartDateIsRequired);

            RuleFor(r => r.StudyLevel)
                .NotEmpty().WithError(Errors.InternshipStudyLevelIsRequired);
        }
    }
}