using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.GetInternshipReport;

public sealed class GetInternshipReportRequest
{
    public Guid InternshipId { get; set; }

    internal sealed class Validator : Validator<GetInternshipReportRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipIdIsRequired);
        }
    }
} 