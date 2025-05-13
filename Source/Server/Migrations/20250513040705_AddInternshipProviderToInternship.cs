using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class AddInternshipProviderToInternship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "InternshipProviderId",
                table: "Internships",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Internships_InternshipProviderId",
                table: "Internships",
                column: "InternshipProviderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Internships_InternshipProviders_InternshipProviderId",
                table: "Internships",
                column: "InternshipProviderId",
                principalTable: "InternshipProviders",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Internships_InternshipProviders_InternshipProviderId",
                table: "Internships");

            migrationBuilder.DropIndex(
                name: "IX_Internships_InternshipProviderId",
                table: "Internships");

            migrationBuilder.DropColumn(
                name: "InternshipProviderId",
                table: "Internships");
        }
    }
}
