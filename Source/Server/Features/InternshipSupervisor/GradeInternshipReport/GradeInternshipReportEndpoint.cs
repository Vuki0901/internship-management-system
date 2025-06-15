using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GradeInternshipReport;

public sealed class GradeInternshipReportEndpoint : Endpoint<GradeInternshipReportRequest, GradeInternshipReportResult>
{
    private readonly DatabaseContext _databaseContext;

    public GradeInternshipReportEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("internship-supervisors/internships/{internshipId}/report/grade");
        Roles(nameof(Domain.InternshipSupervisor));
    }

    public override async Task HandleAsync(GradeInternshipReportRequest request, CancellationToken cancellationToken)
    {
        var supervisor = HttpContext.GetAuthenticatedInternshipSupervisor()!;
        
        // Verify internship exists
        var internship = await _databaseContext.Internships
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId, cancellationToken);
        
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Get the report
        var report = await _databaseContext.InternshipReports
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);
        
        if (report == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotFound);

        // Verify report is confirmed by mentor before grading
        if (!report.IsConfirmedByMentor)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotConfirmedByMentor);

        // Update the grade
        report.Grade = request.Grade;
        
        await _databaseContext.SaveChangesAsync(cancellationToken);

        var result = new GradeInternshipReportResult
        {
            Success = true,
            Message = "Ocjena je uspješno dodijeljena izvještaju."
        };

        await SendAsync(result, cancellation: cancellationToken);
    }
} 