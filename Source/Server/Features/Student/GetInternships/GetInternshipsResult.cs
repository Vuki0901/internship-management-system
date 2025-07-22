using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Student.GetInternships;

public class GetInternshipsResult
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
        public InternshipProviderInfo? InternshipProvider { get; set; }
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