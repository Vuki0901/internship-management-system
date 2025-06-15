using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Documents.CreateDocument;

public class CreateDocumentRequest
{
    public string FileName { get; set; } = string.Empty;
    public string ContentBase64 { get; set; } = string.Empty;
    public string MimeType { get; set; } = string.Empty;
}

public class CreateDocumentRequestValidator : Validator<CreateDocumentRequest>
{
    private static readonly string[] AllowedMimeTypes = {
        "application/pdf", // PDF
        "application/msword", // DOC
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // DOCX
        "application/vnd.ms-powerpoint", // PPT
        "application/vnd.openxmlformats-officedocument.presentationml.presentation", // PPTX
        "application/vnd.ms-excel", // XLS
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // XLSX
        "text/plain", // TXT
        "application/rtf", // RTF
        "application/vnd.oasis.opendocument.text", // ODT
        "application/vnd.oasis.opendocument.presentation", // ODP
        "application/vnd.oasis.opendocument.spreadsheet" // ODS
    };

    private const long MaxFileSizeBytes = 20 * 1024 * 1024; // 20MB

    public CreateDocumentRequestValidator()
    {
        RuleFor(x => x.FileName)
            .NotEmpty()
            .WithError(ErrorDefinitions.DocumentFileNameIsRequired);

        RuleFor(x => x.ContentBase64)
            .NotEmpty()
            .WithError(ErrorDefinitions.DocumentContentIsRequired)
            .Must(BeValidBase64)
            .WithError(ErrorDefinitions.DocumentInvalidBase64Content)
            .Must(NotExceedMaxFileSize)
            .WithError(ErrorDefinitions.DocumentFileSizeExceeded);

        RuleFor(x => x.MimeType)
            .NotEmpty()
            .Must(BeAllowedFileType)
            .WithError(ErrorDefinitions.DocumentInvalidFileType);
    }

    private static bool BeValidBase64(string base64Content)
    {
        if (string.IsNullOrEmpty(base64Content))
            return false;

        try
        {
            Convert.FromBase64String(base64Content);
            return true;
        }
        catch
        {
            return false;
        }
    }

    private static bool NotExceedMaxFileSize(string base64Content)
    {
        if (string.IsNullOrEmpty(base64Content))
            return true; // Will be caught by NotEmpty validation

        try
        {
            var bytes = Convert.FromBase64String(base64Content);
            return bytes.Length <= MaxFileSizeBytes;
        }
        catch
        {
            return false;
        }
    }

    private static bool BeAllowedFileType(string mimeType)
    {
        return AllowedMimeTypes.Contains(mimeType);
    }
} 