using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddMoreSchedulePrefs : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Schedules",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: ""
            );

            migrationBuilder.AddColumn<int>(
                name: "MaximumShiftDurationMinutes",
                table: "SchedulePreferences",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "MaximumShiftsPerWorker",
                table: "SchedulePreferences",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "ShiftIntervals",
                table: "SchedulePreferences",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );

            migrationBuilder.AddColumn<int>(
                name: "UsersPerShift",
                table: "SchedulePreferences",
                type: "integer",
                nullable: false,
                defaultValue: 0
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Name", table: "Schedules");

            migrationBuilder.DropColumn(
                name: "MaximumShiftDurationMinutes",
                table: "SchedulePreferences"
            );

            migrationBuilder.DropColumn(
                name: "MaximumShiftsPerWorker",
                table: "SchedulePreferences"
            );

            migrationBuilder.DropColumn(name: "ShiftIntervals", table: "SchedulePreferences");

            migrationBuilder.DropColumn(name: "UsersPerShift", table: "SchedulePreferences");
        }
    }
}
