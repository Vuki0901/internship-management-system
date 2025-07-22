using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class _2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PersonalIdentificationNumber",
                table: "Users",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "RoleType",
                table: "UserRoles",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(13)",
                oldMaxLength: 13);

            migrationBuilder.AddColumn<string>(
                name: "Address",
                table: "InternshipProviders",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactEmailAddress",
                table: "InternshipProviders",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhoneNumber",
                table: "InternshipProviders",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "InternshipProviders",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PersonalIdentificationNumber",
                table: "InternshipProviders",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Internships",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    StartDate = table.Column<DateOnly>(type: "date", nullable: true),
                    EndDate = table.Column<DateOnly>(type: "date", nullable: true),
                    Status = table.Column<int>(type: "int", nullable: false),
                    StudyLevel = table.Column<int>(type: "int", nullable: false),
                    MentorId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    StudentId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Internships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Internships_UserRoles_MentorId",
                        column: x => x.MentorId,
                        principalTable: "UserRoles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_Internships_UserRoles_StudentId",
                        column: x => x.StudentId,
                        principalTable: "UserRoles",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Internships_MentorId",
                table: "Internships",
                column: "MentorId");

            migrationBuilder.CreateIndex(
                name: "IX_Internships_StudentId",
                table: "Internships",
                column: "StudentId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Internships");

            migrationBuilder.DropColumn(
                name: "PersonalIdentificationNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "Address",
                table: "InternshipProviders");

            migrationBuilder.DropColumn(
                name: "ContactEmailAddress",
                table: "InternshipProviders");

            migrationBuilder.DropColumn(
                name: "ContactPhoneNumber",
                table: "InternshipProviders");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "InternshipProviders");

            migrationBuilder.DropColumn(
                name: "PersonalIdentificationNumber",
                table: "InternshipProviders");

            migrationBuilder.AlterColumn<string>(
                name: "RoleType",
                table: "UserRoles",
                type: "nvarchar(13)",
                maxLength: 13,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000);
        }
    }
}
