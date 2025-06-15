using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternships;

public class GetInternshipsEndpoint : Endpoint<GetInternshipsRequest, GetInternshipsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetInternshipsEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Get("/internship-supervisors/internships");
        Roles(nameof(Domain.InternshipSupervisor));
    }

    public override async Task HandleAsync(GetInternshipsRequest request, CancellationToken cancellationToken)
    {
        var supervisor = HttpContext.GetAuthenticatedInternshipSupervisor();
        
        var query = _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .AsQueryable();
        
        // Filter by status if provided
        if (request.Status.HasValue)
        {
            query = query.Where(i => i.Status == request.Status.Value);
        }
        
        // Filter by internship provider if provided
        if (request.InternshipProviderId.HasValue)
        {
            query = query.Where(i => i.InternshipProvider != null && i.InternshipProvider.Id == request.InternshipProviderId.Value);
        }
        
        // Search functionality
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            var searchTerm = request.SearchTerm.ToLower();
            query = query.Where(i => 
                (i.InternshipProvider != null && i.InternshipProvider.Name.ToLower().Contains(searchTerm)) ||
                (i.InternshipProvider != null && i.InternshipProvider.Address.ToLower().Contains(searchTerm)));
        }
        
        // Get total count for pagination
        var totalCount = await query.CountAsync(cancellationToken);
        
        // Apply pagination
        var internships = await query
            .OrderBy(i => i.CreatedOn)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);
        
        // Get student information for internships
        var studentRoleIds = internships.Where(i => i.StudentId.HasValue).Select(i => i.StudentId!.Value).ToList();
        var usersWithStudentRoles = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r is Domain.Student && studentRoleIds.Contains(r.Id)))
            .ToListAsync(cancellationToken);
        
        var studentRoleIdToUser = new Dictionary<Guid, User>();
        foreach (var user in usersWithStudentRoles)
        {
            var studentRole = user.Roles.OfType<Domain.Student>().FirstOrDefault(s => studentRoleIds.Contains(s.Id));
            if (studentRole != null)
            {
                studentRoleIdToUser[studentRole.Id] = user;
            }
        }
        
        // Get mentor information for internships
        var mentorRoleIds = internships.Where(i => i.MentorId.HasValue).Select(i => i.MentorId!.Value).ToList();
        var usersWithMentorRoles = await _databaseContext.Users
            .Include(u => u.Roles)
            .Where(u => u.Roles.Any(r => r is Domain.Mentor && mentorRoleIds.Contains(r.Id)))
            .ToListAsync(cancellationToken);
        
        var mentorRoleIdToUser = new Dictionary<Guid, User>();
        foreach (var user in usersWithMentorRoles)
        {
            var mentorRole = user.Roles.OfType<Domain.Mentor>().FirstOrDefault(m => mentorRoleIds.Contains(m.Id));
            if (mentorRole != null)
            {
                mentorRoleIdToUser[mentorRole.Id] = user;
            }
        }
        
        var result = internships.Select(internship => new GetInternshipsResult.InternshipInformation
        {
            Id = internship.Id,
            StartDate = internship.StartDate?.ToDateTime(TimeOnly.MinValue),
            EndDate = internship.EndDate?.ToDateTime(TimeOnly.MinValue),
            Status = internship.Status,
            StudyLevel = internship.StudyLevel,
            CreatedOn = internship.CreatedOn.DateTime,
            StudentId = internship.StudentId,
            Student = internship.StudentId.HasValue && studentRoleIdToUser.TryGetValue(internship.StudentId.Value, out var studentUser)
                ? new GetInternshipsResult.StudentInfo
                {
                    Id = studentUser.Id,
                    FirstName = studentUser.FirstName ?? "",
                    LastName = studentUser.LastName ?? "",
                    EmailAddress = studentUser.EmailAddress,
                    FullName = studentUser.FullName ?? ""
                }
                : null,
            MentorId = internship.MentorId,
            Mentor = internship.MentorId.HasValue && mentorRoleIdToUser.TryGetValue(internship.MentorId.Value, out var mentorUser)
                ? new GetInternshipsResult.MentorInfo
                {
                    Id = mentorUser.Id,
                    FirstName = mentorUser.FirstName ?? "",
                    LastName = mentorUser.LastName ?? "",
                    EmailAddress = mentorUser.EmailAddress,
                    FullName = mentorUser.FullName ?? ""
                }
                : null,
            InternshipProvider = internship.InternshipProvider != null ? new GetInternshipsResult.InternshipProviderInfo
            {
                Id = internship.InternshipProvider.Id,
                Name = internship.InternshipProvider.Name ?? "",
                Address = internship.InternshipProvider.Address ?? "",
                ContactEmailAddress = internship.InternshipProvider.ContactEmailAddress ?? "",
                ContactPhoneNumber = internship.InternshipProvider.ContactPhoneNumber ?? ""
            } : null
        }).ToList();
        
        await SendAsync(new GetInternshipsResult 
        { 
            Internships = result,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize,
            TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
        }, cancellation: cancellationToken);
    }
} 