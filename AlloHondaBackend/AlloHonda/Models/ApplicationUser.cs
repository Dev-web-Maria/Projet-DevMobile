using AlloHanda.Models;
using Microsoft.AspNetCore.Identity;

namespace AlloHonda.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Telephone { get; set; }
        public DateTime DateNaissance { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string? PhotoProfil { get; set; }


        // Navigation (1–1)
        public Client Client { get; set; }
        public Chauffeur Chauffeur { get; set; }
    }
}
