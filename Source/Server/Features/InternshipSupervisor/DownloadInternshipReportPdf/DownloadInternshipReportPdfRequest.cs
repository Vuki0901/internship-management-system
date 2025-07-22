using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.InternshipSupervisor.DownloadInternshipReportPdf;

public class DownloadInternshipReportPdfRequest
{
    public required Guid InternshipId { get; set; }
}

public class DownloadInternshipReportPdfRequestValidator : Validator<DownloadInternshipReportPdfRequest>
{
    public DownloadInternshipReportPdfRequestValidator()
    {
        RuleFor(x => x.InternshipId)
            .NotEmpty()
            .WithError(ErrorDefinitions.InternshipIdIsRequired);
    }
} 