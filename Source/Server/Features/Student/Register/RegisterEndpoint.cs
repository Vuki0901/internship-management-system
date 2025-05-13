using System.Security.Claims;
using FastEndpoints;
using FastEndpoints.Security;
using InternshipManagementSystem.Persistency;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Infrastructure.Configurations;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InternshipManagementSystem.Features.Student.Register;

public sealed class RegisterEndpoint : Endpoint<RegisterRequest, RegisterResult>
{
    private readonly DatabaseContext _databaseContext;
    private readonly JwtConfiguration _jwtConfiguration;

    public RegisterEndpoint(DatabaseContext databaseContext, IOptions<JwtConfiguration> jwtConfiguration)
    {
        _databaseContext = databaseContext;
        _jwtConfiguration = jwtConfiguration.Value;
    }

    public override void Configure()
    {
        Post("students/register");
        AllowAnonymous();
    }

    public override async Task HandleAsync(RegisterRequest request, CancellationToken cancellationToken)
    {
        if (await _databaseContext.Users.AnyAsync(u => u.EmailAddress == request.EmailAddress, cancellationToken: cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.UserWithEmailAddressAlreadyExists);

        var user = new User()
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            EmailAddress = request.EmailAddress,
        };
        
        user.SetPassword(request.Password);
        
        _databaseContext.Users.Add(user);

        var student = new Domain.Student {Active = true};
        user.AddRole(student);

        _databaseContext.Students.Add(student);
        await _databaseContext.SaveChangesAsync(cancellationToken);
        
        var roles = new List<string>();
        roles.AddRange(user.Roles.Select(ar => ar.RoleType));
        
        var token = JwtBearer.CreateToken(o =>
        {
            o.SigningKey = _jwtConfiguration.SigningKey;
            o.ExpireAt = DateTime.Now.AddDays(10);
            o.User.Claims.Add(
                new Claim[]
                {
                    new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new(nameof(user.Id), user.Id.ToString()),
                    new(nameof(user.FullName), user.FullName ?? user.EmailAddress),
                    new(nameof(user.EmailAddress), user.EmailAddress),
                    new(nameof(user.Roles), string.Join(",", roles))
                }
            );
            o.User.Roles.AddRange(roles);
        });
        
        await SendAsync(new RegisterResult { Token = token }, cancellation: cancellationToken);
    }
}