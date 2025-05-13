using System.Security.Cryptography;
using System.Text;

namespace InternshipManagementSystem.Domain;

public class User : Entity
{
    private readonly List<UserRole> _roles = [];
    
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Password { get; private set; }
    public required string EmailAddress { get; set; }
    public string? PersonalIdentificationNumber { get; set; }
    public string? FullName => string.IsNullOrEmpty(FirstName) || string.IsNullOrEmpty(LastName) ? null : $"{FirstName} {LastName}";
    public IEnumerable<UserRole> Roles => _roles;
    
    public bool Is<T>() where T : UserRole => Roles.OfType<T>().Any();
    public T GetRole<T>() where T : UserRole => Is<T>() ? Roles.OfType<T>().Single() : throw new InvalidOperationException($"User does not have {typeof(T).Name} role.");

    public T? GetRoleOrNull<T>() where T : UserRole => Is<T>() ? GetRole<T>() : null;

    public void AddRole(UserRole newRole)
    {
        if (Roles.Any(role => role.GetType() == newRole.GetType()))
            throw new InvalidOperationException($"Role cannot be added since user already has {newRole.GetType().Name} role.");
        _roles.Add(newRole);
    }
    public void RemoveRole(Type roleType)
    {
        if (Roles.All(role => role.GetType() != roleType))
            throw new InvalidOperationException($"{roleType.Name} role cannot be removed since user does not have it.");

        _roles.Remove(_roles.Single(role => role.GetType() == roleType));
    }
    
    public void RemoveRole<TRole>() where TRole : UserRole => RemoveRole(typeof(TRole));
    public void SetPassword(string password) => Password = HashPassword(password);
    public bool IsCorrectPassword(string password) => HashPassword(password) == Password;
    private static string HashPassword(string password) => BitConverter.ToString(SHA512.HashData(Encoding.UTF8.GetBytes(password))).Replace("-", string.Empty);
}