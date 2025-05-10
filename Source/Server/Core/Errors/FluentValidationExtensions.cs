using FluentValidation;

namespace InternshipManagementSystem.Core.Errors;

public static class FluentValidationExtensions
{
    public static IRuleBuilderOptions<T, TProperty> WithError<T, TProperty>(this IRuleBuilderOptions<T, TProperty> rule, Error error) =>
        rule.WithErrorCode(error.Value).WithMessage(error.GetErrorMessage());
}