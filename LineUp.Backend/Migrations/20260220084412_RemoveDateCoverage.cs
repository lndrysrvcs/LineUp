using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDateCoverage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "WeekdayCoverage", table: "Schedules");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool[]>(
                name: "WeekdayCoverage",
                table: "Schedules",
                type: "boolean[]",
                nullable: false,
                defaultValue: new bool[0]
            );
        }
    }
}
