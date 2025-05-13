using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Features.Student.GetInternships;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Mentor.GetInternships;

public class GetInternshipsEndpoint : EndpointWithoutRequest<GetInternshipsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipsEndpoint(DatabaseContext databaseDatabaseContext) => _databaseContext = databaseDatabaseContext;

    public override void Configure()
    {
        Get("/mentors/internships");
        Roles(nameof(Mentor));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var mentor = HttpContext.GetAuthenticatedMentor();
        
        var internships = await _databaseContext.Internships.Where(i => i.MentorId == mentor!.Id).OrderBy(i => i.CreatedOn)
            .Select(i => new GetInternshipsResult.InternshipInformation()
            {
                Id = i.Id,
                StartDate = i.StartDate,
                EndDate = i.EndDate,
                Status = i.Status,
                StudyLevel = i.StudyLevel,
            }).ToListAsync(cancellationToken);
        
        await SendAsync(new GetInternshipsResult {Internships = internships}, cancellation: cancellationToken);
    }
}