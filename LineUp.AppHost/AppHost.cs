using LineUp.AppHost;
using Projects;

var builder = DistributedApplication.CreateBuilder(args);

builder.AddDockerComposeEnvironment("env");

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume();
var postgresdb = postgres.AddDatabase("postgresdb");

var api = builder.AddProject<LineUp_Backend>("api")
    .WaitFor(postgresdb)
    .WithReference(postgresdb);

var web = builder.AddViteApp("web", "../lineup-client")
    .WithEnvironment("PORT", "5173")
    .WithExternalHttpEndpoints()
    .WithEndpoint("http", endpointAnnotation => endpointAnnotation.Port = 5173)
    .WithPnpm()
    .WithReference(api)
    .WaitFor(api)
    .AsDeployableService();

builder.Build().Run();
