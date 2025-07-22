using System.ComponentModel.DataAnnotations;

namespace InternshipManagementSystem.Domain;

public class Document : Entity
{
    [Required]
    [MaxLength(255)]
    public string FileName { get; set; } = string.Empty;

    [Required]
    public string ContentBase64 { get; set; } = string.Empty;

    [Required]
    public Guid UploadedBy { get; set; }

    [Required]
    public DateTime UploadedAt { get; set; }

    [Required]
    public long FileSize { get; set; }

    [Required]
    [MaxLength(100)]
    public string MimeType { get; set; } = string.Empty;

    // Navigation property
    public User UploadedByUser { get; set; } = null!;
} 