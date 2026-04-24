using System.Text;
using System.Text.Json.Serialization;
using System.Text.Json.Serialization.Metadata;
using LineUp.Backend;
using LineUp.Backend.Services;
using LineUp.Backend.Support;
using LineUp.Core.Attributes;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Polly;
using Polly.Retry;
using Resend;
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
    {
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
        });
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddOpenApi();
builder.Services.AddSingleton<IAuthorizationHandler, HasScopeHandler>();

builder.AddNpgsqlDbContext<LineUpContext>("lineupdb");

var resendApiKey =
    builder.Configuration["Parameters:resend-api-key"]
    ?? Environment.GetEnvironmentVariable("RESEND_APITOKEN");

if (string.IsNullOrEmpty(resendApiKey))
{
    builder.Services.AddScoped<IEmailService, MockEmailService>();
    Console.WriteLine(
        "WARNING: No RESEND_APITOKEN environment variable or Parameters:resend-api-key user secret set. Mocking email service."
    );
}
else
{
    builder.Services.AddHttpClient<ResendClient>();
    builder.Services.Configure<ResendClientOptions>(o =>
    {
        o.ApiToken = resendApiKey;
    });
    builder.Services.AddTransient<IResend, ResendClient>();

    builder.Services.AddResiliencePipeline(
        "email-retry",
        pipelineBuilder =>
        {
            pipelineBuilder.AddRetry(
                new RetryStrategyOptions
                {
                    MaxRetryAttempts = 5,
                    BackoffType = DelayBackoffType.Exponential,
                    UseJitter = true,
                    Delay = TimeSpan.FromSeconds(2),
                    ShouldHandle = new PredicateBuilder()
                        .Handle<ResendException>(ex => ex.IsTransient)
                        .Handle<Exception>(ex => ex is HttpRequestException or TimeoutException),
                }
            );
        }
    );

    builder.Services.AddScoped<IEmailService, ResendEmailService>();
}

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
    db.Database.Migrate();

    DbSeeder seeder = new(db);
    seeder.Seed();
}

app.Run();
