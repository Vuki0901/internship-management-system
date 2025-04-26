namespace InternshipManagementSystem.Domain;

public abstract class Entity
{
    public Guid Id { get; private set; } = Guid.NewGuid();
    public DateTimeOffset CreatedOn { get; private set; } = DateTimeOffset.Now;
}