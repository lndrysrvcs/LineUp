using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class ShortGuid : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<Guid>(
                name: "SchedulePreferencesId",
                table: "Schedules",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<Guid>(
                name: "Id",
                table: "SchedulePreferences",
                type: "uuid",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "SchedulePreferencesId",
                table: "Schedules",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid"
            );

            migrationBuilder.AlterColumn<string>(
                name: "Id",
                table: "SchedulePreferences",
                type: "text",
                nullable: false,
                oldClrType: typeof(Guid),
                oldType: "uuid"
            );
        }
    }
}
