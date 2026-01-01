using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlloHonda.Migrations
{
    /// <inheritdoc />
    public partial class updateChauffeur : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "AdresseDepart",
                table: "Trajet",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "AdresseArrivee",
                table: "Trajet",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateExpirationPermis",
                table: "Chauffeur",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroPermis",
                table: "Chauffeur",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateExpirationPermis",
                table: "Chauffeur");

            migrationBuilder.DropColumn(
                name: "NumeroPermis",
                table: "Chauffeur");

            migrationBuilder.AlterColumn<string>(
                name: "AdresseDepart",
                table: "Trajet",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "AdresseArrivee",
                table: "Trajet",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);
        }
    }
}
