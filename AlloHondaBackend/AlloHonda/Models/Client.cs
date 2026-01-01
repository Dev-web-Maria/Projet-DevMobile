using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Collections.Generic;

namespace AlloHonda.Models
{
    public class Client
    {
        [Key]
        public int IdClient { get; set; }

        // 🔗 Lien Identity
        [Required]
        public string ApplicationUserId { get; set; }

        [ForeignKey(nameof(ApplicationUserId))]
        public virtual ApplicationUser ApplicationUser { get; set; }

        // Navigation
        public virtual ICollection<DemandeTransport> Demandes { get; set; }
            = new List<DemandeTransport>();
    }
}
