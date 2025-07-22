using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternshipReport;

public class GetInternshipReportResult
{
    public required Guid Id { get; set; }
    public required Guid InternshipId { get; set; }
    public required int TotalHoursWorked { get; set; }
    public required int TotalLogEntries { get; set; }
    public string? MentorContent { get; set; }
    public int? Grade { get; set; }
    public required bool IsConfirmedByMentor { get; set; }
    public DateTime? ConfirmedAt { get; set; }
    public required DateTime CreatedOn { get; set; }
    public required InternshipInfo Internship { get; set; }
    
    public class InternshipInfo
    {
        public required Guid Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public required InternshipStatus Status { get; set; }
        public required StudyLevel StudyLevel { get; set; }
        public StudentInfo? Student { get; set; }
        public MentorInfo? Mentor { get; set; }
        public InternshipProviderInfo? InternshipProvider { get; set; }
    }
    
    public class StudentInfo
    {
        public required Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public required string EmailAddress { get; set; }
        public string? FullName { get; set; }
    }
    
    public class MentorInfo
    {
        public required Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public required string EmailAddress { get; set; }
        public string? FullName { get; set; }
    }
    
    public class InternshipProviderInfo
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Address { get; set; }
        public required string ContactEmailAddress { get; set; }
        public required string ContactPhoneNumber { get; set; }
    }
} 