using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Documents.GetDocument;

public class GetDocumentEndpoint : Endpoint<GetDocumentRequest, Response<DocumentWithContentDto>>
{
    private readonly DatabaseContext _databaseContext;

    public GetDocumentEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("documents/{id}");
        // All authenticated users can download documents
        Roles(nameof(Administrator), nameof(InternshipSupervisor), nameof(Student), nameof(Mentor));
    }

    public override async Task HandleAsync(GetDocumentRequest request, CancellationToken cancellationToken)
    {
        var document = await _databaseContext.Documents
            .Include(d => d.UploadedByUser)
            .FirstOrDefaultAsync(d => d.Id == request.Id, cancellationToken);

        if (document == null)
            ErrorSender.SendError(ErrorDefinitions.DocumentNotFound);

        var documentDto = new DocumentWithContentDto
        {
            Id = document.Id,
            FileName = document.FileName,
            ContentBase64 = document.ContentBase64,
            UploadedByName = document.UploadedByUser.FullName ?? $"{document.UploadedByUser.FirstName} {document.UploadedByUser.LastName}",
            UploadedAt = document.UploadedAt,
            FileSize = document.FileSize,
            MimeType = document.MimeType
        };

        await SendAsync(new Response<DocumentWithContentDto>(documentDto), cancellation: cancellationToken);
    }
} 