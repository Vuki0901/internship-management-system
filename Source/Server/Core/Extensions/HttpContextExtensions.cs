using InternshipManagementSystem.Domain;
using Microsoft.AspNetCore.Http;

namespace InternshipManagementSystem.Core.Extensions;

public static class HttpContextExtensions
{
    public static User? GetAuthenticatedUser(this HttpContext httpContext)
    {
        return (User?)httpContext.Items[nameof(User)];
    }
    
    public static Administrator? GetAuthenticatedAdministrator(this HttpContext httpContext)
    {
        var user = httpContext.GetAuthenticatedUser();
        var administrator = user?.GetRoleOrNull<Administrator>();
        return administrator;
    }
    
    public static Student? GetAuthenticatedStudent(this HttpContext httpContext)
    {
        var user = httpContext.GetAuthenticatedUser();
        var student = user?.GetRoleOrNull<Student>();
        return student;
    }
    
    public static Mentor? GetAuthenticatedMentor(this HttpContext httpContext)
    {
        var user = httpContext.GetAuthenticatedUser();
        var mentor = user?.GetRoleOrNull<Mentor>();
        return mentor;
    }
    
    public static InternshipSupervisor? GetAuthenticatedInternshipSupervisor(this HttpContext httpContext)
    {
        var user = httpContext.GetAuthenticatedUser();
        var internshipSupervisor = user?.GetRoleOrNull<InternshipSupervisor>();
        return internshipSupervisor;
    }
}