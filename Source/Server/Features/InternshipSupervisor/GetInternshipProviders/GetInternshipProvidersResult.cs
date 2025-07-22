namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternshipProviders;

public class GetInternshipProvidersResult
{
    public required List<InternshipProviderInfo> InternshipProviders { get; set; }
    
    public class InternshipProviderInfo
    {
        public required Guid Id { get; set; }
        public required string Name { get; set; }
        public required string Address { get; set; }
        public required string ContactEmailAddress { get; set; }
        public required string ContactPhoneNumber { get; set; }
        public required DateTime CreatedOn { get; set; }
    }
} 