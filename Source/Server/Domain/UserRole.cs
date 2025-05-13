namespace InternshipManagementSystem.Domain;

public abstract class UserRole : Entity
{
    public bool Active { get; set; }
    public string RoleType { get; init; } = null!;
}