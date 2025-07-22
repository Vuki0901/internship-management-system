namespace InternshipManagementSystem.Features.Mentor.DownloadInternshipReportPdf;

public sealed class DownloadInternshipReportPdfResult
{
    public string FileName { get; set; } = string.Empty;
    public string ContentBase64 { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
    public int FileSize { get; set; }
} 