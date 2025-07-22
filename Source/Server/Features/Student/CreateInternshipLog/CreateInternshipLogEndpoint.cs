using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.CreateInternshipLog;

public sealed class CreateInternshipLogEndpoint : Endpoint<CreateInternshipLogRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public CreateInternshipLogEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Post("students/internship-logs");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(CreateInternshipLogRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;
        
        var currentlyActiveInternship = await _databaseContext.Internships
            .FirstOrDefaultAsync(_ => _.Status == InternshipStatus.Accepted && _.StudentId == student.Id, cancellationToken);
        
        if (currentlyActiveInternship == null)
            ErrorSender.SendError(ErrorDefinitions.StudentHasNoActiveInternshipAtTheMoment);

        var internshipLog = new InternshipLog
        {
            Date = request.Date,
            NumberOfWorkingHours = request.NumberOfWorkingHours,
            Location = request.Location,
            Description = request.Description,
            Feedback = request.Feedback,
            Status = InternshipLogStatus.InProgress,
            Student = student,
            Internship = currentlyActiveInternship
        };

        await _databaseContext.InternshipLogs.AddAsync(internshipLog, cancellationToken);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(internshipLog), cancellation: cancellationToken);
    }
} 