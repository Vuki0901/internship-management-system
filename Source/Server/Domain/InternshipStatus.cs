namespace InternshipManagementSystem.Domain;

public enum InternshipStatus
{
    Pending = 1,    // Application submitted, waiting for decision
    Accepted,       // Application approved
    Rejected,       // Application denied
    Completed       // Internship successfully completed
}