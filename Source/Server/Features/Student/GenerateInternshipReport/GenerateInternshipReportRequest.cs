using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.GenerateInternshipReport;

public sealed class GenerateInternshipReportRequest
{
    public Guid InternshipId { get; set; }

    internal sealed class Validator : Validator<GenerateInternshipReportRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipIdIsRequired);
        }
    }
} 