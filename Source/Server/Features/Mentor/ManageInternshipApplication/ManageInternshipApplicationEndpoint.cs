using FastEndpoints;
using InternshipManagementSystem.Core.Errors;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Mentor.ManageInternshipApplication;

public class ManageInternshipApplicationEndpoint : Endpoint<ManageInternshipApplicationRequest, CreateOrUpdateEntityResult>
{
    private readonly DatabaseContext _databaseContext;

    public ManageInternshipApplicationEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Put("/mentors/internship-applications/{InternshipId}/manage");
        Roles(nameof(Mentor));
    }

    public override async Task HandleAsync(ManageInternshipApplicationRequest request, CancellationToken cancellationToken)
    {
        var mentorRole = HttpContext.GetAuthenticatedMentor()!;
        
        // Load the mentor with its InternshipProvider relationship
        var mentor = await _databaseContext.Set<Domain.Mentor>()
            .Include(m => m.InternshipProvider)
            .FirstOrDefaultAsync(m => m.Id == mentorRole.Id, cancellationToken);

        if (mentor?.InternshipProvider == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipDoesNotBelongToMentorCompany);

        var internship = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .FirstOrDefaultAsync(i => i.Id == request.InternshipId, cancellationToken);

        if (internship == null)
            ErrorSender.SendError(ErrorDefinitions.InternshipNotFound);

        // Verify that the internship belongs to the mentor's company
        if (internship.InternshipProvider?.Id != mentor.InternshipProvider.Id)
            ErrorSender.SendError(ErrorDefinitions.InternshipDoesNotBelongToMentorCompany);

        // Verify that the internship is still pending
        if (internship.Status != InternshipStatus.Pending)
            ErrorSender.SendError(ErrorDefinitions.InternshipApplicationNotPending);

        // Update the internship based on the decision
        if (request.Decision == ApplicationDecision.Accept)
        {
            internship.Status = InternshipStatus.Accepted;
            internship.MentorId = mentor.Id;
        }
        else if (request.Decision == ApplicationDecision.Reject)
        {
            internship.Status = InternshipStatus.Rejected;
            // MentorId remains null for rejected applications
        }

        await _databaseContext.SaveChangesAsync(cancellationToken);

        await SendAsync(new CreateOrUpdateEntityResult(internship), cancellation: cancellationToken);
    }
} 