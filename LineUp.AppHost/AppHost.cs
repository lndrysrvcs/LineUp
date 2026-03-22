using LineUp.AppHost;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("env");

var postgres = builder.AddPostgres("postgres").WithDataVolume();

var postgresdb = postgres.AddDatabase("lineupdb");

var migrations = builder
    .AddProject<LineUp_MigrationService>("migrations")
    .WithReference(postgresdb)
    .WaitFor(postgresdb);

var api = builder
    .AddProject<LineUp_Backend>("api")
    .WithReference(postgresdb)
    .WithReference(migrations)
    .WaitForCompletion(migrations);

if (!builder.ExecutionContext.IsRunMode)
{
    api.WithEndpoint(
        "http",
        e =>
        {
            e.Port = 3010;
            e.IsExternal = true;
        }
    );
}

IResourceBuilder<IResourceWithEndpoints> web;

if (builder.ExecutionContext.IsRunMode)
{
    web = builder
        .AddViteApp("web", "../lineup-client")
        .WithPnpm()
        .WithEnvironment("PORT", "5173")
        .WithEndpoint("http", endpointAnnotation => endpointAnnotation.Port = 5173)
        .WithExternalHttpEndpoints()
        .WithReference(api)
        .WaitFor(api)
        .AsDeployableService();
}
else
{
    web = builder
        .AddDockerfile("web", "../lineup-client")
        .WithHttpEndpoint(port: 8080, targetPort: 80, env: "PORT")
        .WithExternalHttpEndpoints()
        .WithEnvironment("VITE_API_URL", api.GetEndpoint("http"))
        .WithReference(api)
        .WaitFor(api);
}

builder.Build().Run();
