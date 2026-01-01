using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AlloHonda.Migrations
{
    /// <inheritdoc />
    public partial class updatedem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DemandeTransport_Chauffeur_ChauffeurId",
                table: "DemandeTransport");

            migrationBuilder.DropForeignKey(
                name: "FK_DemandeTransport_Client_ClientId",
                table: "DemandeTransport");

            migrationBuilder.DropForeignKey(
                name: "FK_Trajet_DemandeTransport_DemandeTransportId",
                table: "Trajet");

            migrationBuilder.AddForeignKey(
                name: "FK_DemandeTransport_Chauffeur_ChauffeurId",
                table: "DemandeTransport",
                column: "ChauffeurId",
                principalTable: "Chauffeur",
                principalColumn: "IdChauffeur",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DemandeTransport_Client_ClientId",
                table: "DemandeTransport",
                column: "ClientId",
                principalTable: "Client",
                principalColumn: "IdClient",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Trajet_DemandeTransport_DemandeTransportId",
                table: "Trajet",
                column: "DemandeTransportId",
                principalTable: "DemandeTransport",
                principalColumn: "IdDemande");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DemandeTransport_Chauffeur_ChauffeurId",
                table: "DemandeTransport");

            migrationBuilder.DropForeignKey(
                name: "FK_DemandeTransport_Client_ClientId",
                table: "DemandeTransport");

            migrationBuilder.DropForeignKey(
                name: "FK_Trajet_DemandeTransport_DemandeTransportId",
                table: "Trajet");

            migrationBuilder.AddForeignKey(
                name: "FK_DemandeTransport_Chauffeur_ChauffeurId",
                table: "DemandeTransport",
                column: "ChauffeurId",
                principalTable: "Chauffeur",
                principalColumn: "IdChauffeur");

            migrationBuilder.AddForeignKey(
                name: "FK_DemandeTransport_Client_ClientId",
                table: "DemandeTransport",
                column: "ClientId",
                principalTable: "Client",
                principalColumn: "IdClient",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Trajet_DemandeTransport_DemandeTransportId",
                table: "Trajet",
                column: "DemandeTransportId",
                principalTable: "DemandeTransport",
                principalColumn: "IdDemande",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
