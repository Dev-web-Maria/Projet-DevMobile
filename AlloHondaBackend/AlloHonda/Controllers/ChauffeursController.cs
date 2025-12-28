// ChauffeurController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using AlloHonda.Data;
using AlloHanda.Models;
using Microsoft.AspNetCore.Authorization;
using AlloHonda.Models;

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
}