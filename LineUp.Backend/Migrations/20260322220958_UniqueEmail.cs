using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LineUp.Backend.Migrations
{
    /// <inheritdoc />
    public partial class UniqueEmail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Availabilities_Id_UserEmail",
                table: "Availabilities",
                columns: new[] { "Id", "UserEmail" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Availabilities_Id_UserEmail",
                table: "Availabilities");
        }
    }
}
