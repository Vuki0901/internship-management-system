using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.UpdateInternshipLog;

public sealed class UpdateInternshipLogEndpoint : Endpoint<UpdateInternshipLogRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public UpdateInternshipLogEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Put("students/internship-logs/{id}");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(UpdateInternshipLogRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;
        
        var internshipLog = await _databaseContext.InternshipLogs
            .Include(log => log.Student)
            .Include(log => log.Internship)
            .FirstOrDefaultAsync(log => log.Id == request.Id, cancellationToken);

        if (internshipLog == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogNotFound);

        // Ensure the student can only update their own logs
        if (internshipLog.Student?.Id != student.Id)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogAccessDenied);

        // Prevent updating completed logs
        if (internshipLog.Status == InternshipLogStatus.Complete)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogAlreadyCompleted);

        internshipLog.Date = request.Date;
        internshipLog.NumberOfWorkingHours = request.NumberOfWorkingHours;
        internshipLog.Location = request.Location;
        internshipLog.Description = request.Description;
        internshipLog.Feedback = request.Feedback;
        internshipLog.Status = request.Status;

        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(internshipLog), cancellation: cancellationToken);
    }
} 