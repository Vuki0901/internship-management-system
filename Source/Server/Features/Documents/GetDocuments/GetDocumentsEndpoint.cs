using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Documents.GetDocuments;

public class GetDocumentsEndpoint : EndpointWithoutRequest<Response<List<DocumentDto>>>
{
    private readonly DatabaseContext _databaseContext;

    public GetDocumentsEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("documents");
        // All authenticated users can view documents
        Roles(nameof(Administrator), nameof(InternshipSupervisor), nameof(Student), nameof(Mentor));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var documents = await _databaseContext.Documents
            .Include(d => d.UploadedByUser)
            .OrderByDescending(d => d.UploadedAt)
            .Select(d => new DocumentDto
            {
                Id = d.Id,
                FileName = d.FileName,
                UploadedByName = d.UploadedByUser.FullName ?? $"{d.UploadedByUser.FirstName} {d.UploadedByUser.LastName}",
                UploadedAt = d.UploadedAt,
                FileSize = d.FileSize,
                MimeType = d.MimeType
            })
            .ToListAsync(cancellationToken);

        await SendAsync(new Response<List<DocumentDto>>(documents), cancellation: cancellationToken);
    }
} 