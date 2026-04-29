using Microsoft.AspNetCore.Authorization;

namespace LineUp.Backend.Support;

/// <summary>
/// Requirement for a specific scope.
/// </summary>
/// <param name="scope"></param>
/// <param name="issuer"></param>
public class HasScopeRequirement(string scope, string issuer) : IAuthorizationRequirement
{
    /// <summary>
    /// The issuer of the scope.
    /// </summary>
    public string Issuer { get; } = issuer ?? throw new ArgumentNullException(nameof(issuer));
    /// <summary>
    /// The scope required.
    /// </summary>
    public string Scope { get; } = scope ?? throw new ArgumentNullException(nameof(scope));
}
