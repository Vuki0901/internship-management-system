using FastEndpoints;
using Microsoft.EntityFrameworkCore;
using InternshipManagementSystem.Persistency;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.CompleteInternship;

public sealed class CompleteInternshipEndpoint : EndpointWithoutRequest<CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public CompleteInternshipEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("/students/internships/{internshipId}/complete");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        var internshipId = Route<Guid>("internshipId");
        var student = HttpContext.GetAuthenticatedStudent()!;

        var internship = await _databaseContext.Internships
            .Where(i => i.Id == internshipId && i.StudentId == student.Id)
            .FirstOrDefaultAsync(ct);

        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Can only complete if internship is accepted
        if (internship.Status != InternshipStatus.Accepted)
            ErrorSender.SendError(ErrorDefinitions.InternshipCannotBeCompleted);

        internship.Status = InternshipStatus.Completed;
        internship.EndDate = DateOnly.FromDateTime(DateTime.UtcNow);

        await _databaseContext.SaveChangesAsync(ct);

        await SendAsync(new CreateOrUpdateEntityResult(internship), cancellation: ct);
    }
} 