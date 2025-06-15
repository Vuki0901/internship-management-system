using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.GetUsers;

public class GetUsersEndpoint : EndpointWithoutRequest<Response<List<UserDto>>>
{
    private readonly DatabaseContext _databaseContext;

    public GetUsersEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("administration/users");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var userEntities = await _databaseContext.Users
            .Include(u => u.Roles)
            .ToListAsync(cancellationToken);

        // Load mentor roles with internship provider information
        var mentorRoleIds = userEntities
            .SelectMany(u => u.Roles.OfType<Domain.Mentor>())
            .Select(m => m.Id)
            .ToList();

        var mentorRolesWithProviders = mentorRoleIds.Any()
            ? await _databaseContext.Mentors
                .Where(m => mentorRoleIds.Contains(m.Id))
                .Include(m => m.InternshipProvider)
                .ToListAsync(cancellationToken)
            : new List<Domain.Mentor>();

        var users = userEntities.Select(u => new UserDto
        {
            Id = u.Id,
            FirstName = u.FirstName,
            LastName = u.LastName,
            EmailAddress = u.EmailAddress,
            PersonalIdentificationNumber = u.PersonalIdentificationNumber,
            FullName = u.FullName,
            CreatedOn = u.CreatedOn,
            Roles = u.Roles.Select(role => new UserRoleDto
            {
                RoleType = role switch
                {
                    Administrator => "Administrator",
                    Domain.InternshipSupervisor => "InternshipSupervisor",
                    Domain.Mentor => "Mentor",
                    Domain.Student => "Student",
                    _ => "Unknown"
                },
                Active = true, // All roles in the system are considered active
                AcademicDegreeAbbreviation = role is Domain.InternshipSupervisor supervisorRole 
                    ? supervisorRole.AcademicDegreeAbbreviation 
                    : null,
                InternshipProviderName = role is Domain.Mentor mentorRole
                    ? mentorRolesWithProviders.FirstOrDefault(m => m.Id == mentorRole.Id)?.InternshipProvider?.Name
                    : null
            }).ToList()
        }).ToList();

        await SendAsync(new Response<List<UserDto>>(users), cancellation: cancellationToken);
    }
} 