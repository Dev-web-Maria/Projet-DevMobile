using AlloHonda.Models;
using System.ComponentModel.DataAnnotations;

namespace AlloHanda.Models
{
    public class DemandeTransport
    {
        [Key]
        public int IdDemande { get; set; }

        public string DescriptionMarchandise { get; set; }
        public double Poids { get; set; }
        public string Statut { get; set; }
        public double PrixEstime { get; set; }

        // Client
        public int ClientId { get; set; }
        public Client Client { get; set; }

        // Chauffeur (nullable)
        public int? ChauffeurId { get; set; }
        public Chauffeur Chauffeur { get; set; }

        // 1–1
        public Trajet Trajet { get; set; }

        
    }
}
