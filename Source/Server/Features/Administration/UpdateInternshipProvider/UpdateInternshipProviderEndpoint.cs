using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.UpdateInternshipProvider;

public class UpdateInternshipProviderEndpoint : Endpoint<UpdateInternshipProviderRequest, Response<CreateOrUpdateEntityResult?>>
{
    private readonly DatabaseContext _databaseContext;

    public UpdateInternshipProviderEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("administration/internship-providers/{id}");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(UpdateInternshipProviderRequest request, CancellationToken cancellationToken)
    {
        var internshipProvider = await _databaseContext.InternshipProviders
            .FirstOrDefaultAsync(ip => ip.Id == request.Id, cancellationToken);

        if (internshipProvider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderNotFound);

        // Check if another provider with the same name or PIN exists
        if (await _databaseContext.InternshipProviders
            .AnyAsync(ip => ip.Id != request.Id && 
                           (ip.Name == request.Name || ip.PersonalIdentificationNumber == request.PersonalIdentificationNumber), 
                     cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderAlreadyExists);

        internshipProvider.Name = request.Name;
        internshipProvider.PersonalIdentificationNumber = request.PersonalIdentificationNumber;
        internshipProvider.Address = request.Address;
        internshipProvider.ContactEmailAddress = request.ContactEmailAddress;
        internshipProvider.ContactPhoneNumber = request.ContactPhoneNumber;

        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<CreateOrUpdateEntityResult?>(new CreateOrUpdateEntityResult(internshipProvider.Id)), cancellation: cancellationToken);
    }
} 