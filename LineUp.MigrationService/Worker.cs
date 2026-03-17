using System.Diagnostics;
using LineUp.Backend;
using LineUp.Backend.Models;
using LineUp.Backend.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.MigrationService;

public class Worker(
    IServiceProvider serviceProvider,
    IHostApplicationLifetime hostApplicationLifetime
) : BackgroundService
{
    public const string ActivitySourceName = "Migrations";
    private static readonly ActivitySource SActivitySource = new(ActivitySourceName);

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var activity = SActivitySource.StartActivity(
            "Migrating database",
            ActivityKind.Client
        );

        try
        {
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<LineUpContext>();

            await RunMigrationAsync(dbContext, cancellationToken);
            await SeedDataAsync(dbContext, cancellationToken);
        }
        catch (Exception ex)
        {
            activity?.AddException(ex);
            throw;
        }

        hostApplicationLifetime.StopApplication();
    }

    private static async Task RunMigrationAsync(
        LineUpContext dbContext,
        CancellationToken cancellationToken
    )
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            // Run migration in a transaction to avoid partial migration if it fails.
            await dbContext.Database.MigrateAsync(cancellationToken);
        });
    }

    private static async Task SeedDataAsync(
        LineUpContext context,
        CancellationToken cancellationToken
    )
    {
        var strategy = context.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            // Seed the database
            await using var transaction = await context.Database.BeginTransactionAsync(
                cancellationToken
            );

            // check to make sure we haven't seeded already
            if (context.Set<Schedule>().Any())
            {
                return;
            }

            #region  Seed Schedule
            var schedule = new Schedule
            {
                Auth0UserId = "test-test-123-lineup-test",
                DateCoverage =
                [
                    DateOnly.FromDateTime(DateTime.Today),
                    DateOnly.FromDateTime(DateTime.Today.AddDays(1)),
                    DateOnly.FromDateTime(DateTime.Today.AddDays(2)),
                    DateOnly.FromDateTime(DateTime.Today.AddDays(3)),
                    DateOnly.FromDateTime(DateTime.Today.AddDays(4)),
                ],
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(17, 0),
                SchedulePreferences = new SchedulePreferences
                {
                    MinutesPerSlot = 30,
                    ShiftIntervals = 30,
                    UsersPerShift = 1,
                    MaximumShiftDurationMinutes = 120,
                    MaximumShiftsPerWorker = 1,
                },
                Name = "Test Schedule",
            };
            await context.Schedules.AddAsync(schedule, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            #endregion

            #region Seed Form and Questions
            var freeResponseQuestion = new FormQuestion
            {
                QuestionText = "What is your favorite dinosaur?",
                Type = QuestionType.FreeResponse,
                Options = new List<QuestionOptions>(),
            };

            var radioQuestion = new FormQuestion
            {
                QuestionText = "What is your experience level with C#?",
                Type = QuestionType.Radio,
                Options = new List<QuestionOptions>
                {
                    new() { OptionText = "Beginner", SortOrder = 0 },
                    new() { OptionText = "Intermediate", SortOrder = 1 },
                    new() { OptionText = "Advanced", SortOrder = 2 },
                },
            };

            var checkboxQuestion = new FormQuestion
            {
                QuestionText = "What pizza places do you like in Cleveland?",
                Type = QuestionType.Checkbox,
                Options = new List<QuestionOptions>
                {
                    new() { OptionText = "Constantino's", SortOrder = 0 },
                    new() { OptionText = "Dewey's", SortOrder = 1 },
                    new() { OptionText = "La Pizzeria", SortOrder = 2 },
                    new() { OptionText = "PizzaBOGO", SortOrder = 3 },
                    new() { OptionText = "Rascal House", SortOrder = 4 },
                },
            };

            var selectQuestion = new FormQuestion
            {
                QuestionText = "What is your favorite genre of music?",
                Type = QuestionType.Select,
                Options = new List<QuestionOptions>
                {
                    new() { OptionText = "Progressive Dreamfunk", SortOrder = 1 },
                    new() { OptionText = "Post-Avant Jazzcore", SortOrder = 2 },
                },
            };

            await context.FormQuestions.AddRangeAsync(
                freeResponseQuestion,
                radioQuestion,
                checkboxQuestion,
                selectQuestion
            );
            await context.SaveChangesAsync(cancellationToken);

            var form = new Form
            {
                Questions = new List<FormQuestion>
                {
                    freeResponseQuestion,
                    radioQuestion,
                    checkboxQuestion,
                    selectQuestion,
                },
                Schedule = schedule,
            };
            await context.Forms.AddAsync(form);
            await context.SaveChangesAsync(cancellationToken);
            #endregion

            #region Seed Availabilities
            var availability1 = new Availability
            {
                UserName = "John Doe",
                UserEmail = "john.doe@example.com",
                AvailabilitySlots =
                [
                    DateTime.UtcNow.Date.AddHours(9),
                    DateTime.UtcNow.Date.AddHours(10),
                    DateTime.UtcNow.Date.AddHours(14),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(9),
                    DateTime.UtcNow.Date.AddDays(1).AddHours(15),
                ],
                Schedule = schedule,
                Preferences = new AvailabilityPreferences(),
            };

            var availability2 = new Availability
            {
                UserName = "Jane Smith",
                UserEmail = "jane.smith@example.com",
                AvailabilitySlots =
                [
                    DateTime.UtcNow.Date.AddHours(10),
                    DateTime.UtcNow.Date.AddHours(11),
                    DateTime.UtcNow.Date.AddHours(13),
                    DateTime.UtcNow.Date.AddDays(2).AddHours(10),
                    DateTime.UtcNow.Date.AddDays(2).AddHours(16),
                ],
                Schedule = schedule,
                Preferences = new AvailabilityPreferences(),
            };

            await context.Availabilities.AddRangeAsync(availability1, availability2);
            await context.SaveChangesAsync(cancellationToken);
            #endregion

            #region Seed Form Question Answers
            var answer1 = new FormQuestionAnswer
            {
                Question = freeResponseQuestion,
                FormQuestionId = freeResponseQuestion.Id,
                AnswerId = availability1.Id,
                AnswerText = "Tyrannosaurus Rex",
            };

            var answer2 = new FormQuestionAnswer
            {
                Question = radioQuestion,
                FormQuestionId = radioQuestion.Id,
                AnswerId = availability1.Id,
                AnswerText = "Intermediate",
            };

            var answer3 = new FormQuestionAnswer
            {
                Question = checkboxQuestion,
                FormQuestionId = checkboxQuestion.Id,
                AnswerId = availability2.Id,
                AnswerText = "Constantino's, Dewey's, La Pizzeria",
            };

            var answer4 = new FormQuestionAnswer
            {
                Question = selectQuestion,
                FormQuestionId = selectQuestion.Id,
                AnswerId = availability2.Id,
                AnswerText = "Post-Avant Jazzcore",
            };

            await context.FormQuestionAnswers.AddRangeAsync(answer1, answer2, answer3, answer4);
            availability1.FormAnswers.Add(answer1);
            availability1.FormAnswers.Add(answer2);
            availability2.FormAnswers.Add(answer3);
            availability2.FormAnswers.Add(answer4);
            await context.SaveChangesAsync(cancellationToken);
            #endregion

            #region Seed Shift Assignments

            var shift1 = new ShiftAssignment
            {
                StartTime = DateTime.UtcNow.Date.AddHours(9),
                EndTime = DateTime.UtcNow.Date.AddHours(12),
                Availability = availability1,
                Schedule = schedule,
            };

            var shift2 = new ShiftAssignment
            {
                StartTime = DateTime.UtcNow.Date.AddHours(13),
                EndTime = DateTime.UtcNow.Date.AddHours(17),
                Availability = availability2,
                Schedule = schedule,
            };

            await context.ShiftAssignments.AddRangeAsync(shift1, shift2);
            await context.SaveChangesAsync(cancellationToken);

            #endregion


            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
    }
}
