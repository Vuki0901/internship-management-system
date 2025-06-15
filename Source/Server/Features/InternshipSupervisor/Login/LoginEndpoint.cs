using System.Security.Claims;
using FastEndpoints;
using FastEndpoints.Security;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Infrastructure.Configurations;
using InternshipManagementSystem.Persistency;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace InternshipManagementSystem.Features.InternshipSupervisor.Login;

public class LoginEndpoint : Endpoint<LoginRequest, LoginResult>
{
    private readonly DatabaseContext _databaseContext;
    private readonly JwtConfiguration _jwtConfiguration;

    public LoginEndpoint(DatabaseContext databaseContext, IOptions<JwtConfiguration> jwtConfiguration)
    {
        _databaseContext = databaseContext;
        _jwtConfiguration = jwtConfiguration.Value;
    }

    public override void Configure()
    {
        Post("internship-supervisors/login");
        AllowAnonymous();
    }

    public override async Task HandleAsync(LoginRequest request, CancellationToken cancellationToken)
    {
        var user = await _databaseContext
            .Users.Include(u => u.Roles)
            .FirstOrDefaultAsync(u => u.EmailAddress == request.EmailAddress, cancellationToken);
        if (user is null)
            ErrorSender.SendError(ErrorDefinitions.UserDoesNotExist);
        
        if (!user.IsCorrectPassword(request.Password))
            ErrorSender.SendError(ErrorDefinitions.UserPasswordIsNotValid);
        
        if (!user.Is<Domain.InternshipSupervisor>())
            ErrorSender.SendError(ErrorDefinitions.UserIsNotInternshipSupervisor);
        
        var roles = new List<string>();
        roles.AddRange(user.Roles.Select(ar => ar.RoleType));
        
        var token = JwtBearer.CreateToken(o =>
        {
            o.SigningKey = _jwtConfiguration.SigningKey;
            o.ExpireAt = DateTime.Now.AddDays(10);
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new(nameof(user.Id), user.Id.ToString()),
                new(nameof(user.FullName), user.FullName ?? user.EmailAddress),
                new(nameof(user.EmailAddress), user.EmailAddress)
            };
            
            // Add each role as a separate claim to ensure it's always an array
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
                claims.Add(new Claim("Roles", role)); // Custom claim for frontend compatibility
            }
            
            // Add a dummy claim to force array behavior when there's only one role
            if (roles.Count == 1)
            {
                claims.Add(new Claim("Roles", "")); // Empty dummy claim to force array
            }
            
            o.User.Claims.Add(claims.ToArray());
            o.User.Roles.AddRange(roles);
        });
        
        await SendAsync(new LoginResult { Token = token }, cancellation: cancellationToken);
    }
} 