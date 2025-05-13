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
    public DbSet<InternshipSupervisor> InternshipSupervisors { get; set; } = null!;
    public DbSet<Student> Students { get; set; } = null!;
    public DbSet<Internship> Internships { get; set; } = null!;
    public DbSet<InternshipProvider> InternshipProviders { get; set; } = null!;
    
    protected override void OnModelCreating(ModelBuilder modelBuilder) => modelBuilder.ApplyConfigurationsFromAssembly(typeof(UserConfiguration).Assembly);
    
    protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder) => configurationBuilder.Properties<string>().HaveMaxLength(4000);
}