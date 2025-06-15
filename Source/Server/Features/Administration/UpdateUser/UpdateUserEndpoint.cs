using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.UpdateUser;

public class UpdateUserEndpoint : Endpoint<UpdateUserRequest, Response<CreateOrUpdateEntityResult?>>
{
    private readonly DatabaseContext _databaseContext;

    public UpdateUserEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("administration/users/{id}");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(UpdateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _databaseContext.Users.FirstOrDefaultAsync(u => u.Id == request.Id, cancellationToken);
        if (user == null)
            ErrorSender.SendError(ErrorDefinitions.UserNotFound);

        // Check if another user with the same email exists
        if (await _databaseContext.Users.AnyAsync(u => u.Id != request.Id && u.EmailAddress == request.EmailAddress, cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.UserWithEmailAddressAlreadyExists);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.EmailAddress = request.EmailAddress;
        user.PersonalIdentificationNumber = request.PersonalIdentificationNumber;

        // Only update password if provided
        if (!string.IsNullOrEmpty(request.Password))
        {
            user.SetPassword(request.Password);
        }

        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<CreateOrUpdateEntityResult?>(new CreateOrUpdateEntityResult(user.Id)), cancellation: cancellationToken);
    }
} 