using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternshipProviders;

public class GetInternshipProvidersEndpoint : EndpointWithoutRequest<GetInternshipProvidersResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipProvidersEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Get("/internship-supervisors/internship-providers");
        Roles(nameof(Domain.InternshipSupervisor));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var supervisor = HttpContext.GetAuthenticatedInternshipSupervisor();
        
        var internshipProviders = await _databaseContext.InternshipProviders
            .OrderBy(ip => ip.Name)
            .Select(ip => new GetInternshipProvidersResult.InternshipProviderInfo
            {
                Id = ip.Id,
                Name = ip.Name ?? "",
                Address = ip.Address ?? "",
                ContactEmailAddress = ip.ContactEmailAddress ?? "",
                ContactPhoneNumber = ip.ContactPhoneNumber ?? "",
                CreatedOn = ip.CreatedOn.DateTime
            })
            .ToListAsync(cancellationToken);
        
        await SendAsync(new GetInternshipProvidersResult 
        { 
            InternshipProviders = internshipProviders 
        }, cancellation: cancellationToken);
    }
} 