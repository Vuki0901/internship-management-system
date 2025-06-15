using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetPendingReports;

public class GetPendingReportsEndpoint : EndpointWithoutRequest<GetPendingReportsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetPendingReportsEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Get("/internship-supervisors/pending-reports");
        Roles(nameof(Domain.InternshipSupervisor));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var supervisor = HttpContext.GetAuthenticatedInternshipSupervisor();
        
        // Get reports that are confirmed by mentor but not yet graded
        var pendingReports = await _databaseContext.InternshipReports
            .Include(r => r.Internship)
            .ThenInclude(i => i.InternshipProvider)
            .Where(r => r.IsConfirmedByMentor && r.Grade == null)
            .OrderBy(r => r.ConfirmedAt)
            .ToListAsync(cancellationToken);

        // Get student and mentor information
        var internshipIds = pendingReports.Select(r => r.InternshipId).ToList();
        var internships = await _databaseContext.Internships
            .Where(i => internshipIds.Contains(i.Id))
            .ToListAsync(cancellationToken);

        var studentRoleIds = internships.Where(i => i.StudentId.HasValue).Select(i => i.StudentId!.Value).ToList();
        var mentorRoleIds = internships.Where(i => i.MentorId.HasValue).Select(i => i.MentorId!.Value).ToList();

        var usersWithStudentRoles = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r is Domain.Student && studentRoleIds.Contains(r.Id)))
            .ToListAsync(cancellationToken);

        var usersWithMentorRoles = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r is Domain.Mentor && mentorRoleIds.Contains(r.Id)))
            .ToListAsync(cancellationToken);

        var studentRoleIdToUser = new Dictionary<Guid, User>();
        foreach (var user in usersWithStudentRoles)
        {
            var studentRole = user.Roles.OfType<Domain.Student>().FirstOrDefault(s => studentRoleIds.Contains(s.Id));
            if (studentRole != null)
            {
                studentRoleIdToUser[studentRole.Id] = user;
            }
        }

        var mentorRoleIdToUser = new Dictionary<Guid, User>();
        foreach (var user in usersWithMentorRoles)
        {
            var mentorRole = user.Roles.OfType<Domain.Mentor>().FirstOrDefault(m => mentorRoleIds.Contains(m.Id));
            if (mentorRole != null)
            {
                mentorRoleIdToUser[mentorRole.Id] = user;
            }
        }

        var result = pendingReports.Select(report => 
        {
            var internship = report.Internship;
            return new GetPendingReportsResult.PendingReportInfo
            {
                ReportId = report.Id,
                InternshipId = report.InternshipId,
                TotalHoursWorked = (int)report.TotalHoursWorked,
                TotalLogEntries = (int)report.TotalLogEntries,
                ConfirmedAt = report.ConfirmedAt!.Value.DateTime,
                CreatedOn = report.CreatedOn.DateTime,
                Internship = new GetPendingReportsResult.InternshipInfo
                {
                    Id = internship.Id,
                    StartDate = internship.StartDate?.ToDateTime(TimeOnly.MinValue),
                    EndDate = internship.EndDate?.ToDateTime(TimeOnly.MinValue),
                    Status = internship.Status,
                    StudyLevel = internship.StudyLevel,
                    Student = internship.StudentId.HasValue && studentRoleIdToUser.TryGetValue(internship.StudentId.Value, out var studentUser)
                        ? new GetPendingReportsResult.StudentInfo
                        {
                            Id = studentUser.Id,
                            FirstName = studentUser.FirstName ?? "",
                            LastName = studentUser.LastName ?? "",
                            EmailAddress = studentUser.EmailAddress,
                            FullName = studentUser.FullName ?? ""
                        }
                        : null,
                    Mentor = internship.MentorId.HasValue && mentorRoleIdToUser.TryGetValue(internship.MentorId.Value, out var mentorUser)
                        ? new GetPendingReportsResult.MentorInfo
                        {
                            Id = mentorUser.Id,
                            FirstName = mentorUser.FirstName ?? "",
                            LastName = mentorUser.LastName ?? "",
                            EmailAddress = mentorUser.EmailAddress,
                            FullName = mentorUser.FullName ?? ""
                        }
                        : null,
                    InternshipProvider = internship.InternshipProvider != null ? new GetPendingReportsResult.InternshipProviderInfo
                    {
                        Id = internship.InternshipProvider.Id,
                        Name = internship.InternshipProvider.Name ?? "",
                        Address = internship.InternshipProvider.Address ?? "",
                        ContactEmailAddress = internship.InternshipProvider.ContactEmailAddress ?? "",
                        ContactPhoneNumber = internship.InternshipProvider.ContactPhoneNumber ?? ""
                    } : null
                }
            };
        }).ToList();

        await SendAsync(new GetPendingReportsResult 
        { 
            PendingReports = result 
        }, cancellation: cancellationToken);
    }
} 