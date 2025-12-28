using AlloHonda.Models;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlloHanda.Models
{
    public class Client
    {
        [Key]
        public int IdClient { get; set; }

        // 🔗 Lien Identity
        [Required]
        public string ApplicationUserId { get; set; }

        [ForeignKey(nameof(ApplicationUserId))]
        public ApplicationUser ApplicationUser { get; set; }

        // Navigation
        public ICollection<DemandeTransport> Demandes { get; set; }
            = new List<DemandeTransport>();
    }
}

