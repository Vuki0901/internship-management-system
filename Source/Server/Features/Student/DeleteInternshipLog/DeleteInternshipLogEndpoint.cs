using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.DeleteInternshipLog;

public sealed class DeleteInternshipLogEndpoint : Endpoint<DeleteInternshipLogRequest>
{
    private readonly DatabaseContext _databaseContext;

    public DeleteInternshipLogEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Delete("students/internship-logs/{id}");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(DeleteInternshipLogRequest request, CancellationToken cancellationToken)
    {
        var student = HttpContext.GetAuthenticatedStudent()!;
        
        var internshipLog = await _databaseContext.InternshipLogs
            .Include(log => log.Student)
            .FirstOrDefaultAsync(log => log.Id == request.Id, cancellationToken);

        if (internshipLog == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogNotFound);

        // Ensure the student can only delete their own logs
        if (internshipLog.Student?.Id != student.Id)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogAccessDenied);

        // Prevent deleting completed logs
        if (internshipLog.Status == InternshipLogStatus.Complete)
            ErrorSender.SendError(ErrorDefinitions.InternshipLogAlreadyCompleted);

        _databaseContext.InternshipLogs.Remove(internshipLog);
        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendOkAsync(cancellationToken);
    }
} 