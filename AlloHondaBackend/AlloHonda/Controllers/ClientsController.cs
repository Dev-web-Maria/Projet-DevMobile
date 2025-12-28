using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using AlloHanda.Models;
using AlloHonda.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using AlloHonda.Models;

namespace AlloHonda.Controllers
{
    public class ClientsController : Controller
    {
        private readonly AlloHondaContext _context;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public ClientsController(
            AlloHondaContext context,
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager)
        {
            _context = context;
            _userManager = userManager;
            _roleManager = roleManager;
        }

        [HttpPost]
        [Route("api/Clients/Create")]
        [AllowAnonymous]
        public async Task<IActionResult> Create([FromBody] CreateClientRequest request)
        {
            try
            {
                Console.WriteLine($"=== Début création client ===");
                Console.WriteLine($"Email: {request.Email}, Nom: {request.Nom}, Prénom: {request.Prenom}");

                // Validation simple
                if (string.IsNullOrEmpty(request.Email) || !request.Email.Contains("@"))
                    return BadRequest(new { success = false, error = "Email invalide" });

                if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 6)
                    return BadRequest(new { success = false, error = "Le mot de passe doit contenir au moins 6 caractères" });

                // Vérifier si l'email existe déjà
                var existingUser = await _userManager.FindByEmailAsync(request.Email);
                if (existingUser != null)
                    return BadRequest(new { success = false, error = "Cet email est déjà utilisé" });

                using var transaction = await _context.Database.BeginTransactionAsync();

                try
                {
                    // 1. Créer l'ApplicationUser avec Identity
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
                        EmailConfirmed = true // Simplifier pour le développement
                    };

                    Console.WriteLine($"Création de l'utilisateur: {user.Email}");

                    // Utiliser Identity pour créer l'utilisateur
                    var result = await _userManager.CreateAsync(user, request.Password);

                    if (!result.Succeeded)
                    {
                        var errors = result.Errors.Select(e => e.Description).ToList();
                        Console.WriteLine($"Erreurs création utilisateur: {string.Join(", ", errors)}");
                        return BadRequest(new { success = false, errors });
                    }

                    Console.WriteLine($"Utilisateur créé avec ID: {user.Id}");

                    // 2. Ajouter le rôle "Client" avec Identity
                    Console.WriteLine("Vérification rôle Client...");
                    if (!await _roleManager.RoleExistsAsync("Client"))
                    {
                        Console.WriteLine("Création du rôle Client...");
                        await _roleManager.CreateAsync(new IdentityRole("Client"));
                    }

                    await _userManager.AddToRoleAsync(user, "Client");
                    Console.WriteLine($"Rôle Client ajouté à l'utilisateur: {user.Id}");

                    // 3. Créer l'entité Client liée
                    var client = new Client
                    {
                        ApplicationUserId = user.Id
                    };

                    Console.WriteLine($"Création du client avec ApplicationUserId: {client.ApplicationUserId}");

                    _context.Client.Add(client);

                    Console.WriteLine("Sauvegarde dans la base de données...");
                    await _context.SaveChangesAsync();
                    Console.WriteLine($"Client sauvegardé avec ID: {client.IdClient}");

                    // 4. Mettre à jour la navigation
                    user.Client = client;
                    await _userManager.UpdateAsync(user);

                    await transaction.CommitAsync();
                    Console.WriteLine("Transaction commitée avec succès");

                    // Retourner la réponse
                    return Ok(new
                    {
                        success = true,
                        message = "Compte client créé avec succès",
                        user = new
                        {
                            id = user.Id,
                            email = user.Email,
                            nom = user.Nom,
                            prenom = user.Prenom,
                            telephone = user.Telephone,
                            roles = await _userManager.GetRolesAsync(user)
                        },
                        clientId = client.IdClient
                    });
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERREUR dans le bloc transaction: {ex.Message}");
                    Console.WriteLine($"StackTrace: {ex.StackTrace}");

                    if (ex.InnerException != null)
                    {
                        Console.WriteLine($"INNER EXCEPTION: {ex.InnerException.Message}");
                        Console.WriteLine($"INNER StackTrace: {ex.InnerException.StackTrace}");
                    }

                    await transaction.RollbackAsync();
                    Console.WriteLine("Transaction rollback");

                    return StatusCode(500, new
                    {
                        success = false,
                        error = "Erreur lors de la création du compte client",
                        details = ex.Message,
                        innerDetails = ex.InnerException?.Message,
                        stackTrace = ex.StackTrace
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"ERREUR GÉNÉRALE: {ex.Message}");
                Console.WriteLine($"StackTrace: {ex.StackTrace}");

                return StatusCode(500, new
                {
                    success = false,
                    error = "Erreur interne du serveur",
                    details = ex.Message,
                    innerDetails = ex.InnerException?.Message
                });
            }
        }

        // GET: api/Clients/{id}
        [HttpGet("api/Clients/{id}")]
        [Authorize] // Protéger avec Identity
        public async Task<IActionResult> GetClient(int id)
        {
            var client = await _context.Client
                .Include(c => c.ApplicationUser)
                .FirstOrDefaultAsync(c => c.IdClient == id);

            if (client == null || client.ApplicationUser == null)
                return NotFound(new { success = false, error = "Client non trouvé" });

            // Vérifier les autorisations (optionnel)
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null || currentUser.Id != client.ApplicationUserId)
                return Forbid();

            return Ok(new
            {
                success = true,
                client = new
                {
                    id = client.IdClient,
                    user = new
                    {
                        id = client.ApplicationUser.Id,
                        email = client.ApplicationUser.Email,
                        nom = client.ApplicationUser.Nom,
                        prenom = client.ApplicationUser.Prenom,
                        telephone = client.ApplicationUser.Telephone,
                        adresse = client.ApplicationUser.Adresse,
                        ville = client.ApplicationUser.Ville,
                        dateNaissance = client.ApplicationUser.DateNaissance,
                        photoProfil = client.ApplicationUser.PhotoProfil
                    }
                }
            });
        }

        // GET: api/Clients/me (pour obtenir le client courant)
        [HttpGet("api/Clients/me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentClient()
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            var client = await _context.Client
                .Include(c => c.ApplicationUser)
                .FirstOrDefaultAsync(c => c.ApplicationUserId == currentUser.Id);

            if (client == null)
                return NotFound(new { success = false, error = "Profil client non trouvé" });

            return Ok(new
            {
                success = true,
                client = new
                {
                    id = client.IdClient,
                    user = new
                    {
                        id = client.ApplicationUser.Id,
                        email = client.ApplicationUser.Email,
                        nom = client.ApplicationUser.Nom,
                        prenom = client.ApplicationUser.Prenom,
                        telephone = client.ApplicationUser.Telephone,
                        adresse = client.ApplicationUser.Adresse,
                        ville = client.ApplicationUser.Ville,
                        dateNaissance = client.ApplicationUser.DateNaissance,
                        photoProfil = client.ApplicationUser.PhotoProfil
                    }
                }
            });
        }

        // PUT: api/Clients/me (mettre à jour le profil)
        [HttpPut("api/Clients/me")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser == null)
                return Unauthorized();

            // Mettre à jour les propriétés
            currentUser.Nom = request.Nom ?? currentUser.Nom;
            currentUser.Prenom = request.Prenom ?? currentUser.Prenom;
            currentUser.Telephone = request.Telephone ?? currentUser.Telephone;
            currentUser.Adresse = request.Adresse ?? currentUser.Adresse;
            currentUser.Ville = request.Ville ?? currentUser.Ville;
            currentUser.DateNaissance = request.DateNaissance;

            var result = await _userManager.UpdateAsync(currentUser);

            if (!result.Succeeded)
                return BadRequest(new { success = false, errors = result.Errors.Select(e => e.Description) });

            return Ok(new
            {
                success = true,
                message = "Profil mis à jour avec succès",
                user = new
                {
                    id = currentUser.Id,
                    email = currentUser.Email,
                    nom = currentUser.Nom,
                    prenom = currentUser.Prenom,
                    telephone = currentUser.Telephone,
                    adresse = currentUser.Adresse,
                    ville = currentUser.Ville,
                    dateNaissance = currentUser.DateNaissance
                }
            });
        }

        // --- Classes Request pour l'API ---
        public class CreateClientRequest
        {
            public string Nom { get; set; }
            public string Prenom { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
            public string Telephone { get; set; }
            public DateTime DateNaissance { get; set; }
            public string Adresse { get; set; }
            public string Ville { get; set; }
        }

        public class UpdateProfileRequest
        {
            public string Nom { get; set; }
            public string Prenom { get; set; }
            public string Telephone { get; set; }
            public string Adresse { get; set; }
            public string Ville { get; set; }
            public DateTime DateNaissance { get; set; }
            public string PhotoProfil { get; set; }
        }

        // --- Méthodes MVC pour les vues ---
        public async Task<IActionResult> Index()
        {
            var clients = await _context.Client
                .Include(c => c.ApplicationUser)
                .ToListAsync();
            return View(clients);
        }

        public async Task<IActionResult> Details(int id)
        {
            var client = await _context.Client
                .Include(c => c.ApplicationUser)
                .FirstOrDefaultAsync(m => m.IdClient == id);

            if (client == null)
                return NotFound();

            return View(client);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("ApplicationUserId")] Client client)
        {
            if (ModelState.IsValid)
            {
                _context.Add(client);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(client);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("IdClient,ApplicationUserId")] Client client)
        {
            if (id != client.IdClient)
                return NotFound();

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(client);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ClientExists(client.IdClient))
                        return NotFound();
                    throw;
                }
                return RedirectToAction(nameof(Index));
            }
            return View(client);
        }

        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var client = await _context.Client.FindAsync(id);
            if (client != null)
            {
                // Supprimer aussi l'ApplicationUser associé
                var user = await _userManager.FindByIdAsync(client.ApplicationUserId);
                if (user != null)
                    await _userManager.DeleteAsync(user);
            }
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool ClientExists(int id)
        {
            return _context.Client.Any(e => e.IdClient == id);
        }
    }
}