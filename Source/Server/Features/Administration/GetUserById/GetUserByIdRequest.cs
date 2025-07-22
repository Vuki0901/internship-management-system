using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.GetUserById;

public class GetUserByIdRequest
{
    public Guid Id { get; set; }

    internal sealed class Validator : Validator<GetUserByIdRequest>
    {
        public Validator()
        {
            RuleFor(r => r.Id)
                .NotEmpty().WithError(ErrorDefinitions.UserIdIsRequired);
        }
    }
} 