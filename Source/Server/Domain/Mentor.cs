namespace InternshipManagementSystem.Domain;

public class Mentor : UserRole
{
    private readonly IList<Internship> _internships = new List<Internship>();
    
    public InternshipProvider? InternshipProvider { get; set; }
    public IEnumerable<Internship> Internships => _internships;
}