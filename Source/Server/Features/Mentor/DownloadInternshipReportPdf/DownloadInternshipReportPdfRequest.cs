using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Mentor.DownloadInternshipReportPdf;

public sealed class DownloadInternshipReportPdfRequest
{
    public Guid InternshipId { get; set; }

    internal sealed class Validator : Validator<DownloadInternshipReportPdfRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty().WithError(ErrorDefinitions.InternshipIdIsRequired);
        }
    }
} 