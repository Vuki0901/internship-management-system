using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Core.Interaction;

public sealed class CreateOrUpdateEntityResult
{
    public CreateOrUpdateEntityResult(Guid id) => Id = id;

    public CreateOrUpdateEntityResult(Entity entity) => Id = entity.Id;

    public Guid Id { get; set; }
}