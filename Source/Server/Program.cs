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
app.UseHttpsRedirection();
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

app.Run();