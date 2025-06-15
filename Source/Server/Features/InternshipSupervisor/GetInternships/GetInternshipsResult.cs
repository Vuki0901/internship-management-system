using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternships;

public class GetInternshipsResult
{
    public required List<InternshipInformation> Internships { get; set; }
    public required int TotalCount { get; set; }
    public required int Page { get; set; }
    public required int PageSize { get; set; }
    public required int TotalPages { get; set; }
    
    public class InternshipInformation
    {
        public required Guid Id { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public required InternshipStatus Status { get; set; }
        public required StudyLevel StudyLevel { get; set; }
        public required DateTime CreatedOn { get; set; }
        public Guid? StudentId { get; set; }
        public StudentInfo? Student { get; set; }
        public Guid? MentorId { get; set; }
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