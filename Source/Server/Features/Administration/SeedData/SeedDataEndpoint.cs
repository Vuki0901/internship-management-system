using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.SeedData;

public class SeedDataEndpoint : EndpointWithoutRequest<Response<string>>
{
    private readonly DatabaseContext _databaseContext;

    public SeedDataEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("administration/seed");
        Options(x => x.WithTags("Utilities"));
        AllowAnonymous(); // Allow anonymous access for initial seeding
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        // Check if users table is empty
        var userExists = await _databaseContext.Users.AnyAsync(cancellationToken);
        
        if (userExists)
        {
            await SendAsync(new Response<string>("Database already contains users. Seeding skipped."), cancellation: cancellationToken);
            return;
        }

        // Create the administrator user
        var adminUser = new User
        {
            FirstName = "Leo",
            LastName = "Vukoje",
            EmailAddress = "leo.vukoje@uniri.hr"
        };

        adminUser.SetPassword("Lozinka123");

        // Create administrator role
        var administratorRole = new Administrator { Active = true };
        adminUser.AddRole(administratorRole);

        // Add to database
        await _databaseContext.Users.AddAsync(adminUser, cancellationToken);
        await _databaseContext.Administrators.AddAsync(administratorRole, cancellationToken);
        
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<string>($"Administrator user created successfully with email: {adminUser.EmailAddress}"), cancellation: cancellationToken);
    }
} 