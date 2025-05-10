namespace InternshipManagementSystem.Domain;

public class InternshipProvider : Entity
{
    public string? Name { get; set; }
    public string? PersonalIdentificationNumber { get; set; }
    public string? Address { get; set; }
    public string? ContactEmailAddress { get; set; }
    public string? ContactPhoneNumber { get; set; }
}