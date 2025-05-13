using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.SetInternshipSupervisorRole;

public class SetInternshipSupervisorRoleEndpoint : Endpoint<SetInternshipSupervisorRoleRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public SetInternshipSupervisorRoleEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Post("/administration/users/{UserId}/internship-supervisors");
        AllowAnonymous();
        Roles(nameof(Administrator));
        Description(x => x.Accepts<SetInternshipSupervisorRoleRequest>());
    }

    public override async Task HandleAsync(SetInternshipSupervisorRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await _databaseContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            ErrorSender.SendError(ErrorDefinitions.UserDoesNotExist);

        if (user.Is<InternshipSupervisor>())
            ErrorSender.SendError(ErrorDefinitions.UserIsAlreadyInternshipSupervisor);

        var internshipSupervisor = new InternshipSupervisor { Active = true };
        user.AddRole(internshipSupervisor);

        _databaseContext.Add(internshipSupervisor);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(user), cancellation: cancellationToken);
    }
}