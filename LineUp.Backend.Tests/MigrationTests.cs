using LineUp.Backend.Support;
using Microsoft.EntityFrameworkCore;
using Testcontainers.PostgreSql;

namespace LineUp.Backend.Tests;

public class MigrationTests
{
    [Fact]
    public async Task DbCanBeMigrated()
    {
        // Arrange
        await using var postgresContainer = new PostgreSqlBuilder()
            .WithImage("postgres:18.1")
            .WithCleanUp(true)
            .WithAutoRemove(true)
            .Build();
        await postgresContainer.StartAsync();

        var connectionString = postgresContainer.GetConnectionString();
        var optionsBuilder = new DbContextOptionsBuilder<LineUpContext>();
        optionsBuilder.UseNpgsql(connectionString);

        await using var context = new LineUpContext(optionsBuilder.Options);

        // Act
        await context.Database.MigrateAsync();
        new DbSeeder(context).Seed();

        // Assert
        Assert.True(await context.Database.CanConnectAsync());
    }
}
