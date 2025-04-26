using System.Text.Json.Serialization;
using FastEndpoints;
using FastEndpoints.Security;
using FastEndpoints.Swagger;
using InternshipManagementSystem.Infrastructure.Configurations;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

var jwtConfigurationSection = builder.Configuration.GetSection(nameof(JwtConfiguration));

var jwtConfiguration = jwtConfigurationSection.Get<JwtConfiguration>()!;

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
            o.AutoTagPathSegmentIndex = 2;
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
                pb.AllowCredentials();
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
        // c.Errors.ResponseBuilder = (failures, _, _) =>
        // {
        //     return new BaseResponse(
        //         failures.GroupBy(f => f.PropertyName)
        //             .ToDictionary(
        //                 keySelector: e => e.Key,
        //                 elementSelector: e => e.Select(m => m.ErrorMessage).ToArray()
        //             )
        //     );
        // };
    }
);
app.UseSwaggerGen();
app.UseCors();

app.Run();