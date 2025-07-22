using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.GetInternshipProviders;

public class GetInternshipProvidersEndpoint : EndpointWithoutRequest<Response<List<InternshipProviderDto>>>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipProvidersEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("administration/internship-providers");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var providers = await _databaseContext.InternshipProviders
            .Select(p => new InternshipProviderDto
            {
                Id = p.Id,
                Name = p.Name,
                PersonalIdentificationNumber = p.PersonalIdentificationNumber,
                Address = p.Address,
                ContactEmailAddress = p.ContactEmailAddress,
                ContactPhoneNumber = p.ContactPhoneNumber
            })
            .ToListAsync(cancellationToken);

        await SendAsync(new Response<List<InternshipProviderDto>>(providers), cancellation: cancellationToken);
    }
} 