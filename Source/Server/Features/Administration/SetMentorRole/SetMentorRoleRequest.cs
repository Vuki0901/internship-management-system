using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Administration.SetMentorRole;

public sealed class SetMentorRoleRequest
{
    public Guid UserId { get; set; }
    public Guid InternshipProviderId { get; set; }

    internal class Validator : AbstractValidator<SetMentorRoleRequest>
    {
        public Validator()
        {
            RuleFor(x => x.UserId).NotEmpty().WithError(ErrorDefinitions.UserIdIsRequired);
            RuleFor(x => x.InternshipProviderId).NotEmpty().WithError(ErrorDefinitions.InternshipProviderIdIdIsRequired);
        }
    }
}