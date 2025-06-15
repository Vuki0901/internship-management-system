using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.CreateUser;

public class CreateUserEndpoint : Endpoint<CreateUserRequest, Response<CreateOrUpdateEntityResult?>>
{
    private readonly DatabaseContext _databaseContext;

    public CreateUserEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("administration/users");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(CreateUserRequest request, CancellationToken cancellationToken)
    {
        if (await _databaseContext.Users.AnyAsync(u => u.EmailAddress == request.EmailAddress, cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.UserWithEmailAddressAlreadyExists);

        var user = new User
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailAddress = request.EmailAddress,
            PersonalIdentificationNumber = request.PersonalIdentificationNumber
        };

        user.SetPassword(request.Password);

        await _databaseContext.Users.AddAsync(user, cancellationToken);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<CreateOrUpdateEntityResult?>(new CreateOrUpdateEntityResult(user.Id)), cancellation: cancellationToken);
    }
} 