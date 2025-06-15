namespace InternshipManagementSystem.Features.Administration.GetDashboardStatistics;

public class GetDashboardStatisticsResult
{
    // User Statistics
    public int TotalUsers { get; set; }
    public int TotalStudents { get; set; }
    public int TotalMentors { get; set; }
    public int TotalSupervisors { get; set; }
    public int TotalAdministrators { get; set; }

    // Internship Provider Statistics
    public int TotalInternshipProviders { get; set; }
    public int ActiveInternshipProviders { get; set; }

    // Internship Statistics
    public int TotalInternships { get; set; }
    public int PendingInternships { get; set; }
    public int AcceptedInternships { get; set; }
    public int RejectedInternships { get; set; }
    public int CompletedInternships { get; set; }
    public int InProgressInternships { get; set; }

    // Report Statistics
    public int TotalReports { get; set; }
    public int PendingReports { get; set; }
    public int GradedReports { get; set; }
    public int ConfirmedReports { get; set; }

    // Recent Activity
    public List<RecentActivityInfo> RecentActivities { get; set; } = new();

    public class RecentActivityInfo
    {
        public string Id { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // "User", "Internship", "Provider", "Report"
        public string Description { get; set; } = string.Empty;
        public string UserName { get; set; } = string.Empty;
        public DateTime CreatedOn { get; set; }
    }
} 