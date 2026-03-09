using System.Text.Json.Serialization.Metadata;
using LineUp.Backend;
using LineUp.Backend.Attributes;
using LineUp.Backend.Support;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AllowSpecificOrigin",
        builder =>
        {
            builder
                .WithOrigins("http://localhost:8080")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        }
    );
});

var domain = $"https://{builder.Configuration["Auth0:Domain"]}/";
builder
    .Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.Authority = domain;
        options.Audience = builder.Configuration["Auth0:Audience"];
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidIssuer = domain,
            ValidateIssuer = true,
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(
        "read:messages",
        policy => policy.Requirements.Add(new HasScopeRequirement("read:messages", domain))
    );
});

// Source - https://stackoverflow.com/a/79715902
// Posted by Moose Morals
// Retrieved 2026-03-01, License - CC BY-SA 4.0

builder
    .Services.AddControllers()
    .AddJsonOptions(options =>
        options.JsonSerializerOptions.TypeInfoResolver = (
            options.JsonSerializerOptions.TypeInfoResolver ?? new DefaultJsonTypeInfoResolver()
        ).WithAddedModifier(ti =>
        {
            if (ti.Kind != JsonTypeInfoKind.Object)
            {
                return;
            }

            foreach (var p in ti.Properties)
            {
                if (
                    p.AttributeProvider?.GetCustomAttributes(
                        typeof(JsonDoNotSerializeAttribute),
                        false
                    ).Length > 0
                )
                {
                    p.ShouldSerialize = (_, _) => false;
                }
            }
        })
    );
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

builder.AddNpgsqlDbContext<LineUpContext>("postgresdb");

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
    app.MapOpenApi();
    app.MapScalarApiReference(options =>
        options
            .AddPreferredSecuritySchemes("HttpBearer")
            .AddHttpAuthentication(
                "HttpBearer",
                auth =>
                {
                    auth.Token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
                }
            )
    );
}
else
{
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseRouting();

app.UseCors("AllowSpecificOrigin");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

var seed = app.Environment.IsDevelopment() && Environment.GetEnvironmentVariable("SEED") == "true";

if (seed)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<LineUpContext>();
    //TODO DONT DO THIS IN PROD!!!!!!!!!!!!!! :(((((
    db.Database.EnsureDeleted();
    db.Database.EnsureCreated();

    DbSeeder seeder = new(db);
    seeder.Seed();
}

app.Run();
