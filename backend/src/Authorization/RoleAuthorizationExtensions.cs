using Microsoft.AspNetCore.Authorization;
using ErsaTraining.API.Services;

namespace ErsaTraining.API.Authorization;

public static class RoleAuthorizationExtensions
{
    public static IServiceCollection AddRoleAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            // SuperAdmin policy - highest level access
            options.AddPolicy(PolicyNames.SuperAdminOnly, policy =>
                policy.RequireRole(RoleNames.SuperAdmin));

            // Admin policy - admin and super admin access
            options.AddPolicy(PolicyNames.AdminAccess, policy =>
                policy.RequireRole(RoleNames.Admin, RoleNames.SuperAdmin));

            // Operation policy - operation, admin, and super admin access
            options.AddPolicy(PolicyNames.OperationAccess, policy =>
                policy.RequireRole(RoleNames.Operation, RoleNames.Admin, RoleNames.SuperAdmin));

            // Authenticated users policy - any authenticated user
            options.AddPolicy(PolicyNames.AuthenticatedUsers, policy =>
                policy.RequireAuthenticatedUser());

            // Public access policy - no authentication required
            options.AddPolicy(PolicyNames.PublicAccess, policy =>
                policy.RequireAssertion(_ => true));
        });

        return services;
    }
}

public static class PolicyNames
{
    public const string SuperAdminOnly = "SuperAdminOnly";
    public const string AdminAccess = "AdminAccess";
    public const string OperationAccess = "OperationAccess";
    public const string AuthenticatedUsers = "AuthenticatedUsers";
    public const string PublicAccess = "PublicAccess";
}
