using FastEndpoints;
using InternshipManagementSystem.Core.Extensions;
using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Features.Administration.GetDashboardStatistics;

public class GetDashboardStatisticsEndpoint : EndpointWithoutRequest<GetDashboardStatisticsResult>
{
    private readonly DatabaseContext _databaseContext;

    public GetDashboardStatisticsEndpoint(DatabaseContext databaseContext) => _databaseContext = databaseContext;

    public override void Configure()
    {
        Get("/administration/dashboard/statistics");
        Roles(nameof(Administrator));
    }

    public override async Task HandleAsync(CancellationToken cancellationToken)
    {
        var result = new GetDashboardStatisticsResult();

        // User Statistics - Query users with their roles
        var users = await _databaseContext.Users
            .Include(u => u.Roles)
            .ToListAsync(cancellationToken);
            
        result.TotalUsers = users.Count;
        result.TotalStudents = users.Count(u => u.Roles.Any(r => r is Domain.Student));
        result.TotalMentors = users.Count(u => u.Roles.Any(r => r is Domain.Mentor));
        result.TotalSupervisors = users.Count(u => u.Roles.Any(r => r is Domain.InternshipSupervisor));
        result.TotalAdministrators = users.Count(u => u.Roles.Any(r => r is Domain.Administrator));

        // Internship Provider Statistics
        var providers = await _databaseContext.InternshipProviders.ToListAsync(cancellationToken);
        result.TotalInternshipProviders = providers.Count;
        result.ActiveInternshipProviders = providers.Count; // All providers are considered active for now

        // Internship Statistics
        var internships = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .ToListAsync(cancellationToken);
        result.TotalInternships = internships.Count;
        result.PendingInternships = internships.Count(i => i.Status == InternshipStatus.Pending);
        result.AcceptedInternships = internships.Count(i => i.Status == InternshipStatus.Accepted);
        result.RejectedInternships = internships.Count(i => i.Status == InternshipStatus.Rejected);
        result.CompletedInternships = internships.Count(i => i.Status == InternshipStatus.Completed);
        result.InProgressInternships = internships.Count(i => i.Status == InternshipStatus.Accepted);

        // Report Statistics
        var reports = await _databaseContext.InternshipReports.ToListAsync(cancellationToken);
        result.TotalReports = reports.Count;
        result.PendingReports = reports.Count(r => !r.IsConfirmedByMentor);
        result.GradedReports = reports.Count(r => r.Grade.HasValue);
        result.ConfirmedReports = reports.Count(r => r.IsConfirmedByMentor);

        // Recent Activity (last 10 activities)
        var recentActivities = new List<GetDashboardStatisticsResult.RecentActivityInfo>();

        // Recent users (last 5)
        var recentUsers = await _databaseContext.Users
            .Include(u => u.Roles)
            .OrderByDescending(u => u.CreatedOn)
            .Take(5)
            .ToListAsync(cancellationToken);

        foreach (var user in recentUsers)
        {
            var userType = "User";
            if (user.Roles.Any(r => r is Domain.Student)) userType = "Student";
            else if (user.Roles.Any(r => r is Domain.Mentor)) userType = "Mentor";
            else if (user.Roles.Any(r => r is Domain.InternshipSupervisor)) userType = "Supervisor";
            else if (user.Roles.Any(r => r is Domain.Administrator)) userType = "Administrator";

            recentActivities.Add(new GetDashboardStatisticsResult.RecentActivityInfo
            {
                Id = user.Id.ToString(),
                Type = "User",
                Description = $"Novi {userType.ToLower()} registriran",
                UserName = user.FullName ?? $"{user.FirstName} {user.LastName}".Trim(),
                CreatedOn = user.CreatedOn.DateTime
            });
        }

        // Recent internships (last 5) - Get users for student names
        var recentInternships = await _databaseContext.Internships
            .Include(i => i.InternshipProvider)
            .OrderByDescending(i => i.CreatedOn)
            .Take(5)
            .ToListAsync(cancellationToken);

        // Get student information for recent internships
        var studentRoleIds = recentInternships.Where(i => i.StudentId.HasValue).Select(i => i.StudentId!.Value).ToList();
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

        foreach (var internship in recentInternships)
        {
            var statusText = internship.Status switch
            {
                InternshipStatus.Pending => "prijavljena",
                InternshipStatus.Accepted => "prihvaćena",
                InternshipStatus.Rejected => "odbijena",
                InternshipStatus.Completed => "završena",
                _ => "ažurirana"
            };

            var studentName = "Nepoznat student";
            if (internship.StudentId.HasValue && studentRoleIdToUser.TryGetValue(internship.StudentId.Value, out var studentUser))
            {
                studentName = studentUser.FullName ?? $"{studentUser.FirstName} {studentUser.LastName}".Trim();
            }

            recentActivities.Add(new GetDashboardStatisticsResult.RecentActivityInfo
            {
                Id = internship.Id.ToString(),
                Type = "Internship",
                Description = $"Praksa {statusText} - {internship.InternshipProvider?.Name ?? "Nepoznat ponuditelj"}",
                UserName = studentName,
                CreatedOn = internship.CreatedOn.DateTime
            });
        }

        // Recent providers (last 3)
        var recentProviders = await _databaseContext.InternshipProviders
            .OrderByDescending(p => p.CreatedOn)
            .Take(3)
            .ToListAsync(cancellationToken);

        foreach (var provider in recentProviders)
        {
            recentActivities.Add(new GetDashboardStatisticsResult.RecentActivityInfo
            {
                Id = provider.Id.ToString(),
                Type = "Provider",
                Description = $"Novi ponuditelj prakse registriran - {provider.Name}",
                UserName = "Sistem",
                CreatedOn = provider.CreatedOn.DateTime
            });
        }

        // Sort all activities by date and take the most recent 10
        result.RecentActivities = recentActivities
            .OrderByDescending(a => a.CreatedOn)
            .Take(10)
            .ToList();

        await SendOkAsync(result, cancellationToken);
    }
} 