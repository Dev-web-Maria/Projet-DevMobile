using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlloHonda.Migrations
{
    /// <inheritdoc />
    public partial class updatevehicule : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vehicule_ChauffeurId",
                table: "Vehicule");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Vehicule",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Immatriculation",
                table: "Vehicule",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<int>(
                name: "ChauffeurId",
                table: "Vehicule",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "Annee",
                table: "Vehicule",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "Autonomie",
                table: "Vehicule",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "ConsommationMoyenne",
                table: "Vehicule",
                type: "decimal(10,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Couleur",
                table: "Vehicule",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateAssuranceExpire",
                table: "Vehicule",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateCreation",
                table: "Vehicule",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DateDerniereRevision",
                table: "Vehicule",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateModification",
                table: "Vehicule",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateProchaineRevision",
                table: "Vehicule",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ImageBase64",
                table: "Vehicule",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "ImageUrl",
                table: "Vehicule",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "Kilometrage",
                table: "Vehicule",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Marque",
                table: "Vehicule",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Modele",
                table: "Vehicule",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NumeroChassis",
                table: "Vehicule",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Observations",
                table: "Vehicule",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Statut",
                table: "Vehicule",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TypeEnergie",
                table: "Vehicule",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Vehicule_ChauffeurId",
                table: "Vehicule",
                column: "ChauffeurId",
                unique: true,
                filter: "[ChauffeurId] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Vehicule_ChauffeurId",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Annee",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Autonomie",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "ConsommationMoyenne",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Couleur",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "DateAssuranceExpire",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "DateCreation",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "DateDerniereRevision",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "DateModification",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "DateProchaineRevision",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "ImageBase64",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "ImageUrl",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Kilometrage",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Marque",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Modele",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "NumeroChassis",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Observations",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "Statut",
                table: "Vehicule");

            migrationBuilder.DropColumn(
                name: "TypeEnergie",
                table: "Vehicule");

            migrationBuilder.AlterColumn<string>(
                name: "Type",
                table: "Vehicule",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "Immatriculation",
                table: "Vehicule",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<int>(
                name: "ChauffeurId",
                table: "Vehicule",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Vehicule_ChauffeurId",
                table: "Vehicule",
                column: "ChauffeurId",
                unique: true);
        }
    }
}
