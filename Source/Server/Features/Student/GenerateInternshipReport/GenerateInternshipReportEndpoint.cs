using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GenerateInternshipReport;

public sealed class GenerateInternshipReportEndpoint : Endpoint<GenerateInternshipReportRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public GenerateInternshipReportEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("students/internships/{internshipId}/generate-report");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(GenerateInternshipReportRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;
        
        // Verify internship exists and belongs to the student
        var internship = await _databaseContext.Internships
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId && i.StudentId == student.Id, cancellationToken);
        
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Verify internship is completed
        if (internship.Status != InternshipStatus.Completed)
            ErrorSender.SendError(ErrorDefinitions.InternshipMustBeCompletedToGenerateReport);

        // Check if report already exists
        var existingReport = await _databaseContext.InternshipReports
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);
        
        if (existingReport != null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportAlreadyExists);

        // Calculate totals from internship logs
        var logs = await _databaseContext.InternshipLogs
            .Where(l => l.Internship!.Id == request.InternshipId)
            .ToListAsync(cancellationToken);

        var totalHours = logs.Sum(l => l.NumberOfWorkingHours);
        var totalEntries = logs.Count;

        // Create the report
        var report = new InternshipReport
        {
            InternshipId = request.InternshipId,
            TotalHoursWorked = totalHours,
            TotalLogEntries = totalEntries,
            MentorContent = string.Empty,
            Grade = null,
            IsConfirmedByMentor = false,
            ConfirmedAt = null,
            Internship = internship
        };

        await _databaseContext.InternshipReports.AddAsync(report, cancellationToken);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(report), cancellation: cancellationToken);
    }
} 