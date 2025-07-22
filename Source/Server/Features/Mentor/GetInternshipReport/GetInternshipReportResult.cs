namespace InternshipManagementSystem.Features.Mentor.GetInternshipReport;

public sealed class GetInternshipReportResult
{
    public required Guid Id { get; set; }
    public required Guid InternshipId { get; set; }
    public required double TotalHoursWorked { get; set; }
    public required int TotalLogEntries { get; set; }
    public required string MentorContent { get; set; }
    public int? Grade { get; set; }
    public required bool IsConfirmedByMentor { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    public required DateTimeOffset CreatedOn { get; set; }
} 