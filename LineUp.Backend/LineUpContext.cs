using LineUp.Core.Models;
using LineUp.Core.Models.Forms;
using Microsoft.EntityFrameworkCore;

namespace LineUp.Backend;

public class LineUpContext : DbContext
{
    public DbSet<Schedule> Schedules { get; set; }
    public DbSet<Availability> Availabilities { get; set; }
    public DbSet<Form> Forms { get; set; }
    public DbSet<FormQuestion> FormQuestions { get; set; }
    public DbSet<QuestionOptions> QuestionOptions { get; set; }
    public DbSet<FormQuestionAnswer> FormQuestionAnswers { get; set; }
    public DbSet<ShiftAssignment> ShiftAssignments { get; set; }

    public LineUpContext(DbContextOptions<LineUpContext> options)
        : base(options) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder
            .Entity<Schedule>()
            .HasOne(f => f.Form)
            .WithOne(f => f.Schedule)
            .HasForeignKey<Schedule>(f => f.FormId);
    }
}
