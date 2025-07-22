namespace InternshipManagementSystem.Features.Administration.SetInternshipSupervisorRole;

public class SetInternshipSupervisorRoleRequest
{
    public Guid UserId { get; set; }
    public string AcademicDegreeAbbreviation { get; set; } = string.Empty;
}