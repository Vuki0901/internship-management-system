using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InternshipManagementSystem.Migrations
{
    /// <inheritdoc />
    public partial class UpdateExistingEnumValues : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Update WorkLocation enum values: 0->1, 1->2, 2->3
            migrationBuilder.Sql(@"
                UPDATE InternshipLogs 
                SET Location = Location + 1
                WHERE Location IN (0, 1, 2)
            ");

            // Update InternshipLogStatus enum values: 0->1, 1->2, 2->3
            migrationBuilder.Sql(@"
                UPDATE InternshipLogs 
                SET Status = Status + 1
                WHERE Status IN (0, 1, 2)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Revert WorkLocation enum values: 1->0, 2->1, 3->2
            migrationBuilder.Sql(@"
                UPDATE InternshipLogs 
                SET Location = Location - 1
                WHERE Location IN (1, 2, 3)
            ");

            // Revert InternshipLogStatus enum values: 1->0, 2->1, 3->2
            migrationBuilder.Sql(@"
                UPDATE InternshipLogs 
                SET Status = Status - 1
                WHERE Status IN (1, 2, 3)
            ");
        }
    }
}
