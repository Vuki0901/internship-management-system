using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Documents.DeleteDocument;

public class DeleteDocumentEndpoint : Endpoint<DeleteDocumentRequest, Response>
{
    private readonly DatabaseContext _databaseContext;

    public DeleteDocumentEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Delete("documents/{id}");
        // Only administrators and internship supervisors can delete documents
        Roles(nameof(Administrator), nameof(InternshipSupervisor));
    }

    public override async Task HandleAsync(DeleteDocumentRequest request, CancellationToken cancellationToken)
    {
        var document = await _databaseContext.Documents
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (document == null)
            ErrorSender.SendError(ErrorDefinitions.DocumentNotFound);

        _databaseContext.Documents.Remove(document);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response(), cancellation: cancellationToken);
    }
} 