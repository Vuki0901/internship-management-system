using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Features.Administration.GetInternshipProviders;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.GetInternshipProviderById;

public class GetInternshipProviderByIdEndpoint : Endpoint<GetInternshipProviderByIdRequest, Response<InternshipProviderDto?>>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipProviderByIdEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("administration/internship-providers/{id}");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(GetInternshipProviderByIdRequest request, CancellationToken cancellationToken)
    {
        var provider = await _databaseContext.InternshipProviders
            .Where(p => p.Id == request.Id)
            .Select(p => new InternshipProviderDto
            {
                Id = p.Id,
                Name = p.Name,
                PersonalIdentificationNumber = p.PersonalIdentificationNumber,
                Address = p.Address,
                ContactEmailAddress = p.ContactEmailAddress,
                ContactPhoneNumber = p.ContactPhoneNumber
            })
            .FirstOrDefaultAsync(cancellationToken);

        if (provider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderNotFound);

        await SendAsync(new Response<InternshipProviderDto?>(provider), cancellation: cancellationToken);
    }
} 