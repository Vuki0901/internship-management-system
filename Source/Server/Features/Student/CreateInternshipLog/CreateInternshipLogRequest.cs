using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Student.CreateInternshipLog;

public sealed class CreateInternshipLogRequest
{
    public DateTimeOffset Date { get; set; }
    public double NumberOfWorkingHours { get; set; }
    public WorkLocation Location { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;

    internal sealed class Validator : Validator<CreateInternshipLogRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Date)
                .NotEmpty().WithError(ErrorDefinitions.InternshipLogDateIsRequired);

            RuleFor(r => r.NumberOfWorkingHours)
                .GreaterThan(0).WithError(ErrorDefinitions.InternshipLogWorkingHoursInvalid);

            RuleFor(r => r.Location)
                .NotEmpty().WithError(ErrorDefinitions.InternshipLogLocationIsRequired);

            RuleFor(r => r.Description)
                .NotEmpty().WithError(ErrorDefinitions.InternshipLogDescriptionIsRequired)
                .MaximumLength(4000).WithError(ErrorDefinitions.InternshipLogDescriptionTooLong);

            RuleFor(r => r.Feedback)
                .MaximumLength(4000).WithError(ErrorDefinitions.InternshipLogFeedbackTooLong);
        }
    }
} 