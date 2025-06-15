using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Documents.GetDocument;

public class GetDocumentRequest
{
    public Guid Id { get; set; }
}

public class GetDocumentRequestValidator : Validator<GetDocumentRequest>
{
    public GetDocumentRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithError(ErrorDefinitions.DocumentIdIsRequired);
    }
} 