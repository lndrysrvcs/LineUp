using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class EmailSentFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "LatestEmailsSent",
                table: "Schedules",
                type: "boolean",
                nullable: false,
                defaultValue: false
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "LatestEmailsSent", table: "Schedules");
        }
    }
}
