using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using AlloHonda.Data;
using AlloHonda.Models;


namespace AlloHonda.Controllers
{
    [Route("api/[controller]")]  // ← AJOUTER CETTE LIGNE
    [ApiController]              // ← AJOUTER CETTE LIGNE
    public class AuthController : ControllerBase
    {
        private readonly AlloHondaContext _context;
        private readonly IConfiguration _configuration;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;

        public AuthController(
            AlloHondaContext context,
            IConfiguration configuration,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager)
        {
            _context = context;
            _configuration = configuration;
            _userManager = userManager;
            _signInManager = signInManager;
        }

        
        [HttpPost("Login")]

        public async Task<IActionResult> Login([FromBody] LoginModel model)
        {
            try
            {
                Console.WriteLine(model.Email + " , " + model.Password);

                // Validation des entrées
                if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Password))
                {
                    return BadRequest(new { success = false, message = "Email et mot de passe requis" });
                }

                // Nettoyer et valider l'email
                model.Email = model.Email.Trim().ToLower();
                if (!IsValidEmail(model.Email))
                {
                    return BadRequest(new { success = false, message = "Format d'email invalide" });
                }

                // Chercher l'utilisateur dans ApplicationUser (Identity)
                var user = await _userManager.FindByEmailAsync(model.Email);

                if (user == null)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Email ou mot de passe incorrect"
                    });
                }

                // Vérifier le mot de passe avec Identity
                var passwordValid = await _userManager.CheckPasswordAsync(user, model.Password);

                if (!passwordValid)
                {
                    return Unauthorized(new
                    {
                        success = false,
                        message = "Email ou mot de passe incorrect"
                    });
                }

                // Déterminer le type d'utilisateur et récupérer toutes les données
                string userType = "client";
                int? clientId = null;
                int? chauffeurId = null;
                object userData = null;

                // Vérifier si c'est un client
                var client = await _context.Client
                    .Include(c => c.ApplicationUser)
                    .Include(c => c.Demandes)
                        .ThenInclude(d => d.Trajet)
                    .Include(c => c.Demandes)
                        .ThenInclude(d => d.Chauffeur)
                            .ThenInclude(ch => ch.ApplicationUser)
                    .FirstOrDefaultAsync(c => c.ApplicationUserId == user.Id);

                if (client != null)
                {
                    userType = "client";
                    clientId = client.IdClient;

                    // Récupérer toutes les données du client
                    userData = new
                    {
                        // Informations de base
                        idClient = client.IdClient,

                        // Toutes les demandes du client avec détails
                        demandes = client.Demandes.Select(d => new
                        {
                            idDemande = d.IdDemande,
                            depart = d.Depart,
                            arrivee = d.Arrivee,
                            typeMarchandise = d.TypeMarchandise,
                            descriptionMarchandise = d.DescriptionMarchandise,
                            poids = d.Poids,
                            volume = d.Volume,
                            dateDepart = d.DateDepart.ToString("yyyy-MM-dd"),
                            heureDepart = d.HeureDepart,
                            instructions = d.Instructions,
                            statut = d.Statut,
                            prixEstime = d.PrixEstime,

                            // Information sur le trajet si disponible
                            trajet = d.Trajet != null ? new
                            {
                                idTrajet = d.Trajet.IdTrajet,
                                adresseDepart = d.Trajet.AdresseDepart,
                                adresseArrivee = d.Trajet.AdresseArrivee,
                                distance = d.Trajet.Distance,
                                dureeEstimee = d.Trajet.DureeEstimee
                            } : null,

                            // Information sur le chauffeur assigné si disponible
                            chauffeur = d.Chauffeur != null ? new
                            {
                                idChauffeur = d.Chauffeur.IdChauffeur,
                                statut = d.Chauffeur.Statut,
                                nom = d.Chauffeur.ApplicationUser?.Nom,
                                prenom = d.Chauffeur.ApplicationUser?.Prenom,
                                telephone = d.Chauffeur.ApplicationUser?.Telephone
                            } : null
                        }).OrderByDescending(d => d.dateDepart).ToList(),

                        // Statistiques des demandes
                        statistiquesDemandes = new
                        {
                            totalDemandes = client.Demandes.Count,
                            demandesEnAttente = client.Demandes.Count(d => d.Statut == "EN_ATTENTE"),
                            demandesAcceptees = client.Demandes.Count(d => d.Statut == "ACCEPTEE"),
                            demandesEnCours = client.Demandes.Count(d => d.Statut == "EN_COURS"),
                            demandesTerminees = client.Demandes.Count(d => d.Statut == "TERMINEE")
                        }
                    };
                }
                else
                {
                    // Vérifier si c'est un chauffeur
                    var chauffeur = await _context.Chauffeur
                        .Include(c => c.ApplicationUser)
                        .Include(c => c.Vehicule)
                        .Include(c => c.DemandesAcceptees)
                            .ThenInclude(d => d.Client)
                                .ThenInclude(cl => cl.ApplicationUser)
                        .Include(c => c.DemandesAcceptees)
                            .ThenInclude(d => d.Trajet)
                        .FirstOrDefaultAsync(c => c.ApplicationUserId == user.Id);

                    if (chauffeur != null)
                    {
                        userType = "chauffeur";
                        chauffeurId = chauffeur.IdChauffeur;

                        // Récupérer toutes les données du chauffeur
                        userData = new
                        {
                            // Informations de base
                            idChauffeur = chauffeur.IdChauffeur,
                            statut = chauffeur.Statut,
                            numeroPermis = chauffeur.NumeroPermis,

                            // Véhicule du chauffeur
                            vehicule = chauffeur.Vehicule != null ? new
                            {
                                idVehicule = chauffeur.Vehicule.IdVehicule,
                                type = chauffeur.Vehicule.Type,
                                capacite = chauffeur.Vehicule.Capacite,
                                immatriculation = chauffeur.Vehicule.Immatriculation
                            } : null,

                            // Toutes les demandes acceptées par le chauffeur
                            demandesAcceptees = chauffeur.DemandesAcceptees.Select(d => new
                            {
                                idDemande = d.IdDemande,
                                depart = d.Depart,
                                arrivee = d.Arrivee,
                                typeMarchandise = d.TypeMarchandise,
                                descriptionMarchandise = d.DescriptionMarchandise,
                                poids = d.Poids,
                                volume = d.Volume,
                                dateDepart = d.DateDepart.ToString("yyyy-MM-dd"),
                                heureDepart = d.HeureDepart,
                                instructions = d.Instructions,
                                statut = d.Statut,
                                prixEstime = d.PrixEstime,

                                // Information sur le trajet si disponible
                                trajet = d.Trajet != null ? new
                                {
                                    idTrajet = d.Trajet.IdTrajet,
                                    adresseDepart = d.Trajet.AdresseDepart,
                                    adresseArrivee = d.Trajet.AdresseArrivee,
                                    distance = d.Trajet.Distance,
                                    dureeEstimee = d.Trajet.DureeEstimee
                                } : null,

                                // Information sur le client
                                client = d.Client != null ? new
                                {
                                    idClient = d.Client.IdClient,
                                    nom = d.Client.ApplicationUser?.Nom,
                                    prenom = d.Client.ApplicationUser?.Prenom,
                                    telephone = d.Client.ApplicationUser?.Telephone,
                                    email = d.Client.ApplicationUser?.Email
                                } : null
                            }).OrderByDescending(d => d.dateDepart).ToList(),

                            // Statistiques des demandes
                            statistiquesDemandes = new
                            {
                                totalDemandesAcceptees = chauffeur.DemandesAcceptees.Count,
                                demandesEnAttente = chauffeur.DemandesAcceptees.Count(d => d.Statut == "EN_ATTENTE"),
                                demandesAcceptees = chauffeur.DemandesAcceptees.Count(d => d.Statut == "ACCEPTEE"),
                                demandesEnCours = chauffeur.DemandesAcceptees.Count(d => d.Statut == "EN_COURS"),
                                demandesTerminees = chauffeur.DemandesAcceptees.Count(d => d.Statut == "TERMINEE")
                            },

                            // Information de disponibilité
                            disponibilite = new
                            {
                                estDisponible = chauffeur.Statut == "Disponible",
                                statutActuel = chauffeur.Statut,
                                nombreTrajetsEnCours = chauffeur.DemandesAcceptees.Count(d => d.Statut == "EN_COURS")
                            }
                        };

                        
                    }
                    else
                    {
                        return Unauthorized(new
                        {
                            success = false,
                            message = "Compte utilisateur non configuré"
                        });
                    }
                }

                // Générer un token JWT
                var token = GenerateJwtToken(user.Email, userType == "client" ? "Client" : "Chauffeur", user.Id);

                Console.WriteLine();
                return Ok(new
                {
                    success = true,
                    message = $"Connexion {userType} réussie",
                    user = new
                    {
                        id = user.Id,
                        email = user.Email,
                        nom = user.Nom,
                        prenom = user.Prenom,
                        telephone = user.Telephone,
                        DateNaissance = user.DateNaissance.ToString("yyyy-MM-dd"),
                        adresse = user.Adresse,
                        ville = user.Ville,
                        photoProfil = user.PhotoProfil,
                        Roles = new[] { userType == "client" ? "Client" : "Chauffeur" },
                        UserType = userType,
                        ClientId = clientId,
                        ChauffeurId = chauffeurId,
                        UserData = userData,
                        Token = token
                    },
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la connexion: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur interne du serveur",
                    error = ex.Message
                });
            }
        }


        [HttpPost("CheckEmail")]
        public async Task<IActionResult> CheckEmail([FromBody] EmailCheckModel model)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(model.Email))
                {
                    return BadRequest(new { success = false, message = "Email requis" });
                }

                model.Email = model.Email.Trim().ToLower();

                // Vérifier si l'email existe déjà dans ApplicationUser
                var userExists = await _userManager.FindByEmailAsync(model.Email) != null;

                // Déterminer le type d'utilisateur si l'email existe
                string userType = null;
                if (userExists)
                {
                    var user = await _userManager.FindByEmailAsync(model.Email);

                    // Vérifier si c'est un client
                    var isClient = await _context.Client
                        .AnyAsync(c => c.ApplicationUserId == user.Id);

                    if (isClient)
                    {
                        userType = "client";
                    }
                    else
                    {
                        // Vérifier si c'est un chauffeur
                        var isChauffeur = await _context.Chauffeur
                            .AnyAsync(c => c.ApplicationUserId == user.Id);

                        if (isChauffeur)
                        {
                            userType = "chauffeur";
                        }
                    }
                }

                return Ok(new
                {
                    success = true,
                    exists = userExists,
                    userType = userType,
                    message = userExists ? "Cet email est déjà utilisé" : "Email disponible"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Erreur interne du serveur",
                    error = ex.Message
                });
            }
        }

        private string GenerateJwtToken(string email, string role, string userId)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.NameIdentifier, userId),
                new Claim(ClaimTypes.Role, role),
                new Claim("userId", userId)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool IsValidEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            try
            {
                return Regex.IsMatch(email,
                    @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
                    RegexOptions.IgnoreCase);
            }
            catch
            {
                return false;
            }
        }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class EmailCheckModel
    {
        public string Email { get; set; }
    }

    public class RegisterModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Telephone { get; set; }
        public string? Adresse { get; set; }
        public string? Ville { get; set; }
        public DateTime? DateNaissance { get; set; }
        public string? PhotoProfil { get; set; }
        public string UserType { get; set; } // "client" ou "chauffeur"
    }
}