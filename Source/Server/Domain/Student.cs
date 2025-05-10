namespace InternshipManagementSystem.Domain;

public class Student : UserRole
{
    private readonly IList<Internship> _internships = new List<Internship>();
    
    public IEnumerable<Internship> Internships => _internships;
}