using System.ComponentModel.DataAnnotations;

namespace AlloHanda.Models
{
    public class Trajet
    {
        [Key]
        public int IdTrajet { get; set; }

        public string AdresseDepart { get; set; }
        public string AdresseArrivee { get; set; }
        public double Distance { get; set; }
        public double DureeEstimee { get; set; }

        // FK
        public int DemandeTransportId { get; set; }
        public DemandeTransport DemandeTransport { get; set; }
    }
}
