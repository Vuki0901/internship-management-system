using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;

namespace InternshipManagementSystem.Features.Documents.CreateDocument;

public class CreateDocumentEndpoint : Endpoint<CreateDocumentRequest, Response<CreateOrUpdateEntityResult>>
{
    private readonly DatabaseContext _databaseContext;

    public CreateDocumentEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("documents");
        // Only administrators and internship supervisors can upload documents
        Roles(nameof(Administrator), nameof(InternshipSupervisor));
    }

    public override async Task HandleAsync(CreateDocumentRequest request, CancellationToken cancellationToken)
    {
        var fileBytes = Convert.FromBase64String(request.ContentBase64);

        var document = new Document
        {
            FileName = request.FileName,
            ContentBase64 = request.ContentBase64,
            UploadedBy = HttpContext.GetAuthenticatedUser()!.Id,
            UploadedAt = DateTime.UtcNow,
            FileSize = fileBytes.Length,
            MimeType = request.MimeType
        };

        _databaseContext.Documents.Add(document);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new Response<CreateOrUpdateEntityResult>(new CreateOrUpdateEntityResult(document.Id)), cancellation: cancellationToken);
    }
} 