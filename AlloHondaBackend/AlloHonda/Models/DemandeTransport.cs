using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AlloHonda.Models
{
    public class DemandeTransport
    {
        [Key]
        public int IdDemande { get; set; }

        [Required]
        public string Depart { get; set; }

        [Required]
        public string Arrivee { get; set; }

        [Required]
        public string TypeMarchandise { get; set; }

        public string DescriptionMarchandise { get; set; }

        public double Poids { get; set; }
        public double Volume { get; set; }
        public DateTime DateDepart { get; set; }
        public string HeureDepart { get; set; }
        public string Instructions { get; set; }
        public string Statut { get; set; } = "EN_ATTENTE";
        public double PrixEstime { get; set; }

        // Foreign key vers Client (int)
        [Required]
        public int ClientId { get; set; } 

        [ForeignKey(nameof(ClientId))]
        public virtual Client Client { get; set; }

        public int? ChauffeurId { get; set; }
        
        [ForeignKey(nameof(ChauffeurId))]
        public virtual Chauffeur Chauffeur { get; set; }

        public virtual Trajet Trajet { get; set; }
    }
}