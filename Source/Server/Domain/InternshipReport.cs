using System.Text.Json.Serialization;

namespace InternshipManagementSystem.Domain;

public sealed class InternshipReport : Entity
{
    public Guid InternshipId { get; set; }
    public double TotalHoursWorked { get; set; }
    public int TotalLogEntries { get; set; }
    public string MentorContent { get; set; } = string.Empty;
    public int? Grade { get; set; } // 1-5 scale, nullable until graded
    public bool IsConfirmedByMentor { get; set; }
    public DateTimeOffset? ConfirmedAt { get; set; }
    
    [JsonIgnore]
    public Internship? Internship { get; set; }
} 