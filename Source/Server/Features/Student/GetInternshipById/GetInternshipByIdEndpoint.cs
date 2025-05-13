using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternshipById;

public class GetInternshipByIdEndpoint : Endpoint<GetInternshipByIdRequest, Response<Internship?>>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipByIdEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("students/internships/{InternshipId}");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(GetInternshipByIdRequest request, CancellationToken cancellationToken)
    {
        var internship = await _databaseContext.Internships.FirstOrDefaultAsync(i => i.Id == request.InternshipId, cancellationToken: cancellationToken);
        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);
        
        await SendAsync(new Response<Internship?>(internship), cancellation: cancellationToken);
    }
}