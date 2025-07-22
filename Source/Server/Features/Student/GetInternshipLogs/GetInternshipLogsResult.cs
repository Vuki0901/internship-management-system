using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.Student.GetInternshipLogs;

public sealed class GetInternshipLogsResult
{
    public required IEnumerable<InternshipLogInformation> InternshipLogs { get; set; }

    public sealed class InternshipLogInformation
    {
        public required Guid Id { get; set; }
        public required DateTimeOffset Date { get; set; }
        public required double NumberOfWorkingHours { get; set; }
        public required WorkLocation Location { get; set; }
        public required string Description { get; set; }
        public required string Feedback { get; set; }
        public required InternshipLogStatus Status { get; set; }
    }
}