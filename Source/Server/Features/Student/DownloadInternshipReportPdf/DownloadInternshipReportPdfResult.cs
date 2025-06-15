namespace InternshipManagementSystem.Features.Student.DownloadInternshipReportPdf;

public class DownloadInternshipReportPdfResult
{
    public required string FileName { get; set; }
    public required string ContentBase64 { get; set; }
    public required string MimeType { get; set; }
    public required long FileSize { get; set; }
} 