using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlloHonda.Models
{
    public class Trajet
    {
        [Key]
        public int IdTrajet { get; set; }

        [Required, StringLength(200)]
        public string AdresseDepart { get; set; }

        [Required, StringLength(200)]
        public string AdresseArrivee { get; set; }

        [Range(0, double.MaxValue)]
        public double Distance { get; set; }

        [Range(0, double.MaxValue)]
        public double DureeEstimee { get; set; }

        public int DemandeTransportId { get; set; }

        [ForeignKey(nameof(DemandeTransportId))]
        public DemandeTransport DemandeTransport { get; set; }
    }
}
