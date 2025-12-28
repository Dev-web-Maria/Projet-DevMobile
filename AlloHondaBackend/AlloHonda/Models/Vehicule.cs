using System.ComponentModel.DataAnnotations;

namespace AlloHanda.Models
{
    public class Vehicule
    {
        [Key]
        public int IdVehicule { get; set; }

        public string Type { get; set; } // Honda, Camion
        public double Capacite { get; set; }
        public string Immatriculation { get; set; }

        // FK
        public int ChauffeurId { get; set; }
        public Chauffeur Chauffeur { get; set; }
    }
}
