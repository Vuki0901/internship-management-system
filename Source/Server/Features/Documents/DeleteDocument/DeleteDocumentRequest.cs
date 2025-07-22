using FastEndpoints;
using FluentValidation;
using InternshipManagementSystem.Core.Errors;

namespace InternshipManagementSystem.Features.Documents.DeleteDocument;

public class DeleteDocumentRequest
{
    public Guid Id { get; set; }
}

public class DeleteDocumentRequestValidator : Validator<DeleteDocumentRequest>
{
    public DeleteDocumentRequestValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty()
            .WithError(ErrorDefinitions.DocumentIdIsRequired);
    }
} 