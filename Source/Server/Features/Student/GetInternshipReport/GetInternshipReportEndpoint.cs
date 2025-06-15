using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternshipReport;

public sealed class GetInternshipReportEndpoint : Endpoint<GetInternshipReportRequest, GetInternshipReportResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipReportEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("students/internships/{internshipId}/report");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(GetInternshipReportRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;
        
        // Verify internship exists and belongs to the student
        var internship = await _databaseContext.Internships
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId && i.StudentId == student.Id, cancellationToken);
        
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Get the report
        var report = await _databaseContext.InternshipReports
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);
        
        if (report == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotFound);

        var result = new GetInternshipReportResult
        {
            Id = report.Id,
            InternshipId = report.InternshipId,
            TotalHoursWorked = report.TotalHoursWorked,
            TotalLogEntries = report.TotalLogEntries,
            MentorContent = report.MentorContent,
            Grade = report.Grade,
            IsConfirmedByMentor = report.IsConfirmedByMentor,
            ConfirmedAt = report.ConfirmedAt,
            CreatedOn = report.CreatedOn
        };

        await SendAsync(result, cancellation: cancellationToken);
    }
} 