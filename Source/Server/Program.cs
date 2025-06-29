using System.Text.Json.Serialization;
using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using InternshipManagementSystem.Core.Interaction;
using InternshipManagementSystem.Infrastructure.Auth;
using InternshipManagementSystem.Infrastructure.Configurations;
using InternshipManagementSystem.Persistency;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

var jwtConfigurationSection = builder.Configuration.GetSection(nameof(JwtConfiguration));

var connectionString = builder.Configuration.GetConnectionString("Database");
var jwtConfiguration = jwtConfigurationSection.Get<JwtConfiguration>()!;

builder.Services.AddDbContext<DatabaseContext>(o => o.UseSqlServer(connectionString));
builder
    .Services.AddOptions<JwtConfiguration>()
    .Bind(jwtConfigurationSection)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddFastEndpoints()
    .SwaggerDocument(
        o =>
        {
            o.DocumentSettings = s =>
            {
                s.Title = "Internship Management System";
                s.Version = "Latest";
                s.DocumentName = "Administration";
                s.Description = "API for a project as a part of Software Engineering course on Faculty of Informatics and Digital Technologies, Rijeka.";
            };
            o.AutoTagPathSegmentIndex = 1;
        }
    );
builder.Services.AddAuthorization();
builder.Services.AddAuthenticationJwtBearer(s => s.SigningKey = jwtConfiguration.SigningKey);

builder.Services.AddHttpContextAccessor();

// Configure HTTPS
builder.Services.AddHttpsRedirection(options =>
{
    options.RedirectStatusCode = StatusCodes.Status307TemporaryRedirect;
    options.HttpsPort = 5001;
});

builder.Services.AddOptions<JwtConfiguration>().Bind(jwtConfigurationSection).ValidateDataAnnotations().ValidateOnStart();

builder.Services.AddCors(
    options =>
    {
        options.AddDefaultPolicy(
            pb =>
            {
                //pb.WithOrigins(corsConfiguration.Origins);
                pb.AllowAnyOrigin();
                pb.AllowAnyHeader();
                pb.AllowAnyMethod();
                //pb.AllowCredentials();
            }
        );
    }
);

var app = builder.Build();

// Add exception handling
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

// Configure static files for Angular app
app.UseDefaultFiles();
// Configure file extension content type provider
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".js"] = "application/javascript";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider,
    OnPrepareResponse = ctx =>
    {
        // Add cache headers for static files
        if (ctx.File.Name.EndsWith(".js") || ctx.File.Name.EndsWith(".css"))
        {
            ctx.Context.Response.Headers.Append("Cache-Control", "public,max-age=31536000");
        }
    }
});

// Configure HTTPS redirection (only in production or when explicitly enabled)
if (!app.Environment.IsDevelopment() || app.Configuration.GetValue<bool>("EnableHttpsRedirection", false))
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();
app.UseFastEndpoints(
    c =>
    {
        c.Serializer.Options.Converters.Add(new JsonStringEnumConverter());
        c.Endpoints.RoutePrefix = "api";
        c.Errors.ProducesMetadataType = typeof(Response<object?>);
        c.Errors.ResponseBuilder = (failures, _, _) =>
            new Response<object?>(failures.Select(f => new ErrorDetail { Code = f.ErrorCode, Message = f.ErrorMessage }));
    }
);
app.UseSwaggerGen();
app.UseCors();
app.UseAuthenticatedUserSetter();

// Handle development-specific requests that don't exist in production
app.Map("/_framework/{**path}", context =>
{
    context.Response.StatusCode = 404;
    return Task.CompletedTask;
});

// SPA fallback routing - serve index.html for any non-API routes
app.MapFallbackToFile("index.html");

app.Run();