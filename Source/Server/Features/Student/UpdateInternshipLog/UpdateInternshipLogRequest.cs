using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Student.UpdateInternshipLog;

public sealed class UpdateInternshipLogRequest
{
    public Guid Id { get; set; }
    public DateTimeOffset Date { get; set; }
    public double NumberOfWorkingHours { get; set; }
    public WorkLocation Location { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
    public InternshipLogStatus Status { get; set; }

    internal sealed class Validator : Validator<UpdateInternshipLogRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.InternshipLogIdIsRequired);

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

            RuleFor(r => r.Status)
                .IsInEnum().WithMessage("Invalid status value");
        }
    }
} 