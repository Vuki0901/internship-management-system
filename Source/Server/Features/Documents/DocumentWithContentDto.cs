namespace InternshipManagementSystem.Features.Documents;

public class DocumentWithContentDto
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string ContentBase64 { get; set; } = string.Empty;
    public string UploadedByName { get; set; } = string.Empty;
    public DateTime UploadedAt { get; set; }
    public long FileSize { get; set; }
    public string MimeType { get; set; } = string.Empty;
} 