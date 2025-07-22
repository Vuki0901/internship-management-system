using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Mentor.UpdateInternshipReport;

public sealed class UpdateInternshipReportEndpoint : Endpoint<UpdateInternshipReportRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public UpdateInternshipReportEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("mentors/internships/{internshipId}/report");
        Roles(nameof(Mentor));
    }

    public override async Task HandleAsync(UpdateInternshipReportRequest request, CancellationToken cancellationToken)
    {
        var mentor = HttpContext.GetAuthenticatedMentor()!;
        
        // Verify internship exists and is mentored by this mentor
        var internship = await _databaseContext.Internships
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId && i.MentorId == mentor.Id, cancellationToken);
        
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportAccessDenied);

        // Get the report
        var report = await _databaseContext.InternshipReports
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);
        
        if (report == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotFound);

        // Update the report
        report.MentorContent = request.MentorContent;
        report.Grade = request.Grade;
        
        // Handle confirmation logic
        if (request.IsConfirmedByMentor && !report.IsConfirmedByMentor)
        {
            report.IsConfirmedByMentor = true;
            report.ConfirmedAt = DateTimeOffset.UtcNow;
        }
        else if (!request.IsConfirmedByMentor && report.IsConfirmedByMentor)
        {
            report.IsConfirmedByMentor = false;
            report.ConfirmedAt = null;
        }

        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(report), cancellation: cancellationToken);
    }
} 