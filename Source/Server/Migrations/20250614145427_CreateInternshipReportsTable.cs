using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class CreateInternshipReportsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "InternshipReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    InternshipId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalHoursWorked = table.Column<double>(type: "float", nullable: false),
                    TotalLogEntries = table.Column<int>(type: "int", nullable: false),
                    MentorContent = table.Column<string>(type: "nvarchar(4000)", maxLength: 4000, nullable: false),
                    Grade = table.Column<int>(type: "int", nullable: true),
                    IsConfirmedByMentor = table.Column<bool>(type: "bit", nullable: false),
                    ConfirmedAt = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    CreatedOn = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_InternshipReports", x => x.Id);
                    table.ForeignKey(
                        name: "FK_InternshipReports_Internships_InternshipId",
                        column: x => x.InternshipId,
                        principalTable: "Internships",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InternshipReports_InternshipId",
                table: "InternshipReports",
                column: "InternshipId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "InternshipReports");
        }
    }
}
