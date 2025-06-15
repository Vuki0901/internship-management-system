using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternships;

public class GetInternshipsEndpoint : EndpointWithoutRequest<GetInternshipsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipsEndpoint(DatabaseContext databaseDatabaseContext) => _databaseContext = databaseDatabaseContext;

    public override void Configure()
    {
        Get("/students/internships");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent();
        
        var internships = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .Where(i => i.StudentId == student!.Id)
            .OrderBy(i => i.CreatedOn)
            .Select(i => new GetInternshipsResult.InternshipInformation()
            {
                Id = i.Id,
                StartDate = i.StartDate,
                EndDate = i.EndDate,
                Status = i.Status,
                StudyLevel = i.StudyLevel,
                CreatedOn = i.CreatedOn,
                InternshipProvider = i.InternshipProvider != null ? new GetInternshipsResult.InternshipProviderInfo
                {
                    Id = i.InternshipProvider.Id,
                    Name = i.InternshipProvider.Name,
                    Address = i.InternshipProvider.Address,
                    ContactEmailAddress = i.InternshipProvider.ContactEmailAddress,
                    ContactPhoneNumber = i.InternshipProvider.ContactPhoneNumber
                } : null
            }).ToListAsync(cancellationToken);
        
        await SendAsync(new GetInternshipsResult {Internships = internships}, cancellation: cancellationToken);
    }
}