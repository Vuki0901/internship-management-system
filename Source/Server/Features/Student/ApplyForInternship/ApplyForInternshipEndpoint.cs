using FastEndpoints;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using Microsoft.AspNetCore.Http;

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
        var student = HttpContext.GetAuthenticatedStudent()!;

        if (await _databaseContext.Internships.AnyAsync(i => i.StudyLevel == request.StudyLevel && i.StudentId == student.Id, cancellationToken: cancellationToken))
            ErrorSender.SendError(ErrorDefinitions.InternshipWithSameStudyLevelAlreadyExists);
        
        var internshipProvider = await _databaseContext.InternshipProviders.FirstOrDefaultAsync(ip => ip.Id == request.InternshipProviderId, cancellationToken);
        if (internshipProvider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipProviderNotFound);
        
        var internship = new Internship()
        {
            StartDate = request.DesiredStartDate,
            Status = InternshipStatus.Pending,
            StudyLevel = request.StudyLevel,
            InternshipProvider = internshipProvider,
            StudentId = student.Id
        };
        
        await _databaseContext.Internships.AddAsync(internship, cancellationToken);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(internship), cancellation: cancellationToken);
    }
}