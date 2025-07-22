using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class MakeContentBase64Unlimited2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ContentBase64",
                table: "Documents",
                type: "nvarchar(max)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "ContentBase64",
                table: "Documents",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldMaxLength: 4000);
        }
    }
}
