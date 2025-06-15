using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Features.Administration.GetUsers;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.GetUserById;

public class GetUserByIdEndpoint : Endpoint<GetUserByIdRequest, Response<UserDto?>>
{
    private readonly DatabaseContext _databaseContext;

    public GetUserByIdEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("administration/users/{id}");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(GetUserByIdRequest request, CancellationToken cancellationToken)
    {
        var userEntity = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Id == request.Id)
            .FirstOrDefaultAsync(cancellationToken);

        if (userEntity == null)
            ErrorSender.SendError(ErrorDefinitions.UserNotFound);

        // Load mentor roles with their internship providers separately
        var mentorRoleIds = userEntity.Roles.OfType<Domain.Mentor>().Select(m => m.Id).ToList();
        var mentorRoles = await _databaseContext.Set<Domain.Mentor>()
            .Include(m => m.InternshipProvider)
            .Where(m => mentorRoleIds.Contains(m.Id))
            .ToListAsync(cancellationToken);

        // Project to DTO
        var user = new UserDto
        {
            Id = userEntity.Id,
            FirstName = userEntity.FirstName,
            LastName = userEntity.LastName,
            EmailAddress = userEntity.EmailAddress,
            PersonalIdentificationNumber = userEntity.PersonalIdentificationNumber,
            FullName = userEntity.FullName,
            CreatedOn = userEntity.CreatedOn,
            Roles = userEntity.Roles.Select(r => new UserRoleDto
            {
                RoleType = r.RoleType,
                Active = r.Active,
                AcademicDegreeAbbreviation = r is Domain.InternshipSupervisor supervisor ? supervisor.AcademicDegreeAbbreviation : null,
                InternshipProviderName = r is Domain.Mentor mentor ? mentorRoles.FirstOrDefault(m => m.Id == mentor.Id)?.InternshipProvider?.Name : null
            }).ToList()
        };

        await SendAsync(new Response<UserDto?>(user), cancellation: cancellationToken);
    }
} 