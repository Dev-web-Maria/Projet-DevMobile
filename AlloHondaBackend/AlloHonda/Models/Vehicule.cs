using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlloHonda.Models
{
    public class Vehicule
    {
        [Key]
        public int IdVehicule { get; set; }

        [Required]
        [StringLength(100)]
        public string Type { get; set; } // Honda, Camion, Utilitaire, etc.

        [Required]
        [StringLength(100)]
        public string Marque { get; set; } // Honda, Toyota, Renault, etc.

        [Required]
        [StringLength(100)]
        public string Modele { get; set; } // Civic, CR-V, Prologue, etc.

        public double Capacite { get; set; } // en kg

        [Required]
        [StringLength(20)]
        public string Immatriculation { get; set; }

        public int? Annee { get; set; }

        [StringLength(50)]
        public string Couleur { get; set; }

        [StringLength(50)]
        public string TypeEnergie { get; set; } // Essence, Diesel, Électrique, Hybride

        [Column(TypeName = "decimal(10,2)")]
        public decimal? ConsommationMoyenne { get; set; } // L/100km ou kWh/100km

        [Column(TypeName = "decimal(10,2)")]
        public decimal? Autonomie { get; set; } // en km

        [StringLength(255)]
        public string ImageUrl { get; set; }

        // Pour stocker l'image en base64 (optionnel)
        [Column(TypeName = "text")]
        public string ImageBase64 { get; set; }

        [StringLength(20)]
        public string Statut { get; set; } = "Actif"; // Actif, En maintenance, Hors service

        public DateTime? DateAssuranceExpire { get; set; }

        public DateTime? DateDerniereRevision { get; set; }

        public DateTime? DateProchaineRevision { get; set; }

        public int? Kilometrage { get; set; }

        [StringLength(50)]
        public string NumeroChassis { get; set; }

        // Informations complémentaires
        [StringLength(500)]
        public string Observations { get; set; }

        public DateTime DateCreation { get; set; } = DateTime.Now;

        public DateTime? DateModification { get; set; }

        // FK
        public int? ChauffeurId { get; set; }

        [ForeignKey("ChauffeurId")]
        public virtual Chauffeur Chauffeur { get; set; }
    }
}