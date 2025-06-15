using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Mentor.GetInternships;

public class GetInternshipResult
{
    public required IEnumerable<InternshipInformation> Internships { get; init; }

    public sealed class InternshipInformation
    {
        public Guid Id { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public InternshipStatus Status { get; set; }
        public StudyLevel StudyLevel { get; set; }
        public DateTimeOffset CreatedOn { get; set; }
        public Guid? StudentId { get; set; }
        public StudentInfo? Student { get; set; }
        public InternshipProviderInfo? InternshipProvider { get; set; }
    }
    
    public sealed class StudentInfo
    {
        public Guid Id { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? EmailAddress { get; set; }
        public string? FullName { get; set; }
    }

    public sealed class InternshipProviderInfo
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? Address { get; set; }
        public string? ContactEmailAddress { get; set; }
        public string? ContactPhoneNumber { get; set; }
    }
}