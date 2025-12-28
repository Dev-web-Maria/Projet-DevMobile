using AlloHonda.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlloHanda.Models
{
    public class Chauffeur
    {
        [Key]
        public int IdChauffeur { get; set; }

        [Required]
        public string ApplicationUserId { get; set; }

        [ForeignKey(nameof(ApplicationUserId))]
        public ApplicationUser ApplicationUser { get; set; }

        [Required]
        public string Statut { get; set; } // Disponible / Occupe

        // Navigation
        public Vehicule Vehicule { get; set; }

        public ICollection<DemandeTransport> DemandesAcceptees { get; set; }
            = new List<DemandeTransport>();
    }
}
