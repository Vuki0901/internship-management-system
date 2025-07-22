using FastEndpoints;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternshipProviders;

public class GetInternshipProvidersEndpoint : EndpointWithoutRequest<GetInternshipProvidersResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipProvidersEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("students/internship-providers");
        Roles(nameof(Student), nameof(Administrator));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var internshipProviders = await _databaseContext.InternshipProviders.Where(i => i.Active).OrderBy(i => i.CreatedOn)
            .Select(i => new GetInternshipProvidersResult.InternshipProviderInformation()
            {
                Id = i.Id,
                Name = i.Name,
                PersonalIdentificationNumber = i.PersonalIdentificationNumber,
                Address = i.Address,
                ContactEmailAddress = i.ContactEmailAddress,
                ContactPhoneNumber = i.ContactPhoneNumber
            }).ToListAsync(cancellationToken);
        
        await SendAsync(new GetInternshipProvidersResult {InternshipProviders = internshipProviders}, cancellation: cancellationToken);
    }
}