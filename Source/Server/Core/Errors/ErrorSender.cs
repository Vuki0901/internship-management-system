using System.Diagnostics.CodeAnalysis;
using FastEndpoints;
#pragma warning disable CS8763 // A method marked [DoesNotReturn] should not return.

namespace InternshipManagementSystem.Core.Errors;

public static class ErrorSender
{
    [DoesNotReturn]
    public static void SendError(Error error, int? status = null)
    {
        var valCtx = ValidationContext.Instance;
        valCtx.AddError(error.GetErrorMessage(), error.Value);
        valCtx.ThrowIfAnyErrors(status);
    }
}