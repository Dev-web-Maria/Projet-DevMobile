using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlloHonda.Migrations
{
    /// <inheritdoc />
    public partial class traking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "Chauffeur",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "Chauffeur",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "Chauffeur");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "Chauffeur");
        }
    }
}
