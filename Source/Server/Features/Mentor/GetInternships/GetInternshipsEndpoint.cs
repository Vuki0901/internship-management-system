using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Features.Student.GetInternships;
using InternshipManagementSystem.Persistency;
using InternshipManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Mentor.GetInternships;

public class GetInternshipsEndpoint : EndpointWithoutRequest<GetInternshipResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipsEndpoint(DatabaseContext databaseDatabaseContext) => _databaseContext = databaseDatabaseContext;

    public override void Configure()
    {
        Get("/mentors/internships");
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
            await SendAsync(new GetInternshipResult { Internships = new List<GetInternshipResult.InternshipInformation>() }, cancellation: cancellationToken);
            return;
        }
        
        // Get internships assigned to this mentor with explicit loading of relationships
        var internships = await _databaseContext.Internships
            .Where(i => i.MentorId == mentor.Id)
            .ToListAsync(cancellationToken);

        if (!internships.Any())
        {
            await SendAsync(new GetInternshipResult { Internships = new List<GetInternshipResult.InternshipInformation>() }, cancellation: cancellationToken);
            return;
        }

        // Load InternshipProvider for each internship explicitly
        foreach (var internship in internships)
        {
            await _databaseContext.Entry(internship)
                .Reference(i => i.InternshipProvider)
                .LoadAsync(cancellationToken);
        }

        // Get student role IDs from internships
        var studentRoleIds = internships.Where(i => i.StudentId.HasValue).Select(i => i.StudentId!.Value).ToList();
        
        // Create a mapping from Student Role ID to User
        var studentRoleIdToUser = new Dictionary<Guid, User>();
        
        if (studentRoleIds.Any())
        {
            // Find users that have student roles with the given IDs
            var usersWithStudentRoles = await _databaseContext.Users
                .Include(u => u.Roles)
                .Where(u => u.Roles.Any(r => r is Domain.Student && studentRoleIds.Contains(r.Id)))
                .ToListAsync(cancellationToken);
            
            foreach (var user in usersWithStudentRoles)
            {
                var studentRole = user.Roles.OfType<Domain.Student>().FirstOrDefault(s => studentRoleIds.Contains(s.Id));
                if (studentRole != null)
                {
                    studentRoleIdToUser[studentRole.Id] = user;
                }
            }
        }

        // Build result with complete information
        var result = internships.Select(i => new GetInternshipResult.InternshipInformation
        {
            Id = i.Id,
            StartDate = i.StartDate,
            EndDate = i.EndDate,
            Status = i.Status,
            StudyLevel = i.StudyLevel,
            CreatedOn = i.CreatedOn,
            StudentId = i.StudentId,
            Student = i.StudentId.HasValue && studentRoleIdToUser.TryGetValue(i.StudentId.Value, out var user)
                ? new GetInternshipResult.StudentInfo
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    EmailAddress = user.EmailAddress,
                    FullName = user.FullName
                }
                : null,
            InternshipProvider = i.InternshipProvider != null 
                ? new GetInternshipResult.InternshipProviderInfo
                {
                    Id = i.InternshipProvider.Id,
                    Name = i.InternshipProvider.Name,
                    Address = i.InternshipProvider.Address,
                    ContactEmailAddress = i.InternshipProvider.ContactEmailAddress,
                    ContactPhoneNumber = i.InternshipProvider.ContactPhoneNumber
                }
                : mentor.InternshipProvider != null 
                    ? new GetInternshipResult.InternshipProviderInfo
                    {
                        Id = mentor.InternshipProvider.Id,
                        Name = mentor.InternshipProvider.Name,
                        Address = mentor.InternshipProvider.Address,
                        ContactEmailAddress = mentor.InternshipProvider.ContactEmailAddress,
                        ContactPhoneNumber = mentor.InternshipProvider.ContactPhoneNumber
                    }
                    : null
        }).OrderBy(i => i.CreatedOn).ToList();
        
        await SendAsync(new GetInternshipResult { Internships = result }, cancellation: cancellationToken);
    }
}