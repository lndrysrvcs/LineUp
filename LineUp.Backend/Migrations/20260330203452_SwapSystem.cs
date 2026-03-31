using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class SwapSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SwapRequestId",
                table: "ShiftAssignments",
                type: "integer",
                nullable: true
            );

            migrationBuilder.AddColumn<int>(
                name: "SwapRequestId1",
                table: "ShiftAssignments",
                type: "integer",
                nullable: true
            );

            migrationBuilder.CreateTable(
                name: "SwapRequests",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SwapRequests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SwapRequests_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_SwapRequestId",
                table: "ShiftAssignments",
                column: "SwapRequestId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_SwapRequestId1",
                table: "ShiftAssignments",
                column: "SwapRequestId1"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SwapRequests_Guid",
                table: "SwapRequests",
                column: "Guid"
            );

            migrationBuilder.CreateIndex(
                name: "IX_SwapRequests_ScheduleId",
                table: "SwapRequests",
                column: "ScheduleId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_SwapRequests_SwapRequestId",
                table: "ShiftAssignments",
                column: "SwapRequestId",
                principalTable: "SwapRequests",
                principalColumn: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_SwapRequests_SwapRequestId1",
                table: "ShiftAssignments",
                column: "SwapRequestId1",
                principalTable: "SwapRequests",
                principalColumn: "Id"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_SwapRequests_SwapRequestId",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_SwapRequests_SwapRequestId1",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropTable(name: "SwapRequests");

            migrationBuilder.DropIndex(
                name: "IX_ShiftAssignments_SwapRequestId",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropIndex(
                name: "IX_ShiftAssignments_SwapRequestId1",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropColumn(name: "SwapRequestId", table: "ShiftAssignments");

            migrationBuilder.DropColumn(name: "SwapRequestId1", table: "ShiftAssignments");
        }
    }
}
