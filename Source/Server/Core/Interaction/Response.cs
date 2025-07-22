namespace InternshipManagementSystem.Core.Interaction;

public class Response
{
    private readonly List<ErrorDetail> _errors = [];

    public IEnumerable<ErrorDetail> Errors => _errors;
    public bool HasErrors => _errors.Count != 0;

    public Response AddError(string code, string message)
    {
        _errors.Add(new() { Code = code, Message = message });

        return this;
    }
}