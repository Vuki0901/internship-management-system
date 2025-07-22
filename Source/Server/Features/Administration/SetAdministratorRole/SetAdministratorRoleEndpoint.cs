using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.SetAdministratorRole;

public class SetAdministratorRoleEndpoint : Endpoint<SetAdministratorRoleRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _dbContext;

    public SetAdministratorRoleEndpoint(DatabaseContext dbContext) => _dbContext = dbContext;

    public override void Configure()
    {
        Post("/administration/users/{UserId}/administrators");
        AllowAnonymous();
        Roles(nameof(Administrator));
        Description(x => x.Accepts<SetAdministratorRoleRequest>());
    }

    public override async Task HandleAsync(SetAdministratorRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await _dbContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            ErrorSender.SendError(ErrorDefinitions.UserDoesNotExist);

        if (user.Is<Administrator>())
            ErrorSender.SendError(ErrorDefinitions.UserIsAlreadyAdministrator);

        var administrator = new Administrator { Active = true };
        user.AddRole(administrator);

        _dbContext.Add(administrator);
        await _dbContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new(user), cancellation: cancellationToken);
    }
}