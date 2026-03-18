using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class CoreMigration : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments"
            );

            migrationBuilder.AlterColumn<int>(
                name: "AvailabilityId",
                table: "ShiftAssignments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments",
                column: "AvailabilityId",
                principalTable: "Availabilities",
                principalColumn: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments"
            );

            migrationBuilder.AlterColumn<int>(
                name: "AvailabilityId",
                table: "ShiftAssignments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments",
                column: "AvailabilityId",
                principalTable: "Availabilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
