namespace InternshipManagementSystem.Domain;

public abstract class Entity
{
    public Guid Id { get; private set; } = Guid.CreateVersion7();
    public DateTimeOffset CreatedOn { get; private set; } = DateTimeOffset.Now;
}