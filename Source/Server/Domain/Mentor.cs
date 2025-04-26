namespace InternshipManagementSystem.Domain;

public class Mentor : UserRole
{
    public InternshipProvider? InternshipProvider { get; set; }
}