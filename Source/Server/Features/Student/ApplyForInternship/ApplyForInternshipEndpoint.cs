using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.ApplyForInternship;

public class ApplyForInternshipEndpoint : Endpoint<ApplyForInternshipRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public ApplyForInternshipEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Post("students/apply-for-internship");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(ApplyForInternshipRequest request, CancellationToken cancellationToken)
    {
        if (await _databaseContext.Internships.AnyAsync(i => i.StudyLevel == request.StudyLevel, cancellationToken: cancellationToken))
            ErrorSender.SendError(Errors.InternshipWithSameStudyLevelAlreadyExists);
    }
}