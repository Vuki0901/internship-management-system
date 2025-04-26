namespace InternshipManagementSystem.Domain;

public abstract class UserRole : Entity
{
    public bool Active { get; set; }
    public required string RoleType { get; init; }
}