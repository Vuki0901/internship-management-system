using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Domain;

namespace InternshipManagementSystem.Features.InternshipSupervisor.GetInternships;

public class GetInternshipsRequest
{
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = int.MaxValue;
    public InternshipStatus? Status { get; set; }
    public Guid? InternshipProviderId { get; set; }
    public string? SearchTerm { get; set; }
    
    internal sealed class Validator : Validator<GetInternshipsRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Page)
                .GreaterThan(0)
                .WithMessage("Page must be greater than 0");
            
            RuleFor(r => r.PageSize)
                .GreaterThan(0)
                .WithMessage("PageSize must be greater than 0");
        }
    }
} 