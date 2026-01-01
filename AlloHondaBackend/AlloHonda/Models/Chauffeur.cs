using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace AlloHonda.Models
{
    public class Chauffeur
    {
        [Key]
        public int IdChauffeur { get; set; }

        [Required]
        public string ApplicationUserId { get; set; }

        [ForeignKey(nameof(ApplicationUserId))]
        public virtual ApplicationUser ApplicationUser { get; set; }

        [Required]
        public string Statut { get; set; } // Disponible / Occupe

        public string? NumeroPermis { get; set; }
        public DateTime? DateExpirationPermis { get; set; }

        // Navigation
        public virtual Vehicule Vehicule { get; set; }

        public double? Latitude { get; set; }
        public double? Longitude { get; set; }

        public virtual ICollection<DemandeTransport> DemandesAcceptees { get; set; }
            = new List<DemandeTransport>();
    }
}
