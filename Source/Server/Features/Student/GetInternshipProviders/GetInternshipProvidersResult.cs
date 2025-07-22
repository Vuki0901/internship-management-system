namespace InternshipManagementSystem.Features.Student.GetInternshipProviders;

public class GetInternshipProvidersResult
{
    public required IEnumerable<InternshipProviderInformation> InternshipProviders { get; set; }
    
    public sealed class InternshipProviderInformation
    {
        public Guid Id { get; set; }
        public string? Name { get; set; }
        public string? PersonalIdentificationNumber { get; set; }
        public string? Address { get; set; }
        public string? ContactEmailAddress { get; set; }
        public string? ContactPhoneNumber { get; set; }
    }
}