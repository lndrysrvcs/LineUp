using LineUp.Core.Models;
using LineUp.Core.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend;

/// <summary>
/// The database context for the LineUp application.
/// </summary>
public class LineUpContext : DbContext
{
    public virtual DbSet<Schedule> Schedules { get; set; }
    public virtual DbSet<Availability> Availabilities { get; set; }
    public virtual DbSet<Form> Forms { get; set; }
    public virtual DbSet<FormQuestion> FormQuestions { get; set; }
    public virtual DbSet<QuestionOptions> QuestionOptions { get; set; }
    public virtual DbSet<FormQuestionAnswer> FormQuestionAnswers { get; set; }
    public virtual DbSet<ShiftAssignment> ShiftAssignments { get; set; }

    public LineUpContext(DbContextOptions<LineUpContext> options)
        : base(options) { }

    /// <summary>
    /// Configures the database model.
    /// </summary>
    /// <param name="modelBuilder"></param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<Schedule>()
            .HasOne(f => f.Form)
            .WithOne(f => f.Schedule)
            .HasForeignKey<Schedule>(f => f.FormId);

        modelBuilder.Entity<Availability>().HasIndex(a => new { a.Id, a.UserEmail }).IsUnique();
    }
}
