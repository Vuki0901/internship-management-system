using InternshipManagementSystem.Domain;
using InternshipManagementSystem.Persistency.EntityTypeConfigurations;
using Microsoft.EntityFrameworkCore;

namespace InternshipManagementSystem.Persistency;

public class DatabaseContext : DbContext
{
    public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) {}
    
    public DbSet<User> Users { get; init; } = null!;
    public DbSet<UserRole> UserRoles { get; init; } = null!;
    public DbSet<Administrator> Administrators { get; set; } = null!;
    public DbSet<Mentor> Mentors { get; set; } = null!;
    public DbSet<InternshipProvider> InternshipProviders { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);
    }
}