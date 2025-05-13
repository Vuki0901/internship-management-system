namespace InternshipManagementSystem.Core.Interaction;

public sealed class Response<T> : Response
{
    public Response(T result) => Result = result;

    public Response(IEnumerable<ErrorDetail> errors)
    {
        foreach (var error in errors)
            AddError(error.Code, error.Message);
    }

    public Response() => Result = default;

    public T? Result { get; }
}