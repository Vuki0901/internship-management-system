using System.Text.Json.Serialization;

namespace InternshipManagementSystem.Domain;

public sealed class InternshipLog : Entity 
{
    public DateTimeOffset Date { get; set; }
    public double NumberOfWorkingHours { get; set; }
    public WorkLocation Location { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Feedback { get; set; } = string.Empty;
    public InternshipLogStatus Status { get; set; }

    [JsonIgnore]
    public Student? Student { get; set; }
    [JsonIgnore]
    public Internship? Internship { get; set; }
}