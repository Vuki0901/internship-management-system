using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Mentor.GetInternshipApplications;

public class GetInternshipApplicationsEndpoint : EndpointWithoutRequest<GetInternshipApplicationsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipApplicationsEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Get("/mentors/internship-applications");
        Roles(nameof(Mentor));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var mentorRole = HttpContext.GetAuthenticatedMentor()!;
        
        // Load the mentor with its InternshipProvider relationship
        var mentor = await _databaseContext.Set<Domain.Mentor>()
            .Include(m => m.InternshipProvider)
            .FirstOrDefaultAsync(m => m.Id == mentorRole.Id, cancellationToken);
        
        if (mentor?.InternshipProvider == null)
        {
            await SendAsync(new GetInternshipApplicationsResult { InternshipApplications = new List<GetInternshipApplicationsResult.InternshipApplicationInfo>() }, cancellation: cancellationToken);
            return;
        }
        
        var applications = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .Where(i => i.InternshipProvider!.Id == mentor.InternshipProvider.Id && i.Status == InternshipStatus.Pending)
            .OrderBy(i => i.CreatedOn)
            .ToListAsync(cancellationToken);

        // Get all student role IDs from applications
        var studentRoleIds = applications.Where(a => a.StudentId.HasValue).Select(a => a.StudentId!.Value).ToList();
        
        // Find users that have student roles with the given IDs
        // Since User has Roles collection, we need to query from User side
        var usersWithStudentRoles = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r is Domain.Student && studentRoleIds.Contains(r.Id)))
            .ToListAsync(cancellationToken);
        
        // Create a mapping from Student Role ID to User
        var studentRoleIdToUser = new Dictionary<Guid, User>();
        foreach (var user in usersWithStudentRoles)
        {
            var studentRole = user.Roles.OfType<Domain.Student>().FirstOrDefault(s => studentRoleIds.Contains(s.Id));
            if (studentRole != null)
            {
                studentRoleIdToUser[studentRole.Id] = user;
            }
        }

        // Build result with student information
        var result = applications.Select(application => new GetInternshipApplicationsResult.InternshipApplicationInfo
        {
            Id = application.Id,
            StartDate = application.StartDate,
            Status = application.Status,
            StudyLevel = application.StudyLevel,
            CreatedOn = application.CreatedOn,
            StudentId = application.StudentId,
            Student = application.StudentId.HasValue && studentRoleIdToUser.TryGetValue(application.StudentId.Value, out var user)
                ? new GetInternshipApplicationsResult.StudentInfo
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    EmailAddress = user.EmailAddress,
                    FullName = user.FullName
                }
                : null,
            InternshipProvider = new GetInternshipApplicationsResult.InternshipProviderInfo
            {
                Id = application.InternshipProvider!.Id,
                Name = application.InternshipProvider.Name,
                Address = application.InternshipProvider.Address,
                ContactEmailAddress = application.InternshipProvider.ContactEmailAddress,
                ContactPhoneNumber = application.InternshipProvider.ContactPhoneNumber
            }
        }).ToList();

        await SendAsync(new GetInternshipApplicationsResult { InternshipApplications = result }, cancellation: cancellationToken);
    }
} 