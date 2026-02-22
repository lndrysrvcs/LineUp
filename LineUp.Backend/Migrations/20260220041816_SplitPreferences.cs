using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SplitPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Availabilities_Preferences_PreferencesId",
                table: "Availabilities"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_Preferences_PreferencesId",
                table: "Schedules"
            );

            migrationBuilder.DropTable(name: "Preferences");

            migrationBuilder.RenameColumn(
                name: "PreferencesId",
                table: "Schedules",
                newName: "SchedulePreferencesId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Schedules_PreferencesId",
                table: "Schedules",
                newName: "IX_Schedules_SchedulePreferencesId"
            );

            migrationBuilder.CreateTable(
                name: "AvailabilityPreferences",
                columns: table => new { Id = table.Column<Guid>(type: "uuid", nullable: false) },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AvailabilityPreferences", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "SchedulePreferences",
                columns: table => new { Id = table.Column<Guid>(type: "uuid", nullable: false) },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SchedulePreferences", x => x.Id);
                }
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Availabilities_AvailabilityPreferences_PreferencesId",
                table: "Availabilities",
                column: "PreferencesId",
                principalTable: "AvailabilityPreferences",
                principalColumn: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_SchedulePreferences_SchedulePreferencesId",
                table: "Schedules",
                column: "SchedulePreferencesId",
                principalTable: "SchedulePreferences",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Availabilities_AvailabilityPreferences_PreferencesId",
                table: "Availabilities"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_Schedules_SchedulePreferences_SchedulePreferencesId",
                table: "Schedules"
            );

            migrationBuilder.DropTable(name: "AvailabilityPreferences");

            migrationBuilder.DropTable(name: "SchedulePreferences");

            migrationBuilder.RenameColumn(
                name: "SchedulePreferencesId",
                table: "Schedules",
                newName: "PreferencesId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_Schedules_SchedulePreferencesId",
                table: "Schedules",
                newName: "IX_Schedules_PreferencesId"
            );

            migrationBuilder.CreateTable(
                name: "Preferences",
                columns: table => new { Id = table.Column<Guid>(type: "uuid", nullable: false) },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Preferences", x => x.Id);
                }
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Availabilities_Preferences_PreferencesId",
                table: "Availabilities",
                column: "PreferencesId",
                principalTable: "Preferences",
                principalColumn: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_Schedules_Preferences_PreferencesId",
                table: "Schedules",
                column: "PreferencesId",
                principalTable: "Preferences",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
