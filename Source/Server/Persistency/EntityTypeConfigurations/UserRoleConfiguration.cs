using InternshipManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipManagementSystem.Persistency.EntityTypeConfigurations;

public sealed class UserRoleConfiguration : IEntityTypeConfiguration<UserRole>
{
    public void Configure(EntityTypeBuilder<UserRole> builder)
    {
        builder.HasDiscriminator(ur => ur.RoleType)
            .HasValue<Mentor>(nameof(Mentor))
            .HasValue<Administrator>(nameof(Administrator));
        
        builder.HasIndex("RoleType", "UserId").IsUnique();
    }
}