using FastEndpoints;
using FluentValidation;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GradeInternshipReport;

public class GradeInternshipReportRequest
{
    public required Guid InternshipId { get; set; }
    public required int Grade { get; set; }
    
    internal sealed class Validator : Validator<GradeInternshipReportRequest>
    {
        public Validator()
        {
            RuleFor(r => r.InternshipId)
                .NotEmpty()
                .WithMessage("InternshipId is required");
            
            RuleFor(r => r.Grade)
                .InclusiveBetween(1, 5)
                .WithMessage("Grade must be between 1 and 5");
        }
    }
} 