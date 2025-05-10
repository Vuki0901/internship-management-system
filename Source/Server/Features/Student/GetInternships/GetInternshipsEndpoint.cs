using FastEndpoints;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternships;

public class GetInternshipsEndpoint : EndpointWithoutRequest<GetInternshipsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipsEndpoint(DatabaseContext databaseDatabaseContext) => _databaseContext = databaseDatabaseContext;

    public override void Configure()
    {
        Get("/students/internships");
        Roles(nameof(Student), nameof(Administrator));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var internships = await _databaseContext.Internships.OrderBy(i => i.CreatedOn)
            .Select(i => new GetInternshipsResult.InternshipInformation()
            {
                Id = i.Id,
                StartDate = i.StartDate,
                EndDate = i.EndDate,
                Status = i.Status,
                StudyLevel = i.StudyLevel,
            }).ToListAsync(cancellationToken);
        
        await SendAsync(new() {Internships = internships}, cancellation: cancellationToken);
    }
}