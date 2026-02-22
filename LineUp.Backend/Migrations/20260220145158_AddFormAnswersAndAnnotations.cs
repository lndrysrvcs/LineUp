using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddFormAnswersAndAnnotations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignment_Availabilities_AvailabilityId",
                table: "ShiftAssignment"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignment_Schedules_ScheduleId",
                table: "ShiftAssignment"
            );

            migrationBuilder.DropPrimaryKey(name: "PK_ShiftAssignment", table: "ShiftAssignment");

            migrationBuilder.RenameTable(name: "ShiftAssignment", newName: "ShiftAssignments");

            migrationBuilder.RenameIndex(
                name: "IX_ShiftAssignment_ScheduleId",
                table: "ShiftAssignments",
                newName: "IX_ShiftAssignments_ScheduleId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ShiftAssignment_AvailabilityId",
                table: "ShiftAssignments",
                newName: "IX_ShiftAssignments_AvailabilityId"
            );

            migrationBuilder.AlterColumn<string>(
                name: "OptionText",
                table: "QuestionOptions",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AlterColumn<string>(
                name: "QuestionText",
                table: "FormQuestions",
                type: "character varying(512)",
                maxLength: 512,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "text"
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShiftAssignments",
                table: "ShiftAssignments",
                column: "Id"
            );

            migrationBuilder.CreateTable(
                name: "FormQuestionAnswers",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    FormQuestionId = table.Column<int>(type: "integer", nullable: false),
                    AnswerId = table.Column<int>(type: "integer", nullable: false),
                    AnswerText = table.Column<string>(type: "text", nullable: false),
                    AvailabilityId = table.Column<int>(type: "integer", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormQuestionAnswers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormQuestionAnswers_Availabilities_AvailabilityId",
                        column: x => x.AvailabilityId,
                        principalTable: "Availabilities",
                        principalColumn: "Id"
                    );
                    table.ForeignKey(
                        name: "FK_FormQuestionAnswers_FormQuestions_FormQuestionId",
                        column: x => x.FormQuestionId,
                        principalTable: "FormQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_FormQuestionAnswers_AvailabilityId",
                table: "FormQuestionAnswers",
                column: "AvailabilityId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_FormQuestionAnswers_FormQuestionId",
                table: "FormQuestionAnswers",
                column: "FormQuestionId"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments",
                column: "AvailabilityId",
                principalTable: "Availabilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignments_Schedules_ScheduleId",
                table: "ShiftAssignments",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_Availabilities_AvailabilityId",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropForeignKey(
                name: "FK_ShiftAssignments_Schedules_ScheduleId",
                table: "ShiftAssignments"
            );

            migrationBuilder.DropTable(name: "FormQuestionAnswers");

            migrationBuilder.DropPrimaryKey(name: "PK_ShiftAssignments", table: "ShiftAssignments");

            migrationBuilder.RenameTable(name: "ShiftAssignments", newName: "ShiftAssignment");

            migrationBuilder.RenameIndex(
                name: "IX_ShiftAssignments_ScheduleId",
                table: "ShiftAssignment",
                newName: "IX_ShiftAssignment_ScheduleId"
            );

            migrationBuilder.RenameIndex(
                name: "IX_ShiftAssignments_AvailabilityId",
                table: "ShiftAssignment",
                newName: "IX_ShiftAssignment_AvailabilityId"
            );

            migrationBuilder.AlterColumn<string>(
                name: "OptionText",
                table: "QuestionOptions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(64)",
                oldMaxLength: 64
            );

            migrationBuilder.AlterColumn<string>(
                name: "QuestionText",
                table: "FormQuestions",
                type: "text",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "character varying(512)",
                oldMaxLength: 512
            );

            migrationBuilder.AddPrimaryKey(
                name: "PK_ShiftAssignment",
                table: "ShiftAssignment",
                column: "Id"
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignment_Availabilities_AvailabilityId",
                table: "ShiftAssignment",
                column: "AvailabilityId",
                principalTable: "Availabilities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );

            migrationBuilder.AddForeignKey(
                name: "FK_ShiftAssignment_Schedules_ScheduleId",
                table: "ShiftAssignment",
                column: "ScheduleId",
                principalTable: "Schedules",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade
            );
        }
    }
}
