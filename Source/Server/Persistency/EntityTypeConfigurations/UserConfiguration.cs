using InternshipManagementSystem.Domain;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InternshipManagementSystem.Persistency.EntityTypeConfigurations;

public sealed class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasIndex(u => u.EmailAddress).IsUnique();
        builder.HasMany<UserRole>(u => u.Roles).WithOne();
        
        builder.Property(u => u.EmailAddress).IsRequired().HasMaxLength(256);
        builder.Property(u => u.Password).IsRequired().HasMaxLength(256);
        builder.Property(u => u.FirstName).IsRequired().HasMaxLength(50);
        builder.Property(u => u.LastName).IsRequired().HasMaxLength(50);
    }
}