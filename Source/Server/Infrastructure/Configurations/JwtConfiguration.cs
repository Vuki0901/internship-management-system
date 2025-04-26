using System.ComponentModel.DataAnnotations;

namespace InternshipManagementSystem.Infrastructure.Configurations;

public class JwtConfiguration
{
    [MinLength(32)] public required string SigningKey { get; init; }
}