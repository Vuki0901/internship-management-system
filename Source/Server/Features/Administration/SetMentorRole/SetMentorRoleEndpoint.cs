using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.SetMentorRole;

public class SetMentorRoleEndpoint : Endpoint<SetMentorRoleRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public SetMentorRoleEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("/administration/users/{UserId}/mentors");
        AllowAnonymous();
        Roles(nameof(Administrator));
        Description(x => x.Accepts<SetMentorRoleRequest>());
    }

    public override async Task HandleAsync(SetMentorRoleRequest request, CancellationToken cancellationToken)
    {
        var user = await _databaseContext.Users.Include(u => u.Roles).FirstOrDefaultAsync(u => u.Id == request.UserId, cancellationToken);
        if (user == null)
            ErrorSender.SendError(ErrorDefinitions.UserDoesNotExist);

        if (user.Is<Domain.Mentor>())
            ErrorSender.SendError(ErrorDefinitions.UserIsAlreadyMentor);
        
        var internshipProvider = await _databaseContext.InternshipProviders.FirstOrDefaultAsync(p => p.Id == request.InternshipProviderId, cancellationToken: cancellationToken);
        if(internshipProvider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderDoesNotExist);

        var mentor = new Domain.Mentor { Active = true, InternshipProvider = internshipProvider };
        user.AddRole(mentor);

        _databaseContext.Add(mentor);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(user), cancellation: cancellationToken);
    }
}