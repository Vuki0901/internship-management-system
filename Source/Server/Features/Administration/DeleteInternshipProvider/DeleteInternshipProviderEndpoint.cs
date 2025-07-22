using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.DeleteInternshipProvider;

public class DeleteInternshipProviderEndpoint : Endpoint<DeleteInternshipProviderRequest, Response>
{
    private readonly DatabaseContext _databaseContext;

    public DeleteInternshipProviderEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Delete("administration/internship-providers/{id}");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(DeleteInternshipProviderRequest request, CancellationToken cancellationToken)
    {
        var provider = await _databaseContext.InternshipProviders
            .FirstOrDefaultAsync(p => p.Id == request.Id, cancellationToken);

        if (provider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderNotFound);

        _databaseContext.InternshipProviders.Remove(provider);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response(), cancellation: cancellationToken);
    }
} 