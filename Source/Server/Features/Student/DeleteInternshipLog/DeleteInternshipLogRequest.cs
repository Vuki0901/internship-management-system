using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Student.DeleteInternshipLog;

public sealed class DeleteInternshipLogRequest
{
    public Guid Id { get; set; }

    internal sealed class Validator : Validator<DeleteInternshipLogRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.InternshipLogIdIsRequired);
        }
    }
} 