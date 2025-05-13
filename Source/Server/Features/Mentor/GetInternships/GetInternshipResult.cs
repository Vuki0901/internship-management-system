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
    }
}