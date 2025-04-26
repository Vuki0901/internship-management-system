using FastEndpoints;
using Microsoft.AspNetCore.Http;

namespace InternshipManagementSystem.Features.Administration.Utilities;

public class Ping : EndpointWithoutRequest
{
    public override void Configure()
    {
        Get("/ping");
        AllowAnonymous();
        Options(o => o.WithTags("Utilities"));
    }

    public override async Task HandleAsync(CancellationToken ct)
    {
        await SendAsync("API is working!", cancellation: ct);
    }
}