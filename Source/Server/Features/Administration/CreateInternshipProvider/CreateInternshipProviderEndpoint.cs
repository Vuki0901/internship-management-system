using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.CreateInternshipProvider;

public class CreateInternshipProviderEndpoint : Endpoint<CreateInternshipProviderRequest, Response<CreateOrUpdateEntityResult?>>
{
    private readonly DatabaseContext _databaseContext;

    public CreateInternshipProviderEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("administration/internship-providers");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(CreateInternshipProviderRequest request, CancellationToken cancellationToken)
    {
        if(await _databaseContext.InternshipProviders.AnyAsync(ip => ip.Name == request.Name || ip.PersonalIdentificationNumber == request.PersonalIdentificationNumber, cancellationToken: cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderAlreadyExists);

        var internshipProvider = new InternshipProvider()
        {
            Name = request.Name,
            PersonalIdentificationNumber = request.PersonalIdentificationNumber,
            Address = request.Address,
            ContactEmailAddress = request.ContactEmailAddress,
            ContactPhoneNumber = request.ContactPhoneNumber
        };
        
        await _databaseContext.InternshipProviders.AddAsync(internshipProvider, cancellationToken);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<CreateOrUpdateEntityResult?>(new CreateOrUpdateEntityResult(internshipProvider.Id)), cancellation: cancellationToken);
    }
}