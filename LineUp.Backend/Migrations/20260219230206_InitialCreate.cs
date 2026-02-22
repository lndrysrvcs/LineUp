using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Preferences",
                columns: table => new { Id = table.Column<Guid>(type: "uuid", nullable: false) },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Preferences", x => x.Id);
                }
            );

            migrationBuilder.CreateTable(
                name: "Schedules",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    Guid = table.Column<Guid>(type: "uuid", nullable: false),
                    Auth0UserId = table.Column<string>(
                        type: "character varying(256)",
                        maxLength: 256,
                        nullable: false
                    ),
                    DateCoverage = table.Column<DateOnly[]>(type: "date[]", nullable: false),
                    WeekdayCoverage = table.Column<bool[]>(type: "boolean[]", nullable: false),
                    StartTime = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: false
                    ),
                    EndTime = table.Column<TimeOnly>(
                        type: "time without time zone",
                        nullable: false
                    ),
                    PreferencesId = table.Column<Guid>(type: "uuid", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schedules_Preferences_PreferencesId",
                        column: x => x.PreferencesId,
                        principalTable: "Preferences",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "Availabilities",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    AvailabilitySlots = table.Column<DateTime[]>(
                        type: "timestamp with time zone[]",
                        nullable: false
                    ),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                    UserName = table.Column<string>(type: "text", nullable: false),
                    UserEmail = table.Column<string>(type: "text", nullable: true),
                    PreferencesId = table.Column<Guid>(type: "uuid", nullable: true),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Availabilities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Availabilities_Preferences_PreferencesId",
                        column: x => x.PreferencesId,
                        principalTable: "Preferences",
                        principalColumn: "Id"
                    );
                    table.ForeignKey(
                        name: "FK_Availabilities_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateTable(
                name: "ShiftAssignment",
                columns: table => new
                {
                    Id = table
                        .Column<int>(type: "integer", nullable: false)
                        .Annotation(
                            "Npgsql:ValueGenerationStrategy",
                            NpgsqlValueGenerationStrategy.IdentityByDefaultColumn
                        ),
                    StartTime = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    EndTime = table.Column<DateTime>(
                        type: "timestamp with time zone",
                        nullable: false
                    ),
                    DayOfWeek = table.Column<string>(type: "text", nullable: true),
                    AvailabilityId = table.Column<int>(type: "integer", nullable: false),
                    ScheduleId = table.Column<int>(type: "integer", nullable: false),
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftAssignment", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ShiftAssignment_Availabilities_AvailabilityId",
                        column: x => x.AvailabilityId,
                        principalTable: "Availabilities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                    table.ForeignKey(
                        name: "FK_ShiftAssignment_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade
                    );
                }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Availabilities_PreferencesId",
                table: "Availabilities",
                column: "PreferencesId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Availabilities_ScheduleId",
                table: "Availabilities",
                column: "ScheduleId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_Auth0UserId_Guid",
                table: "Schedules",
                columns: new[] { "Auth0UserId", "Guid" }
            );

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_PreferencesId",
                table: "Schedules",
                column: "PreferencesId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignment_AvailabilityId",
                table: "ShiftAssignment",
                column: "AvailabilityId"
            );

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignment_ScheduleId",
                table: "ShiftAssignment",
                column: "ScheduleId"
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "ShiftAssignment");

            migrationBuilder.DropTable(name: "Availabilities");

            migrationBuilder.DropTable(name: "Schedules");

            migrationBuilder.DropTable(name: "Preferences");
        }
    }
}
