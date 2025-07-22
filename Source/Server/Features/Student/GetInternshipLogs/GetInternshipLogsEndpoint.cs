using Azure.Core;
using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Student.GetInternshipLogs;

public sealed class GetInternshipLogsEndpoint : EndpointWithoutRequest<GetInternshipLogsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipLogsEndpoint(DatabaseContext databaseContext)
    {
        _databaseContext = databaseContext;
    }

    public override void Configure()
    {
        Get("students/internship-logs");
        Roles(nameof(Student));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var currentlyActiveInternship = await _databaseContext.Internships.FirstOrDefaultAsync(_ => _.Status == InternshipStatus.Accepted && _.StudentId == HttpContext.GetAuthenticatedStudent()!.Id, cancellationToken);
        if (currentlyActiveInternship == null)
            ErrorSender.SendError(ErrorDefinitions.StudentHasNoActiveInternshipAtTheMoment);
        
        var internshipLogs = await _databaseContext.InternshipLogs
            .Where(_ => _.Internship!.Id == currentlyActiveInternship.Id)
            .Select(_ => new GetInternshipLogsResult.InternshipLogInformation
            {
                Id = _.Id,
                Status = _.Status,
                Date = _.Date,
                Description = _.Description,
                Feedback = _.Feedback,
                Location = _.Location,
                NumberOfWorkingHours = _.NumberOfWorkingHours
            }).ToListAsync(cancellationToken);
        
        await SendAsync(new GetInternshipLogsResult { InternshipLogs = internshipLogs }, cancellation: cancellationToken);
    }
}