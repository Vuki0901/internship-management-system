using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Mentor.UpdateInternshipReport;

public sealed class UpdateInternshipReportRequest
{
    public Guid InternshipId { get; set; }
    public string MentorContent { get; set; } = string.Empty;
    public int? Grade { get; set; }
    public bool IsConfirmedByMentor { get; set; }

    internal sealed class Validator : Validator<UpdateInternshipReportRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipIdIsRequired);

            RuleFor(r => r.MentorContent)
                .MaximumLength(4000).WithError(ErrorDefinitions.InternshipReportMentorContentTooLong);

            RuleFor(r => r.Grade)
                .Must(g => g == null || (g >= 1 && g <= 5))
                .WithError(ErrorDefinitions.InternshipReportGradeInvalid);
        }
    }
} 