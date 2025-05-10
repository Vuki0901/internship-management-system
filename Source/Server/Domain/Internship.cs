namespace InternshipManagementSystem.Domain;

public sealed class Internship : Entity {
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public InternshipStatus Status { get; set; }
    public StudyLevel StudyLevel { get; set; }
}