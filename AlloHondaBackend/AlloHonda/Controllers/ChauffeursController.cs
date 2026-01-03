// ChauffeurController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AlloHonda.Data;
using AlloHonda.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace AlloHonda.Controllers
{
    public class ChauffeurController : ControllerBase
    {
        private readonly AlloHondaContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public ChauffeurController(
            AlloHondaContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        // GET: api/Chauffeur/Available
        [HttpGet]
        [Route("api/Chauffeur")]
        public async Task<IActionResult> GetAvailable()
        {
            try
            {
                var availableChauffeurs = await _context.Chauffeur
                    .Include(c => c.ApplicationUser)
                    .Include(c => c.Vehicule)
                    .Where(c => c.Statut == "Disponible" || c.Statut == "Occupe") // Filtrer par statut
                    .Select(c => new
                    {
                        c.IdChauffeur,
                        Nom = c.ApplicationUser.Nom,
                        Prenom = c.ApplicationUser.Prenom,
                        Email = c.ApplicationUser.Email,
                        Telephone = c.ApplicationUser.PhoneNumber ?? c.ApplicationUser.Telephone,
                        c.Statut,
                        NumeroPermis = c.NumeroPermis,
                        Vehicule = c.Vehicule != null ? new
                        {
                            c.Vehicule.IdVehicule,
                            c.Vehicule.Type,
                            c.Vehicule.Marque,
                            c.Vehicule.Modele,
                            c.Vehicule.Immatriculation,
                            c.Vehicule.Capacite,
                            c.Vehicule.Annee,
                            c.Vehicule.Couleur
                        } : null
                    })
                    .OrderBy(c => c.Statut == "Disponible" ? 0 : 1) // Dispos d'abord
                    .ThenBy(c => c.Nom)
                    .ToListAsync();

                return Ok(availableChauffeurs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = "Erreur lors de la récupération des chauffeurs",
                    details = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }
        //public async Task<IActionResult> GetAvailable()
        //{
        //    try
        //    {
        //        var availableChauffeurs = await _context.Chauffeur
        //            .Include(c => c.ApplicationUser)
        //            .Include(c => c.Vehicule)
        //            .Where(c => c.Statut == "Disponible")
        //            .Select(c => new
        //            {
        //                c.IdChauffeur,
        //                Nom = c.ApplicationUser.Nom,
        //                Prenom = c.ApplicationUser.Prenom,
        //                Telephone = c.ApplicationUser.PhoneNumber,
        //                c.Statut,
        //                Vehicule = c.Vehicule != null ? new
        //                {
        //                    c.Vehicule.Type,
        //                    c.Vehicule.Immatriculation,
        //                    c.Vehicule.Capacite
        //                } : null
        //            })
        //            .ToListAsync();

        //        return Ok(availableChauffeurs);
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { success = false, error = "Erreur lors de la récupération des chauffeurs", details = ex.Message });
        //    }
        //}

        // PUT: api/Chauffeur/UpdateStatus/5
        [HttpPut]
        [Route("api/Chauffeur/UpdateStatus/{id}")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] string newStatus)
        {
            try
            {
                var chauffeur = await _context.Chauffeur.FindAsync(id);
                if (chauffeur == null)
                    return NotFound(new { success = false, message = "Chauffeur non trouvé" });

                chauffeur.Statut = newStatus;
                await _context.SaveChangesAsync();

                return Ok(new { success = true, statut = chauffeur.Statut });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur lors de la mise à jour du statut", details = ex.Message });
            }
        }

        // PUT: api/Chauffeur/UpdateProfile/5
        [HttpPut]
        [Route("api/Chauffeur/UpdateProfile/{id}")]
        public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateChauffeurProfileRequest request)
        {
            try
            {
                var chauffeur = await _context.Chauffeur
                    .Include(c => c.ApplicationUser)
                    .FirstOrDefaultAsync(c => c.IdChauffeur == id);

                if (chauffeur == null)
                    return NotFound(new { success = false, message = "Chauffeur non trouvé" });

                // Mise à jour de l'ApplicationUser
                var user = chauffeur.ApplicationUser;
                user.Nom = request.Nom;
                user.Prenom = request.Prenom;
                user.PhoneNumber = request.Telephone;
                user.Telephone = request.Telephone;
                user.Adresse = request.Adresse;
                user.Ville = request.Ville;

                // Mise à jour du Chauffeur
                chauffeur.NumeroPermis = request.NumeroPermis;

                await _context.SaveChangesAsync();

                return Ok(new 
                { 
                    success = true, 
                    message = "Profil mis à jour avec succès",
                    user = new
                    {
                        nom = user.Nom,
                        prenom = user.Prenom,
                        telephone = user.Telephone,
                        adresse = user.Adresse,
                        ville = user.Ville,
                        numeroPermis = chauffeur.NumeroPermis
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur lors de la mise à jour du profil", details = ex.Message });
            }
        }

        // POST: api/Chauffeur/Create
        [HttpPost]
        [Route("api/Chauffeur/Create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateChauffeurRequest request)
        {
            try
            {
                Console.WriteLine($"=== Création chauffeur: {request.Email} ===");

                // Validation
                if (string.IsNullOrEmpty(request.Email) || !request.Email.Contains("@"))
                    return BadRequest(new { success = false, error = "Email invalide" });

                if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 6)
                    return BadRequest(new { success = false, error = "Mot de passe invalide" });

                // Vérifier si l'email existe
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                    return BadRequest(new { success = false, error = "Email déjà utilisé" });

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Créer l'ApplicationUser
                    var user = new ApplicationUser
                    {
                        UserName = request.Email,
                        Email = request.Email,
                        Nom = request.Nom,
                        Prenom = request.Prenom,
                        PhoneNumber = request.Telephone,
                        Telephone = request.Telephone,
                        Adresse = request.Adresse,
                        Ville = request.Ville,
                        DateNaissance = request.DateNaissance,
                        EmailConfirmed = true
                    };

                    var result = await _userManager.CreateAsync(user, request.Password);

                    if (!result.Succeeded)
                    {
                        var errors = result.Errors.Select(e => e.Description);
                        return BadRequest(new { success = false, errors });
                    }

                    // 2. Ajouter le rôle "Chauffeur"
                    if (!await _roleManager.RoleExistsAsync("Chauffeur"))
                        await _roleManager.CreateAsync(new IdentityRole("Chauffeur"));

                    await _userManager.AddToRoleAsync(user, "Chauffeur");

                    // 3. Créer l'entité Chauffeur
                    var chauffeur = new Chauffeur
                    {
                        ApplicationUserId = user.Id,
                        Statut = "Disponible" // Statut par défaut
                    };

                    _context.Chauffeur.Add(chauffeur);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    return Ok(new
                    {
                        success = true,
                        message = "Compte chauffeur créé avec succès",
                        user = new
                        {
                            id = user.Id,
                            email = user.Email,
                            nom = user.Nom,
                            prenom = user.Prenom,
                            telephone = user.Telephone,
                            roles = new[] { "Chauffeur" }
                        },
                        chauffeurId = chauffeur.IdChauffeur,
                        statut = chauffeur.Statut
                    });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    return StatusCode(500, new
                    {
                        success = false,
                        error = "Erreur création chauffeur",
                        details = ex.Message
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    error = "Erreur interne",
                    details = ex.Message
                });
            }
        }
        // GET: api/Chauffeur/GetMissions/5
        [HttpGet]
        [Route("api/Chauffeur/GetMissions/{id}")]
        public async Task<IActionResult> GetMissions(int id)
        {
            try
            {
                var missions = await _context.DemandeTransport
                    .Include(d => d.Client)
                        .ThenInclude(c => c.ApplicationUser)
                    .Include(d => d.Trajet)
                    .Where(d => d.ChauffeurId == id)
                    .Select(d => new
                    {
                        id = d.IdDemande.ToString(),
                        idDemande = d.IdDemande,
                        type = d.TypeMarchandise,
                        from = d.Depart,
                        to = d.Arrivee,
                        status = d.Statut,
                        statut = d.Statut,
                        progress = d.Statut == "TERMINEE" ? 100 : d.Statut == "EN_COURS" ? 50 : 0,
                        scheduledTime = d.HeureDepart,
                        dateDepart = d.DateDepart,
                        distance = d.Trajet != null ? d.Trajet.Distance + " km" : "N/A",
                        duration = d.Trajet != null ? d.Trajet.DureeEstimee + " min" : "N/A",
                        items = d.Volume > 0 ? (int)Math.Max(1, d.Volume * 2) : 1, // Mock item count based on volume
                        weight = d.Poids + " kg",
                        customer = (d.Client != null && d.Client.ApplicationUser != null) ? $"{d.Client.ApplicationUser.Prenom} {d.Client.ApplicationUser.Nom}" : "Client Inconnu",
                        customerPhone = (d.Client != null && d.Client.ApplicationUser != null) ? d.Client.ApplicationUser.PhoneNumber : "",
                        payment = d.PrixEstime + "€",
                        prixEstime = d.PrixEstime,
                        departCoord = d.DepartCoord,
                        arriveeCoord = d.ArriveeCoord
                    })
                    .OrderByDescending(m => m.idDemande)
                    .ToListAsync();

                return Ok(new { success = true, missions });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur récupération missions", details = ex.Message });
            }
        }

        // PUT: api/Chauffeur/UpdateMissionProgress/5
        [HttpPut]
        [Route("api/Chauffeur/UpdateMissionProgress/{id}")]
        public async Task<IActionResult> UpdateMissionProgress(int id, [FromBody] UpdateProgressRequest request)
        {
            try
            {
                var demande = await _context.DemandeTransport.FindAsync(id);
                if (demande == null)
                    return NotFound(new { success = false, message = "Mission non trouvée" });

                // Si progress est fourni, on peut ajuster le statut automatiquement
                if (request.Progress >= 100)
                {
                    demande.Statut = "TERMINEE";
                }
                else if (request.Progress > 0)
                {
                    demande.Statut = "EN_COURS";
                }

                await _context.SaveChangesAsync();
                return Ok(new { success = true, statut = demande.Statut });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur mise à jour progression", details = ex.Message });
            }
        }

        // GET: api/Chauffeur/GetVehicle/5
        [HttpGet]
        [Route("api/Chauffeur/GetVehicle/{id}")]
        public async Task<IActionResult> GetVehicle(int id)
        {
            try
            {
                var chauffeur = await _context.Chauffeur
                    .Include(c => c.Vehicule)
                    .FirstOrDefaultAsync(c => c.IdChauffeur == id);

                if (chauffeur == null)
                    return NotFound(new { success = false, message = "Chauffeur non trouvé" });

                if (chauffeur.Vehicule == null)
                    return Ok(new { success = true, hasVehicle = false });

                return Ok(new
                {
                    success = true,
                    hasVehicle = true,
                    vehicle = new
                    {
                        chauffeur.Vehicule.IdVehicule,
                        chauffeur.Vehicule.Type,
                        chauffeur.Vehicule.Marque,
                        chauffeur.Vehicule.Modele,
                        chauffeur.Vehicule.Immatriculation,
                        chauffeur.Vehicule.Capacite,
                        chauffeur.Vehicule.Annee,
                        chauffeur.Vehicule.Couleur,
                        chauffeur.Vehicule.TypeEnergie,
                        chauffeur.Vehicule.DateAssuranceExpire,
                        chauffeur.Vehicule.Kilometrage
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur récupération véhicule", details = ex.Message });
            }
        }

        // POST: api/Chauffeur/UpdateVehicle/5
        [HttpPost]
        [Route("api/Chauffeur/UpdateVehicle/{id}")]
        public async Task<IActionResult> UpdateVehicle(int id, [FromBody] VehiculeRequest request)
        {
            try
            {
                var chauffeur = await _context.Chauffeur
                    .Include(c => c.Vehicule)
                    .FirstOrDefaultAsync(c => c.IdChauffeur == id);

                if (chauffeur == null)
                    return NotFound(new { success = false, message = "Chauffeur non trouvé" });

                var vehicule = chauffeur.Vehicule;

                if (vehicule == null)
                {
                    vehicule = new Vehicule
                    {
                        ChauffeurId = id,
                        DateCreation = DateTime.Now,
                        Statut = "Actif"
                    };
                    _context.Vehicule.Add(vehicule);
                    chauffeur.Vehicule = vehicule; // Lié explicitement
                }

                // Mapping complet de tous les champs envoyés par le frontend
                vehicule.Type = request.Type;
                vehicule.Marque = request.Marque;
                vehicule.Modele = request.Modele;
                vehicule.Immatriculation = request.Immatriculation;
                vehicule.Capacite = request.Capacite;
                vehicule.Annee = request.Annee;
                vehicule.Couleur = request.Couleur;
                vehicule.TypeEnergie = request.TypeEnergie;
                
                vehicule.ConsommationMoyenne = request.ConsommationMoyenne;
                vehicule.Autonomie = request.Autonomie;
                vehicule.ImageUrl = request.ImageUrl;
                vehicule.ImageBase64 = request.ImageBase64;
                
                vehicule.DateAssuranceExpire = request.DateAssuranceExpire;
                vehicule.DateDerniereRevision = request.DateDerniereRevision;
                vehicule.DateProchaineRevision = request.DateProchaineRevision;
                
                vehicule.Kilometrage = request.Kilometrage;
                vehicule.NumeroChassis = request.NumeroChassis;
                vehicule.Observations = request.Observations;
                
                vehicule.DateModification = DateTime.Now;

                await _context.SaveChangesAsync();

                return Ok(new
                {
                    success = true,
                    message = "Véhicule mis à jour avec succès",
                    vehicle = new
                    {
                        vehicule.IdVehicule,
                        vehicule.Type,
                        vehicule.Marque,
                        vehicule.Modele,
                        vehicule.Immatriculation,
                        vehicule.Capacite,
                        vehicule.Annee,
                        vehicule.Couleur,
                        vehicule.TypeEnergie,
                        vehicule.ConsommationMoyenne,
                        vehicule.Autonomie,
                        vehicule.DateAssuranceExpire,
                        vehicule.Kilometrage,
                        vehicule.NumeroChassis,
                        vehicule.Observations
                    }
                });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message;
                return StatusCode(500, new { 
                    success = false, 
                    error = "Erreur mise à jour véhicule", 
                    details = ex.Message,
                    inner = innerMessage
                });
            }
        }

        // PUT: api/Chauffeur/UpdatePosition/5
        [HttpPut]
        [Route("api/Chauffeur/UpdatePosition/{id}")]
        public async Task<IActionResult> UpdatePosition(int id, [FromBody] UpdatePositionRequest request)
        {
            try
            {
                var chauffeur = await _context.Chauffeur.FindAsync(id);
                if (chauffeur == null)
                    return NotFound(new { success = false, message = "Chauffeur non trouvé" });

                chauffeur.Latitude = request.Latitude;
                chauffeur.Longitude = request.Longitude;

                await _context.SaveChangesAsync();
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { success = false, error = "Erreur mise à jour position", details = ex.Message });
            }
        }

        public class UpdatePositionRequest
        {
            public double Latitude { get; set; }
            public double Longitude { get; set; }
        }

        public class VehiculeRequest
        {
            public string? Type { get; set; }
            public string? Marque { get; set; }
            public string? Modele { get; set; }
            public string? Immatriculation { get; set; }
            public double Capacite { get; set; }
            public int? Annee { get; set; }
            public string? Couleur { get; set; }
            public string? TypeEnergie { get; set; }
            public decimal? ConsommationMoyenne { get; set; }
            public decimal? Autonomie { get; set; }
            public string? ImageUrl { get; set; }
            public string? ImageBase64 { get; set; }
            public DateTime? DateAssuranceExpire { get; set; }
            public DateTime? DateDerniereRevision { get; set; }
            public DateTime? DateProchaineRevision { get; set; }
            public int? Kilometrage { get; set; }
            public string? NumeroChassis { get; set; }
            public string? Observations { get; set; }
        }

        public class UpdateProgressRequest
        {
            public int Progress { get; set; }
        }
    }


    public class CreateChauffeurRequest
    {
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Telephone { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public DateTime DateNaissance { get; set; }
    }

    public class UpdateChauffeurProfileRequest
    {
        public string Nom { get; set; }
        public string Prenom { get; set; }
        public string Telephone { get; set; }
        public string Adresse { get; set; }
        public string Ville { get; set; }
        public string NumeroPermis { get; set; }
    }
}
