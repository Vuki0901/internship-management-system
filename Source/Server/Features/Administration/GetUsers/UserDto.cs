namespace InternshipManagementSystem.Features.Administration.GetUsers;

public class UserDto
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string EmailAddress { get; set; } = string.Empty;
    public string? PersonalIdentificationNumber { get; set; }
    public string? FullName { get; set; }
    public DateTimeOffset CreatedOn { get; set; }
    public List<UserRoleDto> Roles { get; set; } = new();
}

public class UserRoleDto
{
    public string RoleType { get; set; } = string.Empty;
    public bool Active { get; set; }
    public string? AcademicDegreeAbbreviation { get; set; } // For InternshipSupervisor
    public string? InternshipProviderName { get; set; } // For Mentor
} 