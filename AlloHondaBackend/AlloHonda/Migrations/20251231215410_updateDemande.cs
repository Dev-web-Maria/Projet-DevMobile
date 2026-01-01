using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlloHonda.Migrations
{
    /// <inheritdoc />
    public partial class updateDemande : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Arrivee",
                table: "DemandeTransport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateDepart",
                table: "DemandeTransport",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Depart",
                table: "DemandeTransport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "HeureDepart",
                table: "DemandeTransport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Instructions",
                table: "DemandeTransport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TypeMarchandise",
                table: "DemandeTransport",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<double>(
                name: "Volume",
                table: "DemandeTransport",
                type: "float",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Arrivee",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "DateDepart",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "Depart",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "HeureDepart",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "Instructions",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "TypeMarchandise",
                table: "DemandeTransport");

            migrationBuilder.DropColumn(
                name: "Volume",
                table: "DemandeTransport");
        }
    }
}
