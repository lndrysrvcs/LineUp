using Aspire.Hosting.JavaScript;

namespace LineUp.AppHost;

public static class Extensions
{
    // credz: https://github.com/dotnet/aspire/issues/12697#issue-3589382651
    /// <summary>
    /// Configures this JavaScript/Vite app to be deployed as a standalone service
    /// rather than build-only. By default, JavaScript apps are build-only.
    /// </summary>
    public static IResourceBuilder<T> AsDeployableService<T>(
        this IResourceBuilder<T> builder)
        where T : JavaScriptAppResource
    {
        if (builder.Resource.TryGetLastAnnotation<DockerfileBuildAnnotation>(out var annotation))
        {
            annotation.HasEntrypoint = true;
        }
        return builder;
    }

    /// <summary>
    /// Configures this JavaScript/Vite app to be build-only (default behavior).
    /// Use this to explicitly document intent or revert AsDeployableService.
    /// </summary>
    public static IResourceBuilder<T> AsBuildOnly<T>(
        this IResourceBuilder<T> builder)
        where T : JavaScriptAppResource
    {
        if (builder.Resource.TryGetLastAnnotation<DockerfileBuildAnnotation>(out var annotation))
        {
            annotation.HasEntrypoint = false;
        }
        return builder;
    }
}