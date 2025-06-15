using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternshipReport;

public sealed class GetInternshipReportEndpoint : Endpoint<GetInternshipReportRequest, GetInternshipReportResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipReportEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("internship-supervisors/internships/{internshipId}/report");
        Roles(nameof(Domain.InternshipSupervisor));
    }

    public override async Task HandleAsync(GetInternshipReportRequest request, CancellationToken cancellationToken)
    {
        var supervisor = HttpContext.GetAuthenticatedInternshipSupervisor()!;
        
        // Verify internship exists (supervisors can access any internship)
        var internship = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId, cancellationToken);
        
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Get the report
        var report = await _databaseContext.InternshipReports
            .FirstOrDefaultAsync(r => r.InternshipId == request.InternshipId, cancellationToken);
        
        if (report == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipReportNotFound);

        // Get student information
        var studentUser = internship.StudentId.HasValue 
            ? await _databaseContext.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Roles.Any(r => r is Domain.Student && r.Id == internship.StudentId.Value), cancellationToken)
            : null;

        // Get mentor information
        var mentorUser = internship.MentorId.HasValue 
            ? await _databaseContext.Users
                .Include(u => u.Roles)
                .FirstOrDefaultAsync(u => u.Roles.Any(r => r is Domain.Mentor && r.Id == internship.MentorId.Value), cancellationToken)
            : null;

        var result = new GetInternshipReportResult
        {
            Id = report.Id,
            InternshipId = report.InternshipId,
            TotalHoursWorked = (int)report.TotalHoursWorked,
            TotalLogEntries = (int)report.TotalLogEntries,
            MentorContent = report.MentorContent,
            Grade = report.Grade,
            IsConfirmedByMentor = report.IsConfirmedByMentor,
            ConfirmedAt = report.ConfirmedAt?.DateTime,
            CreatedOn = report.CreatedOn.DateTime,
            Internship = new GetInternshipReportResult.InternshipInfo
            {
                Id = internship.Id,
                StartDate = internship.StartDate?.ToDateTime(TimeOnly.MinValue),
                EndDate = internship.EndDate?.ToDateTime(TimeOnly.MinValue),
                Status = internship.Status,
                StudyLevel = internship.StudyLevel,
                Student = studentUser != null ? new GetInternshipReportResult.StudentInfo
                {
                    Id = studentUser.Id,
                    FirstName = studentUser.FirstName ?? "",
                    LastName = studentUser.LastName ?? "",
                    EmailAddress = studentUser.EmailAddress,
                    FullName = studentUser.FullName ?? ""
                } : null,
                Mentor = mentorUser != null ? new GetInternshipReportResult.MentorInfo
                {
                    Id = mentorUser.Id,
                    FirstName = mentorUser.FirstName ?? "",
                    LastName = mentorUser.LastName ?? "",
                    EmailAddress = mentorUser.EmailAddress,
                    FullName = mentorUser.FullName ?? ""
                } : null,
                InternshipProvider = internship.InternshipProvider != null ? new GetInternshipReportResult.InternshipProviderInfo
                {
                    Id = internship.InternshipProvider.Id,
                    Name = internship.InternshipProvider.Name ?? "",
                    Address = internship.InternshipProvider.Address ?? "",
                    ContactEmailAddress = internship.InternshipProvider.ContactEmailAddress ?? "",
                    ContactPhoneNumber = internship.InternshipProvider.ContactPhoneNumber ?? ""
                } : null
            }
        };

        await SendAsync(result, cancellation: cancellationToken);
    }
} 